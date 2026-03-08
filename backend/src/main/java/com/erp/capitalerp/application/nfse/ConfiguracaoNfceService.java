package com.erp.capitalerp.application.nfse;

import com.erp.capitalerp.application.nfse.dto.ConfiguracaoNfceDTO;
import com.erp.capitalerp.domain.nfse.ConfiguracaoNfce;
import com.erp.capitalerp.infrastructure.persistence.nfse.ConfiguracaoNfceRepository;
import com.erp.capitalerp.config.multitenancy.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class ConfiguracaoNfceService {

    private final ConfiguracaoNfceRepository repository;

    public ConfiguracaoNfceService(ConfiguracaoNfceRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ConfiguracaoNfceDTO buscarConfiguracao(UUID filialId) {
        String tenant = TenantContext.getCurrentTenant();
        ConfiguracaoNfce config;
        
        if (filialId != null) {
            config = repository.findByTenantIdentifierAndFilialId(tenant, filialId)
                    .orElseGet(() -> initDefaultConfig(tenant, filialId));
        } else {
            config = repository.findByTenantIdentifier(tenant)
                    .orElseGet(() -> initDefaultConfig(tenant, null));
        }
        
        return toDTO(config);
    }

    @Transactional
    public ConfiguracaoNfceDTO salvarConfiguracao(ConfiguracaoNfceDTO dto) {
        String tenant = TenantContext.getCurrentTenant();
        UUID filialId = dto.filialId();
        
        ConfiguracaoNfce config;
        if (filialId != null) {
            config = repository.findByTenantIdentifierAndFilialId(tenant, filialId)
                    .orElseGet(() -> initDefaultConfig(tenant, filialId));
        } else {
            config = repository.findByTenantIdentifier(tenant)
                    .orElseGet(() -> initDefaultConfig(tenant, null));
        }

        config.setFilialId(filialId);
        config.setAtivarNfce(dto.ativarNfce());
        config.setSerie(dto.serie());
        config.setNumeroNfce(dto.numeroNfce());
        config.setCategoriaId(dto.categoriaId());
        config.setInfoComplementarPadrao(dto.infoComplementarPadrao());
        config.setCfopPadrao(dto.cfopPadrao());
        config.setContaBancariaId(dto.contaBancariaId());
        config.setAmbiente(dto.ambiente());
        config.setEnviarEmail(dto.enviarEmail());
        config.setAssuntoEmail(dto.assuntoEmail());
        config.setMensagemEmail(dto.mensagemEmail());
        config.setIdCsc(dto.idCsc());
        config.setCsc(dto.csc());

        config = repository.save(config);
        return toDTO(config);
    }

    private ConfiguracaoNfce initDefaultConfig(String tenant, UUID filialId) {
        ConfiguracaoNfce config = new ConfiguracaoNfce();
        config.setTenantIdentifier(tenant);
        config.setFilialId(filialId);
        return config;
    }

    private ConfiguracaoNfceDTO toDTO(ConfiguracaoNfce config) {
        return new ConfiguracaoNfceDTO(config.getId(), config.getFilialId(), config.getAtivarNfce(), config.getSerie(),
                config.getNumeroNfce(), config.getCategoriaId(), config.getInfoComplementarPadrao(),
                config.getCfopPadrao(), config.getContaBancariaId(), config.getAmbiente(), config.getEnviarEmail(),
                config.getAssuntoEmail(), config.getMensagemEmail(), config.getIdCsc(), config.getCsc());
    }
}
