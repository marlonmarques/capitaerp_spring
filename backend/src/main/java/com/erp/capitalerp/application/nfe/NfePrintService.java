package com.erp.capitalerp.application.nfe;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Transcrição robusta do NfePrintService (PHP) para Java/Spring.
 * Utiliza OpenPDF para controle total do layout do DANFE.
 */
@Service
public class NfePrintService {

    private static final Logger log = LoggerFactory.getLogger(NfePrintService.class);
    private static final DecimalFormat MONETARY = new DecimalFormat("#,##0.00", new DecimalFormatSymbols(new Locale("pt", "BR")));

    public byte[] generateDanfe(String xmlContent) {
        try {
            // 1. Extração de Dados (Equivalente ao StandardNfeExtractor.php)
            Map<String, Object> data = extractData(xmlContent);

            // 2. Inicialização do PDF (Equivalente ao initializePdf())
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            com.lowagie.text.Document document = new com.lowagie.text.Document(PageSize.A4, 10, 10, 10, 10);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            PdfContentByte cb = writer.getDirectContent();
            
            // 3. Desenho do DANFE (Equivalente ao drawDanfe())
            drawDanfe(document, cb, data);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Erro ao gerar DANFE PDF: {}", e.getMessage());
            throw new RuntimeException("Falha na geração do DANFE: " + e.getMessage());
        }
    }

    private void drawDanfe(com.lowagie.text.Document doc, PdfContentByte cb, Map<String, Object> data) throws Exception {
        float x = 20; // Margem esquerda em pontos
        float y = 820; // Início no topo (A4 tem ~842 pts)

        // 1. CANHOTO
        drawCanhoto(cb, data, x, y);
        y -= 60;

        // 2. CABEÇALHO (Emitente, DANFE, Chave)
        drawHeader(cb, data, x, y);
        y -= 100;

        // 3. NATUREZA OPERAÇÃO E PROTOCOLO
        drawInfoFiscal(cb, data, x, y);
        y -= 30;

        // 4. DESTINATÁRIO
        drawDestinatario(cb, data, x, y);
        y -= 90;

        // 5. TOTAIS / IMPOSTOS
        drawImpostos(cb, data, x, y);
        y -= 70;

        // 6. TRANSPORTADOR
        drawTransportador(cb, data, x, y);
        y -= 80;

        // 7. ITENS (Simplificado para brevidade, mas segue a lógica do loop PHP)
        drawItens(cb, data, x, y);

        // 8. DADOS ADICIONAIS (Rodapé)
        drawDadosAdicionais(cb, data, x, 60);
    }

    private void drawCanhoto(PdfContentByte cb, Map<String, Object> data, float x, float y) {
        drawRect(cb, x, y - 50, 450, 50); // Box maior
        drawRect(cb, x + 450, y - 50, 110, 50); // Box menor (Infos Nota)

        Map<String, String> cab = (Map<String, String>) data.get("cabecalho");
        Map<String, String> emit = (Map<String, String>) data.get("emitente");

        addText(cb, x + 5, y - 10, "RECEBEMOS DE " + emit.get("razao") + " OS PRODUTOS/SERVIÇOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO", 6, true);
        cb.moveTo(x, y - 35); cb.lineTo(x + 450, y - 35); cb.stroke();
        
        addText(cb, x + 5, y - 45, "DATA DE RECEBIMENTO", 6, false);
        addText(cb, x + 150, y - 45, "IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR", 6, false);

        addText(cb, x + 450, y - 15, "NF-e", 12, true, Element.ALIGN_CENTER);
        addText(cb, x + 505, y - 30, "Nº " + cab.get("numero"), 10, true, Element.ALIGN_CENTER);
        addText(cb, x + 505, y - 43, "Série " + cab.get("serie"), 8, false, Element.ALIGN_CENTER);
    }

    private void drawHeader(PdfContentByte cb, Map<String, Object> data, float x, float y) {
        Map<String, String> cab = (Map<String, String>) data.get("cabecalho");
        Map<String, String> emit = (Map<String, String>) data.get("emitente");

        // Box Emitente
        drawRect(cb, x, y - 90, 240, 90);
        addText(cb, x + 120, y - 15, emit.get("razao"), 10, true, Element.ALIGN_CENTER);
        addText(cb, x + 5, y - 30, emit.get("endereco_completo"), 7, false);

        // Box DANFE
        drawRect(cb, x + 240, y - 90, 100, 90);
        addText(cb, x + 290, y - 15, "DANFE", 14, true, Element.ALIGN_CENTER);
        addText(cb, x + 290, y - 35, "Documento Auxiliar\nda Nota Fiscal Eletrônica", 7, false, Element.ALIGN_CENTER);
        addText(cb, x + 290, y - 75, "Nº " + cab.get("numero"), 10, true, Element.ALIGN_CENTER);
        addText(cb, x + 290, y - 85, "Série " + cab.get("serie"), 8, true, Element.ALIGN_CENTER);

        // Chave de Acesso e Código de Barras
        drawRect(cb, x + 340, y - 90, 220, 90);
        addText(cb, x + 345, y - 45, "CHAVE DE ACESSO", 7, true);
        addText(cb, x + 450, y - 60, cab.get("chave_formatada"), 8, true, Element.ALIGN_CENTER);
        
        // Simulação do código de barras (Na prática usaria a biblioteca barcode do iText)
        addText(cb, x + 450, y - 85, "Consulta de autenticidade no portal www.nfe.fazenda.gov.br", 6, false, Element.ALIGN_CENTER);
    }

    private void drawInfoFiscal(PdfContentByte cb, Map<String, Object> data, float x, float y) {
        Map<String, String> cab = (Map<String, String>) data.get("cabecalho");
        drawRect(cb, x, y - 25, 340, 25);
        drawRect(cb, x + 340, y - 25, 220, 25);
        addText(cb, x + 5, y - 10, "NATUREZA DA OPERAÇÃO", 6, false);
        addText(cb, x + 5, y - 22, cab.get("nat_op"), 9, true);
        addText(cb, x + 345, y - 10, "PROTOCOLO DE AUTORIZAÇÃO DE USO", 6, false);
        addText(cb, x + 345, y - 22, cab.get("protocolo") + " - " + cab.get("data_protocolo"), 9, true);
    }

    private void drawDestinatario(PdfContentByte cb, Map<String, Object> data, float x, float y) {
        Map<String, String> dest = (Map<String, String>) data.get("destinatario");
        addText(cb, x, y, "DESTINATÁRIO / REMETENTE", 8, true);
        y -= 5;
        drawRect(cb, x, y - 25, 360, 25); // Razão
        drawRect(cb, x + 360, y - 25, 120, 25); // CNPJ
        drawRect(cb, x + 480, y - 25, 80, 25); // Data

        addText(cb, x + 5, y - 10, "NOME / RAZÃO SOCIAL", 6, false);
        addText(cb, x + 5, y - 22, dest.get("razao"), 9, true);
        addText(cb, x + 365, y - 10, "CNPJ / CPF", 6, false);
        addText(cb, x + 365, y - 22, dest.get("cnpj_cpf"), 9, true);
    }

    private void drawImpostos(PdfContentByte cb, Map<String, Object> data, float x, float y) {
        Map<String, Double> tot = (Map<String, Double>) data.get("totais");
        addText(cb, x, y, "CÁLCULO DO IMPOSTO", 8, true);
        y -= 5;
        float w = 560 / 5;
        for (int i = 0; i < 5; i++) {
            drawRect(cb, x + (i * w), y - 25, w, 25);
        }
        addText(cb, x + 5, y - 10, "BASE CÁLC. ICMS", 6, false);
        addText(cb, x + w - 5, y - 22, formatMoney(tot.get("vBC")), 9, true, Element.ALIGN_RIGHT);
        
        addText(cb, x + w + 5, y - 10, "VALOR DO ICMS", 6, false);
        addText(cb, x + 2*w - 5, y - 22, formatMoney(tot.get("vICMS")), 9, true, Element.ALIGN_RIGHT);

        addText(cb, x + 4*w + 5, y - 10, "VALOR TOTAL DA NOTA", 6, false);
        addText(cb, x + 5*w - 5, y - 22, formatMoney(tot.get("vNF")), 10, true, Element.ALIGN_RIGHT);
    }

    private void drawTransportador(PdfContentByte cb, Map<String, Object> data, float x, float y) {
        addText(cb, x, y, "TRANSPORTADOR / VOLUMES TRANSPORTADOS", 8, true);
        y -= 5;
        drawRect(cb, x, y - 25, 560, 25);
        addText(cb, x + 5, y - 10, "NOME / RAZÃO SOCIAL", 6, false);
        // ... mais campos
    }

    private void drawItens(PdfContentByte cb, Map<String, Object> data, float x, float y) {
        addText(cb, x, y, "DADOS DOS PRODUTOS / SERVIÇOS", 8, true);
        y -= 5;
        // Cabeçalho da tabela
        cb.setRGBColorFill(220, 220, 220);
        cb.rectangle(x, y - 15, 560, 15);
        cb.fillStroke();
        cb.setRGBColorFill(0, 0, 0);

        addText(cb, x + 5, y - 10, "CÓDIGO", 7, true);
        addText(cb, x + 60, y - 10, "DESCRIÇÃO DOS PRODUTOS / SERVIÇOS", 7, true);
        addText(cb, x + 400, y - 10, "QTD", 7, true);
        addText(cb, x + 450, y - 10, "V.UNIT", 7, true);
        addText(cb, x + 510, y - 10, "V.TOTAL", 7, true);

        // Loop Itens
        List<Map<String, Object>> itens = (List<Map<String, Object>>) data.get("itens");
        float lineY = y - 30;
        for (Map<String, Object> item : itens) {
            addText(cb, x + 5, lineY, (String) item.get("codigo"), 7, false);
            addText(cb, x + 60, lineY, (String) item.get("nome"), 7, false);
            addText(cb, x + 400, lineY, formatMoney((Double) item.get("qtd")), 7, false);
            addText(cb, x + 450, lineY, formatMoney((Double) item.get("vUn")), 7, false);
            addText(cb, x + 510, lineY, formatMoney((Double) item.get("vTotal")), 7, false);
            lineY -= 12;
            if (lineY < 100) break; // Simplificação para não tratar paginação agora
        }
    }

    private void drawDadosAdicionais(PdfContentByte cb, Map<String, Object> data, float x, float y) {
        Map<String, String> adic = (Map<String, String>) data.get("dados_adicionais");
        drawRect(cb, x, y, 560, 50);
        addText(cb, x + 5, y + 40, "INFORMAÇÕES COMPLEMENTARES", 7, true);
        addText(cb, x + 5, y + 25, adic.get("infCpl"), 7, false);
    }

    // --- UTILS DE DESENHO ---
    private void drawRect(PdfContentByte cb, float x, float y, float w, float h) {
        cb.rectangle(x, y, w, h);
        cb.stroke();
    }

    private void addText(PdfContentByte cb, float x, float y, String text, float size, boolean bold) {
        addText(cb, x, y, text, size, bold, Element.ALIGN_LEFT);
    }

    private void addText(PdfContentByte cb, float x, float y, String text, float size, boolean bold, int align) {
        if (text == null) text = "";
        try {
            cb.beginText();
            BaseFont bf = BaseFont.createFont(bold ? BaseFont.HELVETICA_BOLD : BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            cb.setFontAndSize(bf, size);
            cb.showTextAligned(align, text, x, y, 0);
            cb.endText();
        } catch (Exception e) {
            log.error("Erro ao adicionar texto no PDF: {}", e.getMessage());
        }
    }

    private String formatMoney(Double value) {
        return value != null ? MONETARY.format(value) : "0,00";
    }

    // --- EXTRATOR DE XML (Equivalente ao StandardNfeExtractor.php) ---
    private Map<String, Object> extractData(String xmlContent) throws Exception {
        Map<String, Object> data = new HashMap<>();

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new ByteArrayInputStream(xmlContent.getBytes(StandardCharsets.UTF_8)));
        XPath xpath = XPathFactory.newInstance().newXPath();

        // 1. Cabecalho
        Map<String, String> cab = new HashMap<>();
        cab.put("numero", (String) xpath.evaluate("//nNF", doc, XPathConstants.STRING));
        cab.put("serie", (String) xpath.evaluate("//serie", doc, XPathConstants.STRING));
        cab.put("nat_op", (String) xpath.evaluate("//natOp", doc, XPathConstants.STRING));
        cab.put("protocolo", (String) xpath.evaluate("//nProt", doc, XPathConstants.STRING));
        cab.put("data_protocolo", (String) xpath.evaluate("//dhRecbto", doc, XPathConstants.STRING));
        
        String chave = (String) xpath.evaluate("//infNFe/@Id", doc, XPathConstants.STRING);
        chave = chave.replaceAll("[^0-9]", "");
        cab.put("chave_acesso", chave);
        cab.put("chave_formatada", formatChave(chave));
        data.put("cabecalho", cab);

        // 2. Emitente
        Map<String, String> emit = new HashMap<>();
        emit.put("razao", (String) xpath.evaluate("//emit/xNome", doc, XPathConstants.STRING));
        emit.put("cnpj", (String) xpath.evaluate("//emit/CNPJ", doc, XPathConstants.STRING));
        emit.put("ie", (String) xpath.evaluate("//emit/IE", doc, XPathConstants.STRING));
        emit.put("endereco_completo", (String) xpath.evaluate("//emit/enderEmit/xLgr", doc, XPathConstants.STRING) + ", " + 
                  xpath.evaluate("//emit/enderEmit/nro", doc, XPathConstants.STRING));
        data.put("emitente", emit);

        // 3. Destinatário
        Map<String, String> dest = new HashMap<>();
        dest.put("razao", (String) xpath.evaluate("//dest/xNome", doc, XPathConstants.STRING));
        dest.put("cnpj_cpf", (String) xpath.evaluate("//dest/CNPJ | //dest/CPF", doc, XPathConstants.STRING));
        data.put("destinatario", dest);

        // 4. Totais
        Map<String, Double> tot = new HashMap<>();
        tot.put("vBC", parseDouble((String) xpath.evaluate("//vBC", doc, XPathConstants.STRING)));
        tot.put("vICMS", parseDouble((String) xpath.evaluate("//vICMS", doc, XPathConstants.STRING)));
        tot.put("vNF", parseDouble((String) xpath.evaluate("//vNF", doc, XPathConstants.STRING)));
        data.put("totais", tot);

        // 5. Itens
        List<Map<String, Object>> itens = new ArrayList<>();
        NodeList detNodes = (NodeList) xpath.evaluate("//det", doc, XPathConstants.NODESET);
        for (int i = 0; i < detNodes.getLength(); i++) {
            Element det = (Element) detNodes.item(i);
            Map<String, Object> item = new HashMap<>();
            item.put("codigo", xpath.evaluate("prod/cProd", det));
            item.put("nome", xpath.evaluate("prod/xProd", det));
            item.put("qtd", parseDouble(xpath.evaluate("prod/qCom", det)));
            item.put("vUn", parseDouble(xpath.evaluate("prod/vUnCom", det)));
            item.put("vTotal", parseDouble(xpath.evaluate("prod/vProd", det)));
            itens.add(item);
        }
        data.put("itens", itens);

        // 6. Dados Adicionais
        Map<String, String> adic = new HashMap<>();
        adic.put("infCpl", (String) xpath.evaluate("//infAdic/infCpl", doc, XPathConstants.STRING));
        data.put("dados_adicionais", adic);

        return data;
    }

    private String formatChave(String chave) {
        if (chave == null || chave.length() < 44) return chave;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 44; i += 4) {
            sb.append(chave, i, i + 4).append(" ");
        }
        return sb.toString().trim();
    }

    private Double parseDouble(String val) {
        try {
            return val != null && !val.isEmpty() ? Double.parseDouble(val) : 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }
}
