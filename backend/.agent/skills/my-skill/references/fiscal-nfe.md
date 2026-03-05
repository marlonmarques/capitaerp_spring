# Módulo: Fiscal NF-e / NFC-e

## Entidade Principal

```java
@Entity
@Table(name = "documentos_fiscais")
public class DocumentoFiscal extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoDocumento tipo; // NFE, NFCE, NFSE

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentoStatus status;
    // PENDENTE, PROCESSANDO, AUTORIZADO, REJEITADO, CANCELADO

    @Column(unique = true)
    private String chaveAcesso; // 44 dígitos

    private Integer numero;
    private String serie;
    private String protocolo;
    private String codigoVerificacao;

    @Column(columnDefinition = "BYTEA")
    private byte[] xmlAutorizado;

    @Column(columnDefinition = "BYTEA")
    private byte[] pdfDanfe;

    private LocalDateTime dataAutorizacao;
    private LocalDateTime dataCancelamento;

    @Column(length = 2000)
    private String mensagemRetorno;

    // Vínculo com a venda
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venda_id")
    private Venda venda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;
}
```

## Service NF-e

```java
@Service
@Transactional
@Slf4j
public class NfeService {

    private final AcbrHttpClient acbrClient;
    private final AcbrIniParser iniParser;
    private final AcbrErrorClassifier errorClassifier;
    private final DocumentoFiscalRepository documentoRepository;
    private final EmpresaConfigService empresaConfigService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Emite a NF-e via ACBr REST.
     * Mesmo padrão do AcbrNFSeService em PHP — 3 casos de retorno:
     * 1) Autorizado síncrono (chave de acesso retornada)
     * 2) Em processamento (protocolo de lote)
     * 3) Indefinido (agenda job de consulta)
     */
    public DocumentoFiscal emitir(DocumentoFiscal documento) {
        try {
            var iniContent = gerarIni(documento);
            var configs = empresaConfigService.getAcbrConfigs(documento.getEmpresa());

            log.info("Enviando NF-e ID {} para ACBr...", documento.getId());

            var payload = Map.of(
                "arquivo_ini", iniContent,
                "numero", documento.getNumero(),
                "imprimir", false,
                "configs", configs
            );

            var response = acbrClient.post("nfe/emitir", payload);
            return processarResposta(documento, response);

        } catch (AcbrIndisponivelException e) {
            log.warn("NF-e {}: ACBr indisponível. Agendando retry.", documento.getId());
            documento.setStatus(DocumentoStatus.PROCESSANDO);
            documento.setMensagemRetorno("Aguardando estabilidade do servidor: " + e.getMessage());
            documentoRepository.save(documento);
            throw e;
        } catch (Exception e) {
            tratarErroFatal(documento, e);
            throw e;
        }
    }

    private DocumentoFiscal processarResposta(DocumentoFiscal doc, AcbrResponse response) {
        if (response.error()) {
            if (errorClassifier.isInfrastructureError(response.mensagem())) {
                throw new AcbrIndisponivelException(response.mensagem());
            }
            throw new DocumentoFiscalRejeicaoException(response.mensagem());
        }

        var dadosIni = iniParser.parse(response.mensagem());
        var chaveAcesso = extrairChave(dadosIni);
        var protocolo = extrairProtocolo(dadosIni);

        if (chaveAcesso != null) {
            // CASO 1: Autorizado imediatamente
            autorizarDocumento(doc, chaveAcesso, protocolo, response.xmlDistribuicao());
        } else if (protocolo != null) {
            // CASO 2: Lote em processamento
            doc.setProtocolo(protocolo);
            doc.setStatus(DocumentoStatus.PROCESSANDO);
            doc.setMensagemRetorno("Lote enviado. Protocolo: " + protocolo);
            documentoRepository.save(doc);
            // Agenda consulta de lote
            agendarConsultaLote(doc.getId());
        } else {
            // CASO 3: Indefinido
            doc.setStatus(DocumentoStatus.PROCESSANDO);
            documentoRepository.save(doc);
            agendarConsultaLote(doc.getId());
        }

        return doc;
    }

    private void autorizarDocumento(DocumentoFiscal doc, String chave,
            String protocolo, String xml) {
        doc.setStatus(DocumentoStatus.AUTORIZADO);
        doc.setChaveAcesso(chave);
        doc.setProtocolo(protocolo);
        doc.setDataAutorizacao(LocalDateTime.now());
        doc.setMensagemRetorno("Autorizado");

        if (xml != null && !xml.isBlank()) {
            doc.setXmlAutorizado(xml.getBytes(StandardCharsets.UTF_8));
        }

        documentoRepository.save(doc);
        eventPublisher.publishEvent(new DocumentoAutorizadoEvent(doc));
        log.info("NF-e {} autorizada. Chave: {}", doc.getId(), chave);
    }

    public DocumentoFiscal cancelar(UUID documentoId, String motivo) {
        var doc = documentoRepository.findById(documentoId)
            .orElseThrow(() -> new EntityNotFoundException("Documento não encontrado"));

        if (doc.getStatus() != DocumentoStatus.AUTORIZADO) {
            throw new BusinessException("Somente documentos autorizados podem ser cancelados.");
        }

        var payload = Map.of(
            "chave", doc.getChaveAcesso(),
            "motivo", motivo,
            "configs", empresaConfigService.getAcbrConfigs(doc.getEmpresa())
        );

        var response = acbrClient.post("nfe/cancelar", payload);
        if (response.error()) throw new DocumentoFiscalRejeicaoException(response.mensagem());

        doc.setStatus(DocumentoStatus.CANCELADO);
        doc.setDataCancelamento(LocalDateTime.now());
        doc.setMensagemRetorno("Cancelado: " + motivo);

        return documentoRepository.save(doc);
    }

    // --- Geração do INI para NF-e ---

    private String gerarIni(DocumentoFiscal doc) {
        var venda = doc.getVenda();
        var empresa = doc.getEmpresa();
        var sb = new StringBuilder();

        sb.append("[IdentificacaoNFe]\n");
        sb.append("Numero=").append(doc.getNumero()).append("\n");
        sb.append("Serie=").append(doc.getSerie()).append("\n");
        sb.append("TipoOperacao=1\n"); // 1=Saída
        sb.append("DataEmissao=").append(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("\n\n");

        sb.append("[Emitente]\n");
        sb.append("CNPJ=").append(limparNumeros(empresa.getCnpj())).append("\n");
        sb.append("RazaoSocial=").append(empresa.getRazaoSocial()).append("\n");
        sb.append("InscricaoEstadual=").append(limparNumeros(empresa.getInscricaoEstadual())).append("\n\n");

        // Destinatário
        var cliente = venda.getCliente();
        sb.append("[Destinatario]\n");
        sb.append("CNPJCPF=").append(limparNumeros(cliente.getCpfCnpj())).append("\n");
        sb.append("RazaoSocial=").append(cliente.getRazaoSocial()).append("\n\n");

        // Itens
        for (int i = 0; i < venda.getItens().size(); i++) {
            var item = venda.getItens().get(i);
            int idx = i + 1;
            sb.append("[Item").append(idx).append("]\n");
            sb.append("Codigo=").append(item.getProduto().getId()).append("\n");
            sb.append("Descricao=").append(item.getProduto().getNome()).append("\n");
            sb.append("NCM=").append(item.getCodigoNcm()).append("\n");
            sb.append("CFOP=").append(item.getCfop()).append("\n");
            sb.append("Quantidade=").append(item.getQuantidade()).append("\n");
            sb.append("ValorUnitario=").append(formatarValor(item.getPrecoUnitario())).append("\n");
            sb.append("ValorTotal=").append(formatarValor(item.getSubtotal())).append("\n\n");
        }

        sb.append("[Total]\n");
        sb.append("ValorNF=").append(formatarValor(venda.getTotal())).append("\n");

        return sb.toString();
    }

    private String limparNumeros(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private String formatarValor(BigDecimal val) {
        return val == null ? "0,00" : String.format("%.2f", val).replace(".", ",");
    }

    private String extrairChave(Map<String, Map<String, String>> ini) {
        return ini.values().stream()
            .flatMap(m -> m.entrySet().stream())
            .filter(e -> e.getKey().equalsIgnoreCase("ChaveAcesso"))
            .map(Map.Entry::getValue)
            .findFirst().orElse(null);
    }

    private String extrairProtocolo(Map<String, Map<String, String>> ini) {
        return ini.values().stream()
            .flatMap(m -> m.entrySet().stream())
            .filter(e -> e.getKey().equalsIgnoreCase("Protocolo"))
            .map(Map.Entry::getValue)
            .findFirst().orElse(null);
    }

    private void agendarConsultaLote(UUID docId) {
        // Usar Spring @Scheduled ou enviar mensagem para fila (RabbitMQ/Redis)
        // Exemplo com Spring Events assíncrono:
        eventPublisher.publishEvent(new AgendarConsultaLoteEvent(docId));
    }

    private void tratarErroFatal(DocumentoFiscal doc, Exception e) {
        log.error("Erro fatal NF-e {}: {}", doc.getId(), e.getMessage());
        doc.setStatus(DocumentoStatus.REJEITADO);
        doc.setMensagemRetorno(truncar(e.getMessage(), 2000));
        documentoRepository.save(doc);
    }

    private String truncar(String s, int max) {
        return s != null && s.length() > max ? s.substring(0, max) : s;
    }
}
```

## Job de Consulta de Lote (Spring Scheduling)

```java
@Component
@Slf4j
@RequiredArgsConstructor
public class ConsultaLoteJob {

    private final DocumentoFiscalRepository documentoRepository;
    private final NfeService nfeService;

    @Scheduled(fixedDelay = 10_000) // a cada 10 segundos
    @Transactional
    public void processarPendentes() {
        var docs = documentoRepository.findByStatusAndTipo(
            DocumentoStatus.PROCESSANDO, TipoDocumento.NFE
        );

        for (var doc : docs) {
            try {
                nfeService.consultarLote(doc);
            } catch (Exception e) {
                log.warn("Falha ao consultar lote doc {}: {}", doc.getId(), e.getMessage());
            }
        }
    }
}
```

## Migration Flyway

```sql
-- V5__create_documentos_fiscais.sql
CREATE TABLE documentos_fiscais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    chave_acesso VARCHAR(44) UNIQUE,
    numero INTEGER,
    serie VARCHAR(3),
    protocolo VARCHAR(50),
    codigo_verificacao VARCHAR(30),
    xml_autorizado BYTEA,
    pdf_danfe BYTEA,
    data_autorizacao TIMESTAMP,
    data_cancelamento TIMESTAMP,
    mensagem_retorno VARCHAR(2000),
    venda_id UUID REFERENCES vendas(id),
    empresa_id UUID NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP
);

CREATE INDEX idx_doc_fiscal_status_tipo ON documentos_fiscais(status, tipo);
CREATE INDEX idx_doc_fiscal_chave ON documentos_fiscais(chave_acesso);
```
