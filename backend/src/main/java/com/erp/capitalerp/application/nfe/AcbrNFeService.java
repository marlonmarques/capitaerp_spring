package com.erp.capitalerp.application.nfe;

import com.erp.capitalerp.domain.cadastros.Filial;
import com.erp.capitalerp.domain.fiscal.ConfiguracaoFiscalGeral;
import com.erp.capitalerp.domain.nfe.*;
import com.erp.capitalerp.infrastructure.persistence.cadastros.FilialRepository;
import com.erp.capitalerp.infrastructure.persistence.fiscal.ConfiguracaoFiscalGeralRepository;
import com.erp.capitalerp.infrastructure.persistence.nfse.ConfiguracaoNfceRepository;
import com.erp.capitalerp.infrastructure.persistence.nfse.ConfiguracaoNfeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AcbrNFeService {

    private static final Logger log = LoggerFactory.getLogger(AcbrNFeService.class);

    @Value("${acbr.nfe.url:http://localhost:8050}")
    private String apiUrl;

    private final NfeIniGeneratorService iniGenerator;
    private final RestTemplate restTemplate;
    private final ConfiguracaoFiscalGeralRepository configGeralRepository;
    private final FilialRepository filialRepository;

    public AcbrNFeService(NfeIniGeneratorService iniGenerator, 
                          ConfiguracaoFiscalGeralRepository configGeralRepository,
                          FilialRepository filialRepository) {
        this.iniGenerator = iniGenerator;
        this.configGeralRepository = configGeralRepository;
        this.filialRepository = filialRepository;
        this.restTemplate = new RestTemplate();
    }

    public EmissaoResult emitir(NotaFiscalProduto nota) {
        log.info("--- INICIO EMISSAO NFe ID {} ---", nota.getId());

        try {
            Filial filial = filialRepository.findById(nota.getFilialId())
                    .orElseThrow(() -> new RuntimeException("Filial não encontrada"));
            
            ConfiguracaoFiscalGeral configGeral = configGeralRepository.findByTenantIdentifierAndFilialId(nota.getTenantIdentifier(), nota.getFilialId())
                    .orElseThrow(() -> new RuntimeException("Configuração fiscal não encontrada para esta filial"));

            String iniContent = iniGenerator.gerarIni(nota, filial);

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("conteudo", iniContent);
            payload.put("numero_nota", nota.getNumero());
            payload.put("modelo", nota.getModelo().getValue());
            payload.put("id_lote", nota.getId().toString());
            payload.put("configs", getConfigs(filial, configGeral, nota.getModelo().getValue()));

            ResponseEntity<Map> response = post("nfe/emitir", payload, filial.getCnpj());
            
            return processarRespostaEmissao(response, nota);

        } catch (Exception e) {
            log.error("Erro fatal na emissão NFe: {}", e.getMessage());
            return EmissaoResult.erro("Erro fatal: " + e.getMessage(), false);
        }
    }

    public void syncCertificado(Filial filial, String certBase64, String senha) {
        log.info("Sincronizando certificado para filial: {}", filial.getCnpj());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("senha_pfx", senha);
        payload.put("cnpj", filial.getCnpj().replaceAll("[^0-9]", ""));
        payload.put("razao_social", filial.getRazaoSocial());
        
        Map<String, String> endereco = new LinkedHashMap<>();
        endereco.put("logradouro", filial.getLogradouro());
        endereco.put("numero", filial.getNumero());
        endereco.put("bairro", filial.getBairro());
        endereco.put("cidade", filial.getCidade());
        endereco.put("uf", filial.getEstado());
        endereco.put("cep", filial.getCep().replaceAll("[^0-9]", ""));
        endereco.put("codigo_municipio", filial.getIbge());
        payload.put("endereco", endereco);
        payload.put("certificado_base64", certBase64);

        post("empresa/upload-certificado", payload, filial.getCnpj());
    }

    public void syncLogo(Filial filial, String logoBase64) {
        log.info("Sincronizando logo para filial: {}", filial.getCnpj());
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("logo_base64", logoBase64);
        post("empresa/upload-logo", payload, filial.getCnpj());
    }

    public EmissaoResult consultar(NotaFiscalProduto nota) {
        if (nota.getChaveNfe() == null || nota.getChaveNfe().isBlank()) {
            return EmissaoResult.erro("Nota sem Chave de Acesso.", false);
        }

        try {
            Filial filial = filialRepository.findById(nota.getFilialId())
                    .orElseThrow(() -> new RuntimeException("Filial não encontrada"));
            
            ConfiguracaoFiscalGeral configGeral = configGeralRepository.findByTenantIdentifierAndFilialId(nota.getTenantIdentifier(), nota.getFilialId())
                    .orElseThrow(() -> new RuntimeException("Configuração fiscal não encontrada para esta filial"));

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("chave", nota.getChaveNfe());
            payload.put("configs", getConfigs(filial, configGeral, nota.getModelo().getValue()));

            ResponseEntity<Map> response = post("nfe/consultar", payload, filial.getCnpj());
            return processarRespostaEmissao(response, nota);

        } catch (Exception e) {
            log.error("Erro ao consultar NFe: {}", e.getMessage());
            return EmissaoResult.erro("Erro consulta: " + e.getMessage(), false);
        }
    }

    public EmissaoResult cancelar(NotaFiscalProduto nota, String justificativa) {
        if (justificativa == null || justificativa.length() < 15) {
            return EmissaoResult.erro("Justificativa deve ter no mínimo 15 caracteres.", false);
        }

        try {
            Filial filial = filialRepository.findById(nota.getFilialId())
                    .orElseThrow(() -> new RuntimeException("Filial não encontrada"));
            
            ConfiguracaoFiscalGeral configGeral = configGeralRepository.findByTenantIdentifierAndFilialId(nota.getTenantIdentifier(), nota.getFilialId())
                    .orElseThrow(() -> new RuntimeException("Configuração fiscal não encontrada para esta filial"));

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("chave", nota.getChaveNfe());
            payload.put("justificativa", justificativa);
            payload.put("cnpj_cpf", filial.getCnpj().replaceAll("[^0-9]", ""));
            payload.put("configs", getConfigs(filial, configGeral, nota.getModelo().getValue()));

            ResponseEntity<Map> response = post("nfe/cancelar", payload, filial.getCnpj());
            return processarRespostaEmissao(response, nota);

        } catch (Exception e) {
            log.error("Erro ao cancelar NFe: {}", e.getMessage());
            return EmissaoResult.erro("Erro cancelamento: " + e.getMessage(), false);
        }
    }

    public EmissaoResult cartaCorrecao(NotaFiscalProduto nota, String texto, int sequencia) {
        try {
            Filial filial = filialRepository.findById(nota.getFilialId())
                    .orElseThrow(() -> new RuntimeException("Filial não encontrada"));
            
            ConfiguracaoFiscalGeral configGeral = configGeralRepository.findByTenantIdentifierAndFilialId(nota.getTenantIdentifier(), nota.getFilialId())
                    .orElseThrow(() -> new RuntimeException("Configuração fiscal não encontrada para esta filial"));

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("chave", nota.getChaveNfe());
            payload.put("texto_correcao", texto);
            payload.put("sequencia", sequencia);
            payload.put("configs", getConfigs(filial, configGeral, nota.getModelo().getValue()));

            ResponseEntity<Map> response = post("nfe/cce", payload, filial.getCnpj());
            return processarRespostaEmissao(response, nota);

        } catch (Exception e) {
            log.error("Erro ao enviar CC-e NFe: {}", e.getMessage());
            return EmissaoResult.erro("Erro CC-e: " + e.getMessage(), false);
        }
    }

    private EmissaoResult processarRespostaEmissao(ResponseEntity<Map> response, NotaFiscalProduto nota) {
        Map<String, Object> body = response.getBody();
        if (body == null) {
            return EmissaoResult.erro("Resposta vazia da API ACBr", false);
        }

        if (Boolean.TRUE.equals(body.get("error"))) {
            return EmissaoResult.erro((String) body.get("mensagem"), false);
        }

        String iniRetorno = (String) body.get("mensagem");
        Map<String, Map<String, String>> dados = parseIniManual(iniRetorno);

        String cStat = buscarValor(dados, "cStat", "CStat");
        String xMotivo = buscarValor(dados, "xMotivo", "XMotivo", "Msg");
        String chave = buscarValor(dados, "chNFe", "chnfe", "chDFe");
        String protocolo = buscarValor(dados, "nProt", "NProt");
        String recibo = buscarValor(dados, "nRec", "NRec");

        String xml = (String) body.get("xml_distribuicao");
        if (xml == null || xml.isBlank()) {
            xml = buscarValor(dados, "XML", "xml");
        }

        int cStatInt = cStat != null ? Integer.parseInt(cStat) : 0;

        if (cStatInt == 100 || cStatInt == 150) {
            return EmissaoResult.autorizada(chave, protocolo, xml, xMotivo, cStat);
        }

        if (cStatInt == 101 || cStatInt == 135 || cStatInt == 151 || cStatInt == 155) {
            return EmissaoResult.evento(cStat, xMotivo, xml);
        }

        if (cStatInt == 103 || cStatInt == 105) {
            return EmissaoResult.processando(recibo, xMotivo, cStat);
        }

        return EmissaoResult.erro("[" + cStat + "] " + xMotivo, false);
    }

    private Map<String, Object> getConfigs(Filial filial, ConfiguracaoFiscalGeral configGeral, String modelo) {
        String docFolder = filial.getCnpj().replaceAll("[^0-9]", "");
        String dockerBase = "/var/www/html/storage/app/empresas/" + docFolder;

        Map<String, Object> configs = new LinkedHashMap<>();

        configs.put("Principal", Map.of(
            "TipoResposta", "0",
            "CodificacaoResposta", "0",
            "LogNivel", "4",
            "LogPath", dockerBase + "/logs"
        ));

        configs.put("DFe", Map.of(
            "ArquivoPFX", dockerBase + "/certs/certificado.pfx",
            "Senha", configGeral.getSenhaCertificado() != null ? configGeral.getSenhaCertificado() : "",
            "SSLCryptLib", "1",
            "SSLHttpLib", "3",
            "SSLXmlSignLib", "4",
            "UF", filial.getEstado()
        ));

        configs.put("NFe", Map.of(
            "ModeloDF", "65".equals(modelo) ? "1" : "0",
            "VersaoDF", "3", // 4.00 
            "Ambiente", "PRODUCAO".equalsIgnoreCase(configGeral.getAmbienteProdutos()) ? "0" : "1",
            "SSLType", "5",
            "PathSalvar", dockerBase + "/nfe_files",
            "PathSchemas", "/var/www/html/schemas/NFe",
            "Timeout", "10000",
            "Tentativas", "3"
        ));

        configs.put("DANFE", Map.of(
            "PathPDF", dockerBase + "/pdf",
            "Logo", dockerBase + "/certs/logo.png"
        ));

        return configs;
    }

    private ResponseEntity<Map> post(String endpoint, Map<String, Object> payload, String cnpj) {
        String url = apiUrl + "/" + endpoint;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("empresa-id", cnpj.replaceAll("[^0-9]", ""));

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(payload, headers);
        return restTemplate.exchange(url, HttpMethod.POST, req, Map.class);
    }

    private Map<String, Map<String, String>> parseIniManual(String content) {
        Map<String, Map<String, String>> res = new LinkedHashMap<>();
        if (content == null || content.isBlank()) return res;

        String currentSection = "Root";
        res.put(currentSection, new LinkedHashMap<>());

        for (String line : content.split("\n")) {
            line = line.trim();
            if (line.isEmpty() || line.startsWith(";") || line.startsWith("#")) continue;

            if (line.startsWith("[") && line.endsWith("]")) {
                currentSection = line.substring(1, line.length() - 1);
                res.put(currentSection, new LinkedHashMap<>());
            } else if (line.contains("=")) {
                String[] parts = line.split("=", 2);
                res.get(currentSection).put(parts[0].trim(), parts[1].trim());
            }
        }
        return res;
    }

    private String buscarValor(Map<String, Map<String, String>> dados, String... chaves) {
        for (Map<String, String> section : dados.values()) {
            for (String key : chaves) {
                if (section.containsKey(key)) return section.get(key);
            }
        }
        return null;
    }

    public static class EmissaoResult {
        public StatusNFe status;
        public String chave;
        public String protocolo;
        public String xml;
        public String mensagem;
        public String cStat;
        public boolean retry;

        public static EmissaoResult autorizada(String chave, String protocolo, String xml, String mensagem, String cStat) {
            EmissaoResult r = new EmissaoResult();
            r.status = StatusNFe.AUTORIZADA;
            r.chave = chave;
            r.protocolo = protocolo;
            r.xml = xml;
            r.mensagem = mensagem;
            r.cStat = cStat;
            return r;
        }

        public static EmissaoResult processando(String protocolo, String mensagem, String cStat) {
            EmissaoResult r = new EmissaoResult();
            r.status = StatusNFe.PROCESSANDO;
            r.protocolo = protocolo;
            r.mensagem = mensagem;
            r.cStat = cStat;
            return r;
        }

        public static EmissaoResult evento(String cStat, String mensagem, String xml) {
            EmissaoResult r = new EmissaoResult();
            r.status = StatusNFe.EVENTO;
            r.mensagem = mensagem;
            r.cStat = cStat;
            r.xml = xml;
            return r;
        }

        public static EmissaoResult erro(String mensagem, boolean retry) {
            EmissaoResult r = new EmissaoResult();
            r.status = StatusNFe.REJEITADA;
            r.mensagem = mensagem;
            r.retry = retry;
            return r;
        }
    }
}
