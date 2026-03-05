package com.erp.capitalerp.application.nfse;

import com.erp.capitalerp.application.nfse.dto.ConfiguracaoNfseDTO;
import com.erp.capitalerp.domain.nfse.ConfiguracaoNfse;
import com.erp.capitalerp.infrastructure.persistence.nfse.ConfiguracaoNfseRepository;
import com.erp.capitalerp.config.multitenancy.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConfiguracaoNfseService {

    private final ConfiguracaoNfseRepository repository;

    public ConfiguracaoNfseService(ConfiguracaoNfseRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ConfiguracaoNfseDTO buscarConfiguracao() {
        String tenantId = TenantContext.getCurrentTenant();
        ConfiguracaoNfse config = repository.findTopByTenantIdentifierOrderByIdAsc(tenantId)
                .orElse(new ConfiguracaoNfse()); // Retorna vazio caso não tenha config ainda
        return new ConfiguracaoNfseDTO(config);
    }

    @Transactional
    public ConfiguracaoNfseDTO salvarConfiguracao(ConfiguracaoNfseDTO dto) {
        String tenantId = TenantContext.getCurrentTenant();
        ConfiguracaoNfse config = repository.findTopByTenantIdentifierOrderByIdAsc(tenantId)
                .orElse(new ConfiguracaoNfse());

        config.setTenantIdentifier(tenantId);
        config.setAtivarNfse(dto.ativarNfse() != null ? dto.ativarNfse() : config.getAtivarNfse());
        config.setSerie(dto.serie() != null ? dto.serie() : config.getSerie());
        config.setNumeroRps(dto.numeroRps() != null ? dto.numeroRps() : config.getNumeroRps());
        config.setCategoriaId(dto.categoriaId());
        config.setInfoComplementarPadrao(dto.infoComplementarPadrao());
        config.setCnaePadrao(dto.cnaePadrao());
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
