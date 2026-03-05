package com.erp.capitalerp.application.nfse;

import com.erp.capitalerp.domain.nfse.NotaFiscalServico;
import com.erp.capitalerp.domain.nfse.StatusNFSe;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Serviço de integração com o ACBr Microserviço NFS-e.
 *
 * <p>
 * Tradução fiel da classe PHP {@code AcbrNFSeService}. <br>
 * Gerencia: emissão, consulta por número/RPS e cancelamento.
 *
 * <p>
 * <b>Pré-requisito:</b> ACBr Microserviço rodando em {@code acbr.nfse.url}
 * (default http://localhost:8050).
 */
@Service
public class AcbrNFSeService {

    private static final Logger log = LoggerFactory.getLogger(AcbrNFSeService.class);

    @Value("${acbr.nfse.url:http://localhost:8050}")
    private String apiUrl;

    private final NfseIniGeneratorService iniGenerator;
    private final RestTemplate restTemplate;

    public AcbrNFSeService(NfseIniGeneratorService iniGenerator) {
        this.iniGenerator = iniGenerator;
        this.restTemplate = new RestTemplate();
    }

    // ─── 1. EMITIR ────────────────────────────────────────────────────────────

    public EmissaoResult emitir(NotaFiscalServico nota) {
        if (!nota.podeEmitir()) {
            throw new IllegalStateException("NFS-e no status " + nota.getStatus() + " não pode ser emitida.");
        }

        log.info("Enviando NFS-e RPS #{} ao ACBr...", nota.getNumeroRps());

        try {
            String iniContent = iniGenerator.gerarIni(nota);
            Map<String, Object> payload = buildPayloadEmissao(nota, iniContent);

            ResponseEntity<Map> response = post("nfse/emitir", payload);
            Map<String, Object> body = response.getBody();

            String mensagem = extractString(body, "mensagem", "detalhes");

            // Duplicidade
            if (indicaDuplicidade(mensagem)) {
                log.warn("NFS-e RPS #{}: duplicidade detectada. Consultando...", nota.getNumeroRps());
                return consultar(nota);
            }

            String xmlDistribuicao = extractString(body, "xml_distribuicao");
            if (xmlDistribuicao == null || xmlDistribuicao.isBlank()) {
                xmlDistribuicao = extrairXmlDaMensagem(mensagem);
            }

            Map<String, Object> parsed = parseIniManual(mensagem);

            String numeroNota = extrairValor(parsed, "Numero", "NumeroNfse", "NumeroNFSe");
            String protocolo = extrairValor(parsed, "Protocolo");
            String codVerif = extrairValor(parsed, "CodigoVerificacao");

            // Caso 1: Autorizado sincronamente
            if (numeroNota != null && !numeroNota.isBlank()) {
                return EmissaoResult.autorizada(numeroNota, codVerif, xmlDistribuicao, mensagem);
            }

            // Caso 2: Assíncrono — retornou protocolo
            if (protocolo != null && !protocolo.isBlank()) {
                return EmissaoResult.processando(protocolo, mensagem);
            }

            // Caso 3: Indeterminado
            return EmissaoResult.processando(null, mensagem);

        } catch (Exception e) {
            log.error("Erro ao emitir NFS-e #{}: {}", nota.getNumeroRps(), e.getMessage(), e);
            if (isErroInfraestrutura(e)) {
                return EmissaoResult.erro("Prefeitura instável: " + truncar(e.getMessage(), 200), true);
            }
            return EmissaoResult.erro(truncar(e.getMessage(), 500), false);
        }
    }

    // ─── 2. CONSULTAR (blindado — 3 tentativas) ───────────────────────────────

    public EmissaoResult consultar(NotaFiscalServico nota) {
        // Tentativa 1: por número NFS-e
        if (nota.getNumeroNfse() != null && nota.getNumeroNfse().matches("\\d+")) {
            try {
                Map<String, Object> payload = new LinkedHashMap<>();
                payload.put("numero", nota.getNumeroNfse());
                payload.put("configs", buildConfigs(nota));
                ResponseEntity<Map> resp = post("nfse/consultar-numero", payload);
                EmissaoResult r = processarConsulta(resp);
                if (r != null)
                    return r;
            } catch (Exception e) {
                log.info("Consulta por número falhou, tentando RPS...");
            }
        }

        // Tentativa 2: por RPS
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("numero", String.valueOf(nota.getNumeroRps()));
            payload.put("serie", nota.getSerieRps() != null ? nota.getSerieRps() : "1");
            payload.put("tipo", "1");
            payload.put("configs", buildConfigs(nota));
            ResponseEntity<Map> resp = post("nfse/consultar-rps", payload);
            EmissaoResult r = processarConsulta(resp);
            if (r != null)
                return r;
        } catch (Exception e) {
            log.info("Consulta por RPS falhou...");
        }

        // Tentativa 3: por protocolo
        if (nota.getProtocoloLote() != null && !nota.getProtocoloLote().isBlank()) {
            return consultarLote(nota);
        }

        return EmissaoResult.erro("Nota não encontrada na prefeitura.", false);
    }

    public EmissaoResult consultarLote(NotaFiscalServico nota) {
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("protocolo", nota.getProtocoloLote());
            payload.put("lote", nota.getId() != null ? nota.getId().toString() : "1");
            payload.put("configs", buildConfigs(nota));
            ResponseEntity<Map> resp = post("nfse/consultar-lote", payload);
            EmissaoResult r = processarConsulta(resp);
            return r != null ? r : EmissaoResult.erro("Lote não encontrado.", false);
        } catch (Exception e) {
            return EmissaoResult.erro("Erro ao consultar lote: " + e.getMessage(), isErroInfraestrutura(e));
        }
    }

    // ─── 3. CANCELAR ──────────────────────────────────────────────────────────

    public void cancelar(NotaFiscalServico nota, String motivo, String codigo) {
        if (!nota.podeCancelar()) {
            throw new IllegalStateException("Apenas notas AUTORIZADAS podem ser canceladas.");
        }
        String numeroNfse = nota.getNumeroNfse();
        if (numeroNfse == null || numeroNfse.isBlank()) {
            throw new IllegalArgumentException("Nota não possui número NFS-e gerado.");
        }

        log.info("Cancelando NFS-e #{} (ID: {})...", numeroNfse, nota.getId());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("numero_nfse", numeroNfse);
        payload.put("codigo_cancelamento", codigo != null ? codigo : "1");
        payload.put("motivo", limparTexto(motivo));
        payload.put("serie", nota.getSerieRps() != null ? nota.getSerieRps() : "1");
        payload.put("configs", buildConfigs(nota));

        ResponseEntity<Map> response = post("nfse/cancelar", payload);

        if (response.getStatusCode() == HttpStatus.UNPROCESSABLE_ENTITY) {
            throw new RuntimeException("Erro de validação (422) no cancelamento. Verifique os dados.");
        }

        Map<String, Object> body = response.getBody();
        if (body != null && Boolean.TRUE.equals(body.get("error"))) {
            String msg = extractString(body, "mensagem");
            throw new RuntimeException("Erro ACBr: " + msg);
        }

        log.info("NFS-e #{} cancelada.", numeroNfse);
    }

    // ─── Internos ─────────────────────────────────────────────────────────────

    private ResponseEntity<Map> post(String endpoint, Map<String, Object> payload) {
        String url = apiUrl + "/" + endpoint;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(payload, headers);
        return restTemplate.exchange(url, HttpMethod.POST, req, Map.class);
    }

    private EmissaoResult processarConsulta(ResponseEntity<Map> response) {
        Map<String, Object> body = response.getBody();
        if (body == null)
            return null;

        String mensagem = extractString(body, "mensagem", "detalhes");
        String xmlDistribuicao = extractString(body, "xml_distribuicao", "xml_conteudo");
        if (xmlDistribuicao == null)
            xmlDistribuicao = extrairXmlDaMensagem(mensagem);

        Map<String, Object> parsed = parseIniManual(mensagem);
        String numero = extrairValor(parsed, "Numero", "NumeroNfse", "NumeroNFSe");
        String codVerif = extrairValor(parsed, "CodigoVerificacao");

        if (numero != null && !numero.isBlank()) {
            return EmissaoResult.autorizada(numero, codVerif, xmlDistribuicao, mensagem);
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> buildConfigs(NotaFiscalServico nota) {
        // Configs mínimas — o ACBr já lê os certificados do disco
        // Quando Empresa tiver campos completos, injetar aqui
        Map<String, Object> configs = new LinkedHashMap<>();

        Map<String, Object> principal = new LinkedHashMap<>();
        principal.put("TipoResposta", "0");
        principal.put("CodificacaoResposta", "0");
        principal.put("LogNivel", "4");
        configs.put("Principal", principal);

        Map<String, Object> nfse = new LinkedHashMap<>();
        nfse.put("Timeout", "60000");
        nfse.put("Ambiente", "1"); // 1 = Produção, 2 = Homologação
        nfse.put("SSLType", "5");
        if (nota.getMunicipioIbge() != null) {
            nfse.put("CodigoMunicipio", nota.getMunicipioIbge().replaceAll("[^0-9]", ""));
        }
        configs.put("NFSe", nfse);

        return configs;
    }

    private Map<String, Object> buildPayloadEmissao(NotaFiscalServico nota, String iniContent) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("arquivo_ini", iniContent);
        payload.put("numero_rps", nota.getNumeroRps());
        payload.put("imprimir", false);
        payload.put("configs", buildConfigs(nota));
        return payload;
    }

    // ─── Parsers e Helpers ────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    Map<String, Object> parseIniManual(String content) {
        Map<String, Object> data = new LinkedHashMap<>();
        if (content == null || content.isBlank())
            return data;
        String currentSection = "Geral";
        for (String line : content.split("\r?\n")) {
            line = line.strip();
            if (line.isEmpty() || line.startsWith(";"))
                continue;
            if (line.startsWith("[") && line.endsWith("]")) {
                currentSection = line.substring(1, line.length() - 1);
                data.computeIfAbsent(currentSection, k -> new LinkedHashMap<String, Object>());
                continue;
            }
            int eq = line.indexOf('=');
            if (eq > 0) {
                String key = line.substring(0, eq).strip();
                String value = line.substring(eq + 1).strip();
                @SuppressWarnings("unchecked")
                Map<String, Object> section = (Map<String, Object>) data.computeIfAbsent(currentSection,
                        k -> new LinkedHashMap<>());
                section.put(key, value);
            }
        }
        return data;
    }

    @SuppressWarnings("unchecked")
    String extrairValor(Map<String, Object> map, String... keys) {
        if (map == null)
            return null;
        for (Object valor : map.values()) {
            if (valor instanceof Map) {
                String v = extrairValorRecursivo((Map<String, Object>) valor, keys);
                if (v != null)
                    return v;
            }
        }
        return extrairValorRecursivo(map, keys);
    }

    @SuppressWarnings("unchecked")
    private String extrairValorRecursivo(Map<String, Object> map, String[] keys) {
        for (String key : keys) {
            Object val = map.get(key);
            if (val instanceof String s && !s.isBlank())
                return s;
        }
        for (Object val : map.values()) {
            if (val instanceof Map) {
                String v = extrairValorRecursivo((Map<String, Object>) val, keys);
                if (v != null)
                    return v;
            }
        }
        return null;
    }

    private String extractString(Map<String, Object> body, String... keys) {
        if (body == null)
            return null;
        for (String key : keys) {
            Object val = body.get(key);
            if (val instanceof String s && !s.isBlank())
                return s;
        }
        return null;
    }

    private String extrairXmlDaMensagem(String content) {
        if (content == null)
            return null;
        String[] patterns = { "XmlRetorno\\s*=\\s*(<\\?xml.*?<\\/.*?>)", "Xml\\s*=\\s*(<\\?xml.*?<\\/.*?>)",
                "CompNfse\\s*=\\s*(<.*?<\\/CompNfse>)" };
        for (String p : patterns) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile(p, java.util.regex.Pattern.DOTALL)
                    .matcher(content);
            if (m.find())
                return m.group(1);
        }
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("(<\\?xml.*?<\\/\\w+>)", java.util.regex.Pattern.DOTALL).matcher(content);
        return m.find() ? m.group(1) : null;
    }

    private boolean indicaDuplicidade(String content) {
        if (content == null)
            return false;
        String norm = content.toLowerCase();
        return norm.contains("rps ja processado") || norm.contains("rps já processado")
                || norm.contains("duplicidade de rps") || norm.contains("numero do rps ja utilizado")
                || norm.contains("e156");
    }

    boolean isErroInfraestrutura(Exception e) {
        if (e == null)
            return false;
        String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        return msg.contains("timed out") || msg.contains("connection refused") || msg.contains("x999")
                || msg.contains("s:client - error") || msg.contains("connect timed out");
    }

    private String limparTexto(String s) {
        if (s == null)
            return "";
        return java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD).replaceAll("[^\\p{ASCII}]", "")
                .replaceAll("[^a-zA-Z0-9 .,;:!?()\\-/]", "").substring(0, Math.min(s.length(), 255));
    }

    private String truncar(String s, int max) {
        if (s == null)
            return "";
        return s.length() > max ? s.substring(0, max) : s;
    }

    // ─── Result VO ────────────────────────────────────────────────────────────

    public static class EmissaoResult {
        public StatusNFSe status;
        public String numeroNfse;
        public String codigoVerificacao;
        public String protocolo;
        public String xmlNfse;
        public String mensagem;
        public boolean erroInfraestrutura;

        private EmissaoResult() {
        }

        static EmissaoResult autorizada(String numero, String codVerif, String xml, String mensagem) {
            EmissaoResult r = new EmissaoResult();
            r.status = StatusNFSe.AUTORIZADA;
            r.numeroNfse = numero;
            r.codigoVerificacao = codVerif;
            r.xmlNfse = xml;
            r.mensagem = mensagem;
            return r;
        }

        static EmissaoResult processando(String protocolo, String mensagem) {
            EmissaoResult r = new EmissaoResult();
            r.status = StatusNFSe.PROCESSANDO;
            r.protocolo = protocolo;
            r.mensagem = mensagem;
            return r;
        }

        static EmissaoResult erro(String mensagem, boolean infraestrutura) {
            EmissaoResult r = new EmissaoResult();
            r.status = StatusNFSe.REJEITADA;
            r.mensagem = mensagem;
            r.erroInfraestrutura = infraestrutura;
            return r;
        }
    }
}
