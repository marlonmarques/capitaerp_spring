package com.erp.capitalerp.application.fiscal;

import com.erp.capitalerp.application.fiscal.dto.ConfiguracaoFiscalGeralDTO;
import com.erp.capitalerp.domain.fiscal.ConfiguracaoFiscalGeral;
import com.erp.capitalerp.infrastructure.persistence.fiscal.ConfiguracaoFiscalGeralRepository;
import com.erp.capitalerp.config.multitenancy.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.security.KeyStore;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Service
public class ConfiguracaoFiscalGeralService {

    private final ConfiguracaoFiscalGeralRepository repository;

    public ConfiguracaoFiscalGeralService(ConfiguracaoFiscalGeralRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ConfiguracaoFiscalGeralDTO buscarConfiguracao() {
        String tenantId = TenantContext.getCurrentTenant();
        ConfiguracaoFiscalGeral config = repository.findByTenantIdentifier(tenantId)
                .orElse(new ConfiguracaoFiscalGeral());
        return new ConfiguracaoFiscalGeralDTO(config);
    }

    @Transactional
    public ConfiguracaoFiscalGeralDTO salvarConfiguracao(ConfiguracaoFiscalGeralDTO dto) {
        String tenantId = TenantContext.getCurrentTenant();
        ConfiguracaoFiscalGeral config = repository.findByTenantIdentifier(tenantId)
                .orElse(new ConfiguracaoFiscalGeral());

        config.setTenantIdentifier(tenantId);

        // Extract base64 part if it contains data:application/x-pkcs12;base64,
        String base64Certificado = dto.getCertificado();
        if (base64Certificado != null && base64Certificado.contains(",")) {
            base64Certificado = base64Certificado.split(",")[1];
        }

        // Only update certificate if it's sent
        if (base64Certificado != null && !base64Certificado.isEmpty()) {
            config.setCertificado(base64Certificado);
            config.setSenhaCertificado(dto.getSenhaCertificado());
        } else if (dto.getSenhaCertificado() != null && !dto.getSenhaCertificado().isEmpty()) {
            config.setSenhaCertificado(dto.getSenhaCertificado());
        }

        config.setAmbienteServicos(
                dto.getAmbienteServicos() != null ? dto.getAmbienteServicos() : config.getAmbienteServicos());
        config.setAmbienteProdutos(
                dto.getAmbienteProdutos() != null ? dto.getAmbienteProdutos() : config.getAmbienteProdutos());
        config.setRegimeTributario(
                dto.getRegimeTributario() != null ? dto.getRegimeTributario() : config.getRegimeTributario());
        config.setFaturamentoAnual(
                dto.getFaturamentoAnual() != null ? dto.getFaturamentoAnual() : config.getFaturamentoAnual());
        config.setCnaePrincipal(dto.getCnaePrincipal() != null ? dto.getCnaePrincipal() : config.getCnaePrincipal());

        repository.save(config);

        return new ConfiguracaoFiscalGeralDTO(config);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCertificadoInfo() {
        String tenantId = TenantContext.getCurrentTenant();
        ConfiguracaoFiscalGeral config = repository.findByTenantIdentifier(tenantId).orElse(null);
        Map<String, Object> response = new HashMap<>();

        if (config == null || config.getCertificado() == null || config.getCertificado().isEmpty()) {
            response.put("status", "SEM_CERTIFICADO");
            return response;
        }

        try {
            byte[] pfxBytes = Base64.getDecoder().decode(config.getCertificado());
            KeyStore p12 = KeyStore.getInstance("PKCS12");
            p12.load(new ByteArrayInputStream(pfxBytes), config.getSenhaCertificado().toCharArray());

            Enumeration<String> e = p12.aliases();
            String alias = null;
            while (e.hasMoreElements()) {
                String a = e.nextElement();
                if (p12.isKeyEntry(a)) {
                    alias = a;
                    break;
                }
            }

            if (alias != null) {
                X509Certificate cert = (X509Certificate) p12.getCertificate(alias);
                Date validTo = cert.getNotAfter();
                long diasRestantes = (validTo.getTime() - System.currentTimeMillis()) / (1000 * 60 * 60 * 24);

                String subjectDN = cert.getSubjectX500Principal().getName();
                // extrair CN (Common Name) de forma simples
                String cn = subjectDN;
                String[] parts = subjectDN.split(",");
                for (String part : parts) {
                    if (part.trim().startsWith("CN=")) {
                        cn = part.trim().substring(3);
                        break;
                    }
                }

                response.put("status", diasRestantes < 0 ? "EXPIRADO" : "VALIDO");
                response.put("vencimento", validTo);
                response.put("diasRestantes", diasRestantes);
                response.put("emissor", cn);
                return response;
            }

            response.put("status", "ERRO_LEITURA");
            return response;

        } catch (Exception ex) {
            response.put("status", "SENHA_INCORRETA");
            return response;
        }
    }
}
