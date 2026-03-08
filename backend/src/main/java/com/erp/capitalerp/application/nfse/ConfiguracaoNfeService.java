package com.erp.capitalerp.application.nfse;

import com.erp.capitalerp.application.nfse.dto.ConfiguracaoNfeDTO;
import com.erp.capitalerp.domain.nfse.ConfiguracaoNfe;
import com.erp.capitalerp.infrastructure.persistence.nfse.ConfiguracaoNfeRepository;
import com.erp.capitalerp.config.multitenancy.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class ConfiguracaoNfeService {

    private final ConfiguracaoNfeRepository repository;

    public ConfiguracaoNfeService(ConfiguracaoNfeRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ConfiguracaoNfeDTO buscarConfiguracao(UUID filialId) {
        String tenantId = TenantContext.getCurrentTenant();
        ConfiguracaoNfe config;
        
        if (filialId != null) {
            config = repository.findByTenantIdentifierAndFilialId(tenantId, filialId)
                    .orElseGet(() -> {
                        ConfiguracaoNfe c = new ConfiguracaoNfe();
                        c.setTenantIdentifier(tenantId);
                        c.setFilialId(filialId);
                        return c;
                    });
        } else {
            config = repository.findTopByTenantIdentifierOrderByIdAsc(tenantId)
                    .orElse(new ConfiguracaoNfe());
        }
        
        return new ConfiguracaoNfeDTO(config);
    }

    @Transactional
    public ConfiguracaoNfeDTO salvarConfiguracao(ConfiguracaoNfeDTO dto) {
        String tenantId = TenantContext.getCurrentTenant();
        UUID filialId = dto.filialId();
        
        ConfiguracaoNfe config;
        if (filialId != null) {
            config = repository.findByTenantIdentifierAndFilialId(tenantId, filialId)
                    .orElse(new ConfiguracaoNfe());
        } else {
            config = repository.findTopByTenantIdentifierOrderByIdAsc(tenantId)
                    .orElse(new ConfiguracaoNfe());
        }

        config.setTenantIdentifier(tenantId);
        config.setFilialId(filialId);
        config.setAtivarNfe(dto.ativarNfe() != null ? dto.ativarNfe() : config.getAtivarNfe());
        config.setSerie(dto.serie() != null ? dto.serie() : config.getSerie());
        config.setNumeroNfe(dto.numeroNfe() != null ? dto.numeroNfe() : config.getNumeroNfe());
        config.setCategoriaId(dto.categoriaId());
        config.setInfoComplementarPadrao(dto.infoComplementarPadrao());
        config.setCfopPadrao(dto.cfopPadrao());
        config.setNaturezaOperacaoPadrao(dto.naturezaOperacaoPadrao());
        config.setContaBancariaId(dto.contaBancariaId());
        config.setAmbiente(dto.ambiente() != null ? dto.ambiente() : config.getAmbiente());
        config.setEnviarEmail(dto.enviarEmail() != null ? dto.enviarEmail() : config.getEnviarEmail());
        config.setAssuntoEmail(dto.assuntoEmail());
        config.setMensagemEmail(dto.mensagemEmail());

        repository.save(config);

        return new ConfiguracaoNfeDTO(config);
    }
}
