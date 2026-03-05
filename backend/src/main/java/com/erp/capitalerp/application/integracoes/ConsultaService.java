package com.erp.capitalerp.application.integracoes;

import com.erp.capitalerp.application.integracoes.dto.CepDTO;
import com.erp.capitalerp.application.integracoes.dto.CnpjDTO;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ConsultaService {

    private final RestTemplate restTemplate;

    public ConsultaService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    public CepDTO consultarCep(String cep) {
        String cleanCep = cep.replaceAll("[^0-9]", "");
        if (cleanCep.length() != 8) {
            CepDTO erro = new CepDTO();
            erro.setSucesso(false);
            erro.setErro("CEP inválido");
            return erro;
        }

        try {
            String url = "https://viacep.com.br/ws/" + cleanCep + "/json/";
            ResponseEntity<CepDTO> response = restTemplate.getForEntity(url, CepDTO.class);
            CepDTO cepDto = response.getBody();
            if (cepDto != null && cepDto.getErro() != null && cepDto.getErro().equals("true")) {
                cepDto.setSucesso(false);
                cepDto.setErro("CEP não encontrado");
                return cepDto;
            }
            if (cepDto != null) {
                cepDto.setSucesso(true);
            }
            return cepDto;
        } catch (Exception e) {
            CepDTO erro = new CepDTO();
            erro.setSucesso(false);
            erro.setErro("Erro na consulta do CEP: " + e.getMessage());
            return erro;
        }
    }

    public CnpjDTO consultarCnpj(String cnpj) {
        String cleanCnpj = cnpj.replaceAll("[^0-9]", "");
        if (cleanCnpj.length() != 14) {
            CnpjDTO erro = new CnpjDTO();
            erro.setSucesso(false);
            erro.setErro("CNPJ inválido");
            return erro;
        }

        try {
            // Utilizamos a BrasilAPI, pois não possui restrição severa de CORS/Rate Limit e
            // retorna tudo rápido.
            String url = "https://brasilapi.com.br/api/cnpj/v1/" + cleanCnpj;

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || response.containsKey("message")) {
                CnpjDTO erro = new CnpjDTO();
                erro.setSucesso(false);
                erro.setErro(
                        "Erro na consulta do CNPJ: " + (response != null ? response.get("message") : "Sem resposta"));
                return erro;
            }

            CnpjDTO dto = new CnpjDTO();
            dto.setCnpj(cleanCnpj);
            dto.setRazaoSocial((String) response.get("razao_social"));
            dto.setNomeFantasia((String) response.get("nome_fantasia"));
            dto.setCep(response.get("cep") != null ? String.valueOf(response.get("cep")) : "");
            dto.setLogradouro((String) response.get("logradouro"));
            dto.setNumero((String) response.get("numero"));
            dto.setComplemento((String) response.get("complemento"));
            dto.setBairro((String) response.get("bairro"));
            dto.setMunicipio((String) response.get("municipio"));
            dto.setUf((String) response.get("uf"));
            dto.setTelefone((String) response.get("ddd_telefone_1"));
            dto.setEmail((String) response.get("email"));
            dto.setSucesso(true);

            return dto;
        } catch (Exception e) {
            // Fallback para ReceitaWS
            try {
                String url = "https://www.receitaws.com.br/v1/cnpj/" + cleanCnpj;
                @SuppressWarnings("unchecked")
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);

                if (response == null || "ERROR".equals(response.get("status"))) {
                    CnpjDTO erro = new CnpjDTO();
                    erro.setSucesso(false);
                    erro.setErro("CNPJ não encontrado");
                    return erro;
                }

                CnpjDTO dto = new CnpjDTO();
                dto.setCnpj(cleanCnpj);
                dto.setRazaoSocial((String) response.get("nome"));
                dto.setNomeFantasia((String) response.get("fantasia"));
                dto.setCep(response.get("cep") != null ? String.valueOf(response.get("cep")) : "");
                dto.setLogradouro((String) response.get("logradouro"));
                dto.setNumero((String) response.get("numero"));
                dto.setComplemento((String) response.get("complemento"));
                dto.setBairro((String) response.get("bairro"));
                dto.setMunicipio((String) response.get("municipio"));
                dto.setUf((String) response.get("uf"));
                dto.setTelefone((String) response.get("telefone"));
                dto.setEmail((String) response.get("email"));
                dto.setSucesso(true);
                return dto;

            } catch (Exception ex) {
                CnpjDTO erro = new CnpjDTO();
                erro.setSucesso(false);
                erro.setErro("Erro na consulta do CNPJ nas APIs: " + ex.getMessage());
                return erro;
            }
        }
    }
}
