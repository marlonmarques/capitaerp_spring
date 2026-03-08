package com.erp.capitalerp.application.nfse;

import com.erp.capitalerp.application.nfse.dto.ConfiguracaoNfseDTO;
import com.erp.capitalerp.domain.nfse.ConfiguracaoNfse;
import com.erp.capitalerp.infrastructure.persistence.nfse.ConfiguracaoNfseRepository;
import com.erp.capitalerp.config.multitenancy.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class ConfiguracaoNfseService {

    private final ConfiguracaoNfseRepository repository;

    public ConfiguracaoNfseService(ConfiguracaoNfseRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ConfiguracaoNfseDTO buscarConfiguracao(UUID filialId) {
        String tenantId = TenantContext.getCurrentTenant();
        ConfiguracaoNfse config;
        
        if (filialId != null) {
            config = repository.findByTenantIdentifierAndFilialId(tenantId, filialId)
                    .orElseGet(() -> {
                        ConfiguracaoNfse c = new ConfiguracaoNfse();
                        c.setTenantIdentifier(tenantId);
                        c.setFilialId(filialId);
                        return c;
                    });
        } else {
            config = repository.findTopByTenantIdentifierOrderByIdAsc(tenantId)
                    .orElse(new ConfiguracaoNfse());
        }
        
        return new ConfiguracaoNfseDTO(config);
    }

    @Transactional
    public ConfiguracaoNfseDTO salvarConfiguracao(ConfiguracaoNfseDTO dto) {
        String tenantId = TenantContext.getCurrentTenant();
        UUID filialId = dto.filialId();
        
        ConfiguracaoNfse config;
        if (filialId != null) {
            config = repository.findByTenantIdentifierAndFilialId(tenantId, filialId)
                    .orElse(new ConfiguracaoNfse());
        } else {
            config = repository.findTopByTenantIdentifierOrderByIdAsc(tenantId)
                    .orElse(new ConfiguracaoNfse());
        }

        config.setTenantIdentifier(tenantId);
        config.setFilialId(filialId);
        config.setAtivarNfse(dto.ativarNfse() != null ? dto.ativarNfse() : config.getAtivarNfse());
        config.setSerie(dto.serie() != null ? dto.serie() : config.getSerie());
        config.setNumeroRps(dto.numeroRps() != null ? dto.numeroRps() : config.getNumeroRps());
        config.setCategoriaId(dto.categoriaId());
        config.setInfoComplementarPadrao(dto.infoComplementarPadrao());
        config.setCnaePadrao(dto.cnaePadrao());
        config.setNbsPadrao(dto.nbsPadrao());
        config.setItemLc116Padrao(dto.itemLc116Padrao());
        config.setAliquotaPadrao(dto.aliquotaPadrao());
        config.setContaBancariaId(dto.contaBancariaId());
        config.setAmbiente(dto.ambiente() != null ? dto.ambiente() : config.getAmbiente());
        config.setEnviarEmail(dto.enviarEmail() != null ? dto.enviarEmail() : config.getEnviarEmail());
        config.setAssuntoEmail(dto.assuntoEmail());
        config.setMensagemEmail(dto.mensagemEmail());

        repository.save(config);

        return new ConfiguracaoNfseDTO(config);
    }
}
