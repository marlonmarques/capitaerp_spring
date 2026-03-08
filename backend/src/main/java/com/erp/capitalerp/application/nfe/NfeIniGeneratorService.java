package com.erp.capitalerp.application.nfe;

import com.erp.capitalerp.domain.cadastros.Filial;
import com.erp.capitalerp.domain.clientes.Cliente;
import com.erp.capitalerp.domain.clientes.EnderecoCliente;
import com.erp.capitalerp.domain.nfe.ModeloNFe;
import com.erp.capitalerp.domain.nfe.NotaFiscalProduto;
import com.erp.capitalerp.domain.nfe.NotaFiscalProdutoItem;
import com.erp.capitalerp.domain.nfe.NotaFiscalProdutoPagamento;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class NfeIniGeneratorService {

    private final DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public String gerarIni(NotaFiscalProduto nota, Filial filial) {
        StringBuilder ini = new StringBuilder();
        Cliente cliente = nota.getCliente();

        // ─── Identificação ────────────────────────────────────────────────────────
        Map<String, Object> identificacao = new LinkedHashMap<>();
        identificacao.put("cNF", nota.getCodigoAleatorio() != null ? nota.getCodigoAleatorio() : (int)(Math.random() * 90000000 + 10000000));
        identificacao.put("natOp", nota.getNaturezaOperacao());
        identificacao.put("mod", nota.getModelo().getValue());
        identificacao.put("serie", nota.getSerie());
        identificacao.put("nNF", nota.getNumero());
        identificacao.put("dhEmi", nota.getDataEmissao().format(dateTimeFormatter));
        identificacao.put("dhSaiEnt", nota.getDataSaidaEntrada() != null ? nota.getDataSaidaEntrada().format(dateTimeFormatter) : "");
        identificacao.put("tpNF", "SAIDA".equalsIgnoreCase(nota.getTipoNota()) ? 1 : 0);
        identificacao.put("tpAmb", "PRODUCAO".equalsIgnoreCase(nota.getAmbiente()) ? 1 : 2);
        identificacao.put("tpEmis", 1);
        identificacao.put("procEmi", 0);
        identificacao.put("verProc", "CapitalERP_1.0");
        identificacao.put("cMunFG", filial.getIbge());

        if (nota.getModelo() == ModeloNFe.NFCE) {
            identificacao.put("idDest", 1);
            identificacao.put("tpImp", 4);
            identificacao.put("indFinal", 1);
            identificacao.put("indPres", 1);
        } else {
            identificacao.put("tpImp", 1);
            identificacao.put("finNFe", nota.getFinalidade() != null ? nota.getFinalidade().getCodigo() : 1);
            identificacao.put("indFinal", nota.getIndicadorFinal() != null ? nota.getIndicadorFinal() : 1);
            identificacao.put("indPres", nota.getIndicadorPresenca() != null ? nota.getIndicadorPresenca() : 9);
            
            // Lógica de Destino
            if (cliente != null && cliente.getEnderecos() != null && !cliente.getEnderecos().isEmpty()) {
                EnderecoCliente end = cliente.getEnderecos().get(0);
                if ("EX".equalsIgnoreCase(end.getEstado())) {
                    identificacao.put("idDest", 3);
                } else if (!filial.getEstado().equalsIgnoreCase(end.getEstado())) {
                    identificacao.put("idDest", 2);
                } else {
                    identificacao.put("idDest", 1);
                }
            } else {
                identificacao.put("idDest", 1);
            }
        }
        writeSection(ini, "Identificacao", identificacao);

        // ─── Emitente ─────────────────────────────────────────────────────────────
        Map<String, Object> emitente = new LinkedHashMap<>();
        emitente.put("CNPJCPF", limpar(filial.getCnpj()));
        emitente.put("xNome", truncate(filial.getRazaoSocial(), 60));
        emitente.put("xFant", truncate(filial.getNomeFantasia(), 60));
        emitente.put("IE", limpar(filial.getInscricaoEstadual()));
        emitente.put("xLgr", truncate(filial.getLogradouro(), 60));
        emitente.put("nro", truncate(filial.getNumero(), 60));
        emitente.put("xCpl", truncate(filial.getComplemento(), 60));
        emitente.put("xBairro", truncate(filial.getBairro(), 60));
        emitente.put("cMun", filial.getIbge());
        emitente.put("xMun", truncate(filial.getCidade(), 60));
        emitente.put("UF", filial.getEstado());
        emitente.put("CEP", limpar(filial.getCep()));
        emitente.put("cPais", 1058);
        writeSection(ini, "Emitente", emitente);

        // ─── Destinatário ──────────────────────────────────────────────────────────
        if (cliente != null) {
            Map<String, Object> destinatario = new LinkedHashMap<>();
            destinatario.put("CNPJCPF", limpar(cliente.getCpf()));
            destinatario.put("xNome", truncate(cliente.getRazaoSocial() != null ? cliente.getRazaoSocial() : cliente.getName(), 60));
            
            // indIEDest: 1-Contribuinte, 2-Isento, 9-Não Contribuinte
            int indIEDest = 9;
            if (nota.getModelo() == ModeloNFe.NFE) {
                if (cliente.getInscEString() != null && !cliente.getInscEString().isEmpty()) {
                    indIEDest = "ISENTO".equalsIgnoreCase(cliente.getInscEString()) ? 2 : 1;
                }
            }
            destinatario.put("indIEDest", indIEDest);
            destinatario.put("IE", indIEDest == 1 ? limpar(cliente.getInscEString()) : "");
            
            String emailStr = "";
            if (cliente.getEmails() != null && !cliente.getEmails().isEmpty()) {
                emailStr = cliente.getEmails().get(0).getEmail();
            }
            destinatario.put("Email", emailStr);

            if (cliente.getEnderecos() != null && !cliente.getEnderecos().isEmpty()) {
                EnderecoCliente end = cliente.getEnderecos().get(0);
                destinatario.put("xLgr", truncate(end.getLogradouro(), 60));
                destinatario.put("nro", truncate(end.getNumero(), 60));
                destinatario.put("xCpl", truncate(end.getComplemento(), 60));
                destinatario.put("xBairro", truncate(end.getBairro(), 60));
                destinatario.put("cMun", ""); // IBGE do mun. do cliente não disponível no EnderecoCliente
                destinatario.put("xMun", truncate(end.getCidade(), 60));
                destinatario.put("UF", end.getEstado());
                destinatario.put("CEP", limpar(end.getCep()));
                destinatario.put("cPais", 1058);
                destinatario.put("xPais", "BRASIL");
            }
            writeSection(ini, "Destinatario", destinatario);
        }

        // ─── Produtos ─────────────────────────────────────────────────────────────
        int idx = 1;
        for (NotaFiscalProdutoItem item : nota.getItens()) {
            String sIdx = String.format("%03d", idx);
            Map<String, Object> produto = new LinkedHashMap<>();
            produto.put("cProd", item.getCodigoProduto());
            produto.put("xProd", truncate(limparTexto(item.getDescricao()), 120));
            produto.put("NCM", limpar(item.getNcm()));
            produto.put("CFOP", item.getCfop());
            produto.put("uCom", item.getUnidadeComercial());
            produto.put("qCom", format(item.getQuantidadeComercial(), 4));
            produto.put("vUnCom", format(item.getValorUnitarioComercial(), 10));
            produto.put("vProd", format(item.getValorBruto(), 2));
            produto.put("uTrib", item.getUnidadeComercial());
            produto.put("qTrib", format(item.getQuantidadeComercial(), 4));
            produto.put("vUnTrib", format(item.getValorUnitarioComercial(), 10));
            produto.put("indTot", 1);
            produto.put("vDesc", format(item.getValorDesconto(), 2));
            produto.put("vFrete", format(item.getValorFrete(), 2));
            produto.put("vSeg", format(item.getValorSeguro(), 2));
            produto.put("vOutro", format(item.getValorOutrasDespesas(), 2));
            writeSection(ini, "Produto" + sIdx, produto);

            Map<String, Object> icms = new LinkedHashMap<>();
            icms.put("orig", item.getOrigem() != null ? item.getOrigem() : 0);
            icms.put("CST", item.getIcmsCst());
            icms.put("vBC", format(item.getIcmsBaseCalculo(), 2));
            icms.put("pICMS", format(item.getIcmsAliquota(), 2));
            icms.put("vICMS", format(item.getIcmsValor(), 2));
            icms.put("modBC", 3);
            writeSection(ini, "ICMS" + sIdx, icms);

            Map<String, Object> pis = new LinkedHashMap<>();
            pis.put("CST", item.getPisCst());
            pis.put("vBC", format(item.getPisBaseCalculo(), 2));
            pis.put("pPIS", format(item.getPisAliquota(), 2));
            pis.put("vPIS", format(item.getPisValor(), 2));
            writeSection(ini, "PIS" + sIdx, pis);

            Map<String, Object> cofins = new LinkedHashMap<>();
            cofins.put("CST", item.getCofinsCst());
            cofins.put("vBC", format(item.getCofinsBaseCalculo(), 2));
            cofins.put("pCOFINS", format(item.getCofinsAliquota(), 2));
            cofins.put("vCOFINS", format(item.getCofinsValor(), 2));
            writeSection(ini, "COFINS" + sIdx, cofins);

            if (item.getIpiCst() != null) {
                Map<String, Object> ipi = new LinkedHashMap<>();
                ipi.put("CST", item.getIpiCst());
                ipi.put("cEnq", item.getIpiEnquadramento());
                ipi.put("vBC", format(item.getIpiBaseCalculo(), 2));
                ipi.put("pIPI", format(item.getIpiAliquota(), 2));
                ipi.put("vIPI", format(item.getIpiValor(), 2));
                writeSection(ini, "IPI" + sIdx, ipi);
            }

            idx++;
        }

        // ─── Totais ───────────────────────────────────────────────────────────────
        Map<String, Object> total = new LinkedHashMap<>();
        total.put("vBC", format(nota.getValorBaseCalculoIcms(), 2));
        total.put("vICMS", format(nota.getValorIcms(), 2));
        total.put("vProd", format(nota.getValorTotalProdutos(), 2));
        total.put("vNF", format(nota.getValorTotalNota(), 2));
        total.put("vFrete", format(nota.getValorFrete(), 2));
        total.put("vSeg", format(nota.getValorSeguro(), 2));
        total.put("vDesc", format(nota.getValorDesconto(), 2));
        total.put("vOutro", format(nota.getValorOutros(), 2));
        writeSection(ini, "Total", total);

        // ─── Pagamentos ───────────────────────────────────────────────────────────
        int pIdx = 1;
        if (nota.getPagamentos() == null || nota.getPagamentos().isEmpty()) {
            Map<String, Object> pag = new LinkedHashMap<>();
            pag.put("tPag", "90"); // Sem pagamento
            pag.put("vPag", "0.00");
            writeSection(ini, "pag001", pag);
        } else {
            for (NotaFiscalProdutoPagamento pg : nota.getPagamentos()) {
                String spIdx = String.format("%03d", pIdx);
                Map<String, Object> pag = new LinkedHashMap<>();
                pag.put("tPag", pg.getTipoPagamento());
                pag.put("vPag", format(pg.getValorPagamento(), 2));
                pag.put("indPag", pg.getIndicadorPagamento());
                if (pg.getBandeiraCartao() != null) pag.put("tBand", pg.getBandeiraCartao());
                if (pg.getCnpjCredenciadora() != null) pag.put("CNPJ", pg.getCnpjCredenciadora());
                if (pg.getCodigoAutorizacao() != null) pag.put("cAut", pg.getCodigoAutorizacao());
                writeSection(ini, "pag" + spIdx, pag);
                pIdx++;
            }
        }

        // ─── Dados Adicionais ─────────────────────────────────────────────────────
        Map<String, Object> dadosAdic = new LinkedHashMap<>();
        dadosAdic.put("infAdFisco", truncate(nota.getInformacoesFisco(), 2000));
        dadosAdic.put("infCpl", truncate(limparTexto(nota.getInformacoesComplementares()), 5000));
        writeSection(ini, "DadosAdicionais", dadosAdic);

        return ini.toString();
    }

    private void writeSection(StringBuilder sb, String section, Map<String, Object> fields) {
        sb.append("[").append(section).append("]\n");
        fields.forEach((k, v) -> {
            if (v != null) {
                sb.append(k).append("=").append(v).append("\n");
            }
        });
        sb.append("\n");
    }

    private String format(BigDecimal value, int scale) {
        if (value == null) return BigDecimal.ZERO.setScale(scale, RoundingMode.HALF_UP).toString();
        return value.setScale(scale, RoundingMode.HALF_UP).toString();
    }

    private String limpar(String val) {
        if (val == null) return "";
        return val.replaceAll("[^0-9]", "");
    }

    private String limparTexto(String val) {
        if (val == null) return "";
        return val.replace("\n", "; ").replace("\r", "").replace("\t", " ");
    }

    private String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() <= max ? text : text.substring(0, max);
    }
}
