# Módulo: Fiscal NFS-e

## Contexto

NFS-e (Nota Fiscal de Serviços Eletrônica) é emitida para prestação de serviços.
Integra com ACBr via endpoint `/nfse/emitir`, seguindo o mesmo padrão do AcbrNFSeService em PHP
(que está documentado no projeto de origem e serve como referência de domínio).

## Dois padrões de layout — iguais ao PHP

| Regime | Layout | Gerador |
|---|---|---|
| MEI (`reg_fiscal = 4`) | Padrão Nacional (DPS) | `gerarIniPadraoNacional()` |
| Demais (Simples, Lucro Presumido) | Padrão Provedor (ISSNet/ABRASF) | `gerarIniPadraoProvedor()` |

## Service NFS-e

```java
@Service
@Transactional
@Slf4j
public class NfseService {

    private final AcbrHttpClient acbrClient;
    private final AcbrIniParser iniParser;
    private final AcbrErrorClassifier errorClassifier;
    private final DocumentoFiscalRepository documentoRepository;
    private final EmpresaConfigService empresaConfigService;
    private final ApplicationEventPublisher eventPublisher;

    public DocumentoFiscal emitir(DocumentoFiscal documento) {
        var empresa = documento.getEmpresa();

        try {
            String iniContent = empresa.getRegFiscal() == 4
                ? gerarIniPadraoNacional(documento)
                : gerarIniPadraoProvedor(documento);

            var payload = Map.of(
                "arquivo_ini", iniContent,
                "numero_rps", documento.getNumero(),
                "imprimir", false,
                "configs", empresaConfigService.getAcbrConfigs(empresa)
            );

            log.info("Enviando NFS-e ID {} para ACBr...", documento.getId());
            var response = acbrClient.post("nfse/emitir", payload);
            return processarResposta(documento, response);

        } catch (AcbrIndisponivelException e) {
            documento.setStatus(DocumentoStatus.PROCESSANDO);
            documento.setMensagemRetorno("Instabilidade: " + e.getMessage());
            documentoRepository.save(documento);
            throw e;
        }
    }

    private DocumentoFiscal processarResposta(DocumentoFiscal doc, AcbrResponse response) {
        // Verifica duplicidade (RPS já processado)
        if (errorClassifier.isDuplicateRps(response.mensagem())) {
            log.warn("NFS-e {}: RPS duplicado. Consultando para recuperar...", doc.getId());
            return consultar(doc);
        }

        var dadosIni = iniParser.parse(response.mensagem());
        var xmlDistribuicao = response.xmlDistribuicao();

        var numeroNota = extrairPrimeiro(dadosIni, "Numero", "NumeroNfse");
        var protocolo = extrairPrimeiro(dadosIni, "Protocolo");

        if (numeroNota != null) {
            // Sucesso síncrono
            if (xmlDistribuicao == null || xmlDistribuicao.isBlank()) {
                // Sem XML imediato, tenta consultar
                var docConsultado = consultar(doc);
                doc.refresh(); // recarrega do banco
                if (doc.getStatus() == DocumentoStatus.AUTORIZADO) {
                    return doc;
                }
                agendarConsulta(doc.getId(), 10);
                return doc;
            }
            autorizarDocumento(doc, numeroNota, null, now(), "Emissão Síncrona", xmlDistribuicao);

        } else if (protocolo != null) {
            doc.setProtocolo(protocolo);
            doc.setStatus(DocumentoStatus.PROCESSANDO);
            documentoRepository.save(doc);
            agendarConsulta(doc.getId(), 3);

        } else {
            doc.setStatus(DocumentoStatus.PROCESSANDO);
            documentoRepository.save(doc);
            agendarConsulta(doc.getId(), 5);
        }

        return doc;
    }

    public DocumentoFiscal consultar(DocumentoFiscal doc) {
        var numero = doc.getNumero();

        // Tentativa 1: por número
        if (numero != null && numero > 0) {
            try {
                var response = acbrClient.post("nfse/consultar-numero", Map.of(
                    "numero", String.valueOf(numero),
                    "configs", empresaConfigService.getAcbrConfigs(doc.getEmpresa(), true)
                ));
                if (!response.error()) {
                    processarRetornoConsulta(doc, response, true);
                    if (doc.getStatus() == DocumentoStatus.AUTORIZADO) return doc;
                }
            } catch (Exception e) {
                log.warn("Consulta por número falhou para doc {}: {}", doc.getId(), e.getMessage());
            }
        }

        // Tentativa 2: por RPS
        try {
            var response = acbrClient.post("nfse/consultar-rps", Map.of(
                "numero", String.valueOf(numero),
                "serie", doc.getSerie() != null ? doc.getSerie() : "1",
                "tipo", "1",
                "configs", empresaConfigService.getAcbrConfigs(doc.getEmpresa(), true)
            ));
            if (!response.error()) {
                processarRetornoConsulta(doc, response, true);
                if (doc.getStatus() == DocumentoStatus.AUTORIZADO) return doc;
            }
        } catch (Exception e) {
            log.warn("Consulta por RPS falhou para doc {}: {}", doc.getId(), e.getMessage());
        }

        // Tentativa 3: por lote/protocolo
        if (doc.getProtocolo() != null) {
            return consultarLote(doc);
        }

        return doc;
    }

    private void processarRetornoConsulta(DocumentoFiscal doc,
            AcbrResponse response, boolean silencioso) {
        var dadosIni = iniParser.parse(response.mensagem());
        var numeroNota = extrairPrimeiro(dadosIni, "Numero", "NumeroNfse", "NumeroNFSe");
        var codVerificacao = extrairPrimeiro(dadosIni, "CodigoVerificacao");
        var dataEmissao = extrairPrimeiro(dadosIni, "DataEmissao");
        var xml = response.xmlDistribuicao();

        if (numeroNota != null) {
            autorizarDocumento(doc, numeroNota, codVerificacao,
                dataEmissao != null ? LocalDateTime.parse(dataEmissao) : LocalDateTime.now(),
                "Consulta", xml
            );
        }
    }

    private void autorizarDocumento(DocumentoFiscal doc, String numero,
            String codVerif, LocalDateTime dataAuth, String origem, String xml) {
        doc.setStatus(DocumentoStatus.AUTORIZADO);
        doc.setNumero(Integer.parseInt(numero));
        doc.setCodigoVerificacao(codVerif);
        doc.setDataAutorizacao(dataAuth);
        doc.setMensagemRetorno("Autorizado (" + origem + ")");

        if (xml != null && !xml.isBlank()) {
            doc.setXmlAutorizado(xml.getBytes(StandardCharsets.UTF_8));
        }

        documentoRepository.save(doc);
        eventPublisher.publishEvent(new DocumentoAutorizadoEvent(doc));
        log.info("NFS-e {} autorizada. Número: {}", doc.getId(), numero);
    }

    // --- Geração do INI Padrão Nacional (MEI) ---
    private String gerarIniPadraoNacional(DocumentoFiscal doc) {
        var empresa = doc.getEmpresa();
        var sb = new StringBuilder();

        sb.append("[IdentificacaoNFSe]\n");
        sb.append("Numero=").append(doc.getNumero()).append("\n");
        sb.append("TipoXML=RPS\n\n");

        sb.append("[InfDPS]\n");
        sb.append("dhEmi=").append(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("\n");
        sb.append("dCompet=").append(LocalDate.now()).append("\n");
        sb.append("cLocEmi=").append(limparNumeros(empresa.getCodigoMunicipio())).append("\n\n");

        sb.append("[Prestador]\n");
        sb.append("CNPJ=").append(limparNumeros(empresa.getCnpj())).append("\n\n");

        sb.append("[Servico]\n");
        sb.append("cTribNac=").append(doc.getCodigoTributacaoNacional()).append("\n");
        sb.append("xDescServ=").append(limparTexto(doc.getDescricaoServico())).append("\n\n");

        sb.append("[Valores]\n");
        sb.append("vServ=").append(formatarValor(doc.getValorServicos())).append("\n");
        sb.append("vLiq=").append(formatarValor(doc.getValorLiquido())).append("\n");
        // MEI: trib=2
        sb.append("trib=2\n");

        return sb.toString();
    }

    // --- Geração do INI Padrão Provedor (ISSNet/ABRASF) ---
    private String gerarIniPadraoProvedor(DocumentoFiscal doc) {
        var empresa = doc.getEmpresa();
        var venda = doc.getVenda();
        var cliente = venda.getCliente();
        var enderecoCliente = cliente.getEnderecoPrincipal();
        var sb = new StringBuilder();

        sb.append("[IdentificacaoNFSe]\n");
        sb.append("Numero=").append(doc.getNumero()).append("\n");
        sb.append("TipoXML=RPS\n\n");

        sb.append("[IdentificacaoRps]\n");
        sb.append("Producao=").append(empresa.isAmbienteProducao() ? "1" : "2").append("\n");
        sb.append("Status=1\n");
        sb.append("TipoTributacaoRps=T\n");
        sb.append("Numero=").append(doc.getNumero()).append("\n");
        sb.append("Serie=").append(doc.getSerie() != null ? doc.getSerie() : "1").append("\n");
        sb.append("Tipo=1\n");
        sb.append("DataEmissao=").append(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("\n");
        sb.append("Competencia=").append(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("\n");
        sb.append("NaturezaOperacao=").append(doc.getNaturezaOperacao() != null ? doc.getNaturezaOperacao() : "1").append("\n\n");

        // Prestador
        sb.append("[Prestador]\n");
        sb.append("CNPJ=").append(limparNumeros(empresa.getCnpj())).append("\n");
        sb.append("InscricaoMunicipal=").append(limparNumeros(empresa.getInscricaoMunicipal())).append("\n");
        sb.append("RazaoSocial=").append(limparTexto(empresa.getRazaoSocial())).append("\n");
        sb.append("CodigoMunicipio=").append(limparNumeros(empresa.getCodigoMunicipio())).append("\n");

        // Regime tributário
        String optante, regime;
        if (empresa.getRegFiscal() == 4) {
            optante = "1"; regime = "5"; // MEI
        } else if (List.of(1, 5, 6).contains(empresa.getRegFiscal())) {
            optante = "1"; regime = "6"; // Simples Nacional
        } else {
            optante = "2"; regime = "";
        }
        sb.append("OptanteSN=").append(optante).append("\n");
        if (!regime.isEmpty()) sb.append("Regime=").append(regime).append("\n");
        sb.append("IncentivadorCultural=2\n\n");

        // Tomador
        sb.append("[Tomador]\n");
        sb.append("Tipo=1\n");
        sb.append("CNPJCPF=").append(limparNumeros(cliente.getCpfCnpj())).append("\n");
        sb.append("RazaoSocial=").append(limparTexto(cliente.getRazaoSocial())).append("\n");
        sb.append("TomadorExterior=2\n");
        if (enderecoCliente != null) {
            sb.append("Logradouro=").append(limparTexto(enderecoCliente.getLogradouro())).append("\n");
            sb.append("Numero=").append(enderecoCliente.getNumero() != null ? enderecoCliente.getNumero() : "S/N").append("\n");
            sb.append("Bairro=").append(limparTexto(enderecoCliente.getBairro())).append("\n");
            sb.append("CodigoMunicipio=").append(limparNumeros(enderecoCliente.getCodigoMunicipio())).append("\n");
            sb.append("UF=").append(enderecoCliente.getUf()).append("\n");
            sb.append("CEP=").append(limparNumeros(enderecoCliente.getCep())).append("\n");
        }
        sb.append("\n");

        // Serviço
        sb.append("[Servico]\n");
        sb.append("ItemListaServico=").append(formatarItemServico(doc.getItemListaServico())).append("\n");
        sb.append("CodigoCnae=").append(limparNumeros(doc.getCodigoCnae())).append("\n");
        sb.append("Discriminacao=").append(limparTexto(doc.getDescricaoServico())).append("\n");
        sb.append("CodigoMunicipio=").append(limparNumeros(empresa.getCodigoMunicipio())).append("\n");
        sb.append("ExigibilidadeISS=1\n");
        sb.append("MunicipioIncidencia=").append(limparNumeros(empresa.getCodigoMunicipio())).append("\n\n");

        // Valores
        sb.append("[Valores]\n");
        sb.append("ValorServicos=").append(formatarValor(doc.getValorServicos())).append("\n");
        sb.append("IssRetido=").append(doc.isIssRetido() ? "1" : "2").append("\n");
        sb.append("BaseCalculo=").append(formatarValor(doc.getValorServicos())).append("\n");
        sb.append("Aliquota=").append(formatarValor(doc.getAliquotaIss())).append("\n");
        sb.append("ValorIss=").append(formatarValor(doc.getValorIss())).append("\n");
        sb.append("ValorLiquidoNfse=").append(formatarValor(doc.getValorLiquido())).append("\n");

        return sb.toString();
    }

    // --- Helpers ---
    private String limparNumeros(String v) { return v == null ? "" : v.replaceAll("\\D", ""); }
    private String limparTexto(String v) {
        if (v == null) return "";
        try {
            return Normalizer.normalize(v, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .replaceAll("[^a-zA-Z0-9 ]", "")
                .substring(0, Math.min(v.length(), 255));
        } catch (Exception e) { return v.substring(0, Math.min(v.length(), 255)); }
    }
    private String formatarValor(BigDecimal v) {
        return v == null ? "0,00" : String.format("%.2f", v).replace(".", ",");
    }
    private String formatarItemServico(String val) {
        String v = val.replaceAll("\\D", "");
        return v.length() == 4 ? v.substring(0, 2) + "." + v.substring(2) : val;
    }
    private String extrairPrimeiro(Map<String, Map<String, String>> ini, String... keys) {
        return ini.values().stream()
            .flatMap(m -> m.entrySet().stream())
            .filter(e -> Arrays.asList(keys).contains(e.getKey()))
            .map(Map.Entry::getValue)
            .filter(v -> v != null && !v.isBlank())
            .findFirst().orElse(null);
    }
    private void agendarConsulta(UUID docId, int delaySegundos) {
        eventPublisher.publishEvent(new AgendarConsultaLoteEvent(docId, delaySegundos));
    }
}
```
