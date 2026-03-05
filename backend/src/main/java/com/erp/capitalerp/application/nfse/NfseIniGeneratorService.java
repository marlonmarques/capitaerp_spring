package com.erp.capitalerp.application.nfse;

import com.erp.capitalerp.domain.clientes.Cliente;
import com.erp.capitalerp.domain.clientes.EnderecoCliente;
import com.erp.capitalerp.domain.nfse.NotaFiscalServico;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Gera o conteúdo INI para o ACBr Microserviço NFS-e.
 *
 * <p>
 * Equivalente ao {@code NfseIniGeneratorService} do sistema PHP legado. <br>
 * Suporta dois layouts:
 * <ul>
 * <li><b>Padrão Nacional (DPS/NFS-e Nacional)</b> — para MEI
 * (reg_fiscal=4)</li>
 * <li><b>Padrão Provedor (ISSNet/ABRASF)</b> — para Simples e Regime
 * Normal</li>
 * </ul>
 */
@Service
public class NfseIniGeneratorService {

    private static final DateTimeFormatter FORMATO_DATA_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FORMATO_DATA_ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter FORMATO_DATETIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    // Mapeamento ID numérico → sigla UF
    private static final Map<Integer, String> UF_MAP = Map.ofEntries(Map.entry(11, "RO"), Map.entry(12, "AC"),
            Map.entry(13, "AM"), Map.entry(14, "RR"), Map.entry(15, "PA"), Map.entry(16, "AP"), Map.entry(17, "TO"),
            Map.entry(21, "MA"), Map.entry(22, "PI"), Map.entry(23, "CE"), Map.entry(24, "RN"), Map.entry(25, "PB"),
            Map.entry(26, "PE"), Map.entry(27, "AL"), Map.entry(28, "SE"), Map.entry(29, "BA"), Map.entry(31, "MG"),
            Map.entry(32, "ES"), Map.entry(33, "RJ"), Map.entry(35, "SP"), Map.entry(41, "PR"), Map.entry(42, "SC"),
            Map.entry(43, "RS"), Map.entry(50, "MS"), Map.entry(51, "MT"), Map.entry(52, "GO"), Map.entry(53, "DF"));

    /**
     * Ponto de entrada: decide o layout correto e delega. Por enquanto, sem acesso
     * ao regime fiscal da empresa via entidade, delegamos ao Padrão Provedor (mais
     * completo e genérico). Adicione lógica de detecção de MEI conforme a entidade
     * Empresa evoluir.
     */
    public String gerarIni(NotaFiscalServico nota) {
        // TODO: quando Empresa tiver campo regimeFiscal, verificar:
        // if (empresa.getRegimeFiscal() == 4) return gerarIniPadraoNacional(nota);
        return gerarIniPadraoProvedor(nota);
    }

    // ─── 1. PADRÃO NACIONAL (MEI / DPS) ──────────────────────────────────────

    public String gerarIniPadraoNacional(NotaFiscalServico nota) {
        var sb = new StringBuilder();

        section(sb, "IdentificacaoNFSe");
        kv(sb, "Numero", String.valueOf(nota.getNumeroRps()));
        kv(sb, "TipoXML", "RPS");

        section(sb, "InfDPS");
        kv(sb, "dhEmi", nota.getDataEmissao().atStartOfDay().format(FORMATO_DATETIME));
        kv(sb, "dCompet", nota.getDataEmissao().format(FORMATO_DATA_ISO));
        kv(sb, "cLocEmi", apenasNumeros(nota.getMunicipioIbge()));

        section(sb, "Servico");
        kv(sb, "cTribNac", "050101");
        kv(sb, "cNBS", formatarNbs(nota.getCodigoNbs()));
        kv(sb, "xDescServ", limparTexto(nota.getDiscriminacaoServico()));

        section(sb, "Valores");
        kv(sb, "vServ", formatarValor(nota.getValorServicos()));
        kv(sb, "vLiq", formatarValor(nota.getValorLiquido()));

        return sb.toString();
    }

    // ─── 2. PADRÃO PROVEDOR (ISSNet / ABRASF) ────────────────────────────────

    public String gerarIniPadraoProvedor(NotaFiscalServico nota) {
        Cliente cliente = nota.getCliente();
        EnderecoCliente endCliente = cliente != null
                ? (cliente.getEnderecos().stream().filter(e -> Boolean.TRUE.equals(e.getPrincipal())).findFirst()
                        .orElse(cliente.getEnderecos().isEmpty() ? null : cliente.getEnderecos().get(0)))
                : null;

        String dataEmissaoBr = nota.getDataEmissao().format(FORMATO_DATA_BR);
        var sb = new StringBuilder();

        // ── IdentificacaoNFSe ──
        section(sb, "IdentificacaoNFSe");
        kv(sb, "Numero", String.valueOf(nota.getNumeroRps()));
        kv(sb, "TipoXML", "RPS");

        // ── IdentificacaoRps ──
        section(sb, "IdentificacaoRps");
        kv(sb, "Producao", "1"); // Sempre produção — mudar para "2" em homologação
        kv(sb, "Status", "1");
        kv(sb, "TipoTributacaoRps", "T");
        kv(sb, "Numero", String.valueOf(nota.getNumeroRps()));
        kv(sb, "Serie", nota.getSerieRps() != null ? nota.getSerieRps() : "1");
        kv(sb, "Tipo", "1");
        kv(sb, "DataEmissao", dataEmissaoBr);
        kv(sb, "Competencia", nota.getDataCompetencia().format(FORMATO_DATA_BR));
        kv(sb, "NaturezaOperacao", nota.getNaturezaOperacao() != null ? nota.getNaturezaOperacao() : "1");
        kv(sb, "OutrasInformacoes", limparTexto(nota.getInformacoesComplementares()));

        // ── Prestador — preenchido de forma genérica (empresa virá do contexto JWT) ──
        // Quando a entidade Empresa for enriquecida, injetar aqui.
        section(sb, "Prestador");
        // Campos serão preenchidos pelo ACBr a partir das configs enviadas no payload
        // mas mantemos a seção para compatibilidade com provedores que exigem no INI.

        // ── Regime / Optante ──
        // Regime é determinado pela empresa (virá do config no payload)
        kv(sb, "OptanteSN", "1");
        kv(sb, "IncentivadorCultural", "2");

        // ── Tomador ──
        section(sb, "Tomador");
        kv(sb, "Tipo", "1");
        if (cliente != null) {
            kv(sb, "CNPJCPF", apenasNumeros(cliente.getCpf() != null ? cliente.getCpf() : ""));
            String razao = cliente.getRazaoSocial() != null ? cliente.getRazaoSocial()
                    : ((cliente.getName() != null ? cliente.getName() : "") + " "
                            + (cliente.getLastName() != null ? cliente.getLastName() : "")).trim();
            kv(sb, "RazaoSocial", limparTexto(razao));
            kv(sb, "TomadorExterior", "2");
            if (endCliente != null) {
                kv(sb, "Logradouro", limparTexto(endCliente.getLogradouro()));
                kv(sb, "Numero", endCliente.getNumero() != null ? endCliente.getNumero() : "S/N");
                kv(sb, "Bairro", limparTexto(endCliente.getBairro()));
                kv(sb, "CodigoMunicipio", apenasNumeros(endCliente.getCidade()));
                kv(sb, "UF", resolverUF(endCliente.getEstado()));
                kv(sb, "CEP", apenasNumeros(endCliente.getCep()));
                kv(sb, "CodigoPais", "1058");
            }
            if (cliente.getEmails() != null && !cliente.getEmails().isEmpty()) {
                kv(sb, "Email", cliente.getEmails().get(0).getEmail());
            }
            if (cliente.getTelefone() != null) {
                kv(sb, "Telefone", apenasNumeros(cliente.getTelefone()));
            }
        }

        // ── Serviço ──
        section(sb, "Servico");
        kv(sb, "ItemListaServico", formatarItemLc116(nota.getItemLc116()));
        kv(sb, "CodigoCnae", apenasNumeros(nota.getCodigoCnae()));
        kv(sb, "CodigoTributacaoMunicipio", apenasNumeros(formatarItemLc116(nota.getItemLc116())));
        kv(sb, "Discriminacao", limparTexto(nota.getDiscriminacaoServico()));
        kv(sb, "CodigoMunicipio", apenasNumeros(nota.getMunicipioIbge()));
        kv(sb, "ExigibilidadeISS", String.valueOf(nota.getExigibilidadeIss() != null ? nota.getExigibilidadeIss() : 1));
        kv(sb, "MunicipioIncidencia", apenasNumeros(nota.getMunicipioIbge()));
        kv(sb, "CodigoPais", "1058");
        kv(sb, "UFPrestacao", nota.getUfPrestacao() != null ? nota.getUfPrestacao() : "DF");
        kv(sb, "ResponsavelRetencao", Boolean.TRUE.equals(nota.getIssRetido()) ? "1" : "");
        kv(sb, "CodigoNbs", formatarNbs(nota.getCodigoNbs()));

        // ── Valores ──
        String vServico = formatarValor(nota.getValorServicos());
        String vIss = formatarValor(nota.getValorIss());
        String aliquota = String.format("%.2f", nota.getAliquotaIss() != null ? nota.getAliquotaIss() : BigDecimal.ZERO)
                .replace('.', ',');

        section(sb, "Valores");
        kv(sb, "ValorServicos", vServico);
        kv(sb, "ValorDeducoes", "0");
        kv(sb, "AliquotaDeducoes", "0");
        kv(sb, "ValorPis", "0");
        kv(sb, "AliquotaPis", "0");
        kv(sb, "ValorCofins", "0");
        kv(sb, "AliquotaCofins", "0");
        kv(sb, "ValorInss", "0");
        kv(sb, "ValorIr", "0");
        kv(sb, "ValorCsll", "0");
        kv(sb, "IssRetido", Boolean.TRUE.equals(nota.getIssRetido()) ? "1" : "2");
        kv(sb, "OutrasRetencoes", "0");
        kv(sb, "DescontoIncondicionado", "0");
        kv(sb, "DescontoCondicionado", "0");
        kv(sb, "BaseCalculo", vServico);
        kv(sb, "Aliquota", aliquota);
        kv(sb, "AliquotaSN", "0");
        kv(sb, "ValorIss", vIss);
        kv(sb, "ValorIssRetido", formatarValor(nota.getValorIssRetido()));
        kv(sb, "ValorLiquidoNfse", formatarValor(nota.getValorLiquido()));
        kv(sb, "ValorTotalNotaFiscal", vServico);

        return sb.toString();
    }

    // ─── Utilitários ──────────────────────────────────────────────────────────

    private void section(StringBuilder sb, String name) {
        sb.append("\n[").append(name).append("]\n");
    }

    private void kv(StringBuilder sb, String key, String value) {
        if (value != null && !value.isBlank()) {
            sb.append(key).append("=").append(value).append("\n");
        }
    }

    private String apenasNumeros(String s) {
        if (s == null)
            return "";
        return s.replaceAll("[^0-9]", "");
    }

    private String limparTexto(String s) {
        if (s == null)
            return "";
        String normalizado = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("[^\\p{ASCII}]", "");
        return normalizado.replaceAll("[^a-zA-Z0-9 .,;:!?()\\-/]", "").substring(0,
                Math.min(normalizado.length(), 255));
    }

    private String formatarValor(BigDecimal val) {
        if (val == null)
            return "0,00";
        return String.format("%.2f", val).replace('.', ',');
    }

    private String formatarItemLc116(String val) {
        if (val == null)
            return "";
        String nums = apenasNumeros(val);
        if (nums.length() == 4) {
            return nums.substring(0, 2) + "." + nums.substring(2);
        }
        return val;
    }

    private String formatarNbs(String nbs) {
        if (nbs == null || nbs.isBlank())
            return "120020100";
        String nums = apenasNumeros(nbs);
        if (nums.length() < 9)
            nums = String.format("%-9s", nums).replace(' ', '0');
        return nums.substring(0, Math.min(9, nums.length()));
    }

    String resolverUF(String estado) {
        if (estado == null)
            return "DF";
        if (estado.length() == 2)
            return estado.toUpperCase();
        if (estado.matches("\\d+")) {
            return UF_MAP.getOrDefault(Integer.parseInt(estado), "DF");
        }
        return estado.toUpperCase().substring(0, Math.min(2, estado.length()));
    }
}
