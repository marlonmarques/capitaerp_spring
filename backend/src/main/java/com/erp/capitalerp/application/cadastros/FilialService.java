package com.erp.capitalerp.application.cadastros;

import com.erp.capitalerp.application.cadastros.dto.FilialDTO;
import com.erp.capitalerp.config.multitenancy.TenantContext;
import com.erp.capitalerp.domain.cadastros.Filial;
import com.erp.capitalerp.infrastructure.persistence.cadastros.FilialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FilialService {

    private final FilialRepository repository;

    public FilialService(FilialRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<FilialDTO> listarTodas() {
        String tenant = TenantContext.getCurrentTenant();
        return repository.findByTenantIdentifier(tenant).stream().map(FilialDTO::new).collect(Collectors.toList());
    }

    @Transactional
    public FilialDTO salvar(FilialDTO dto) {
        String tenant = TenantContext.getCurrentTenant();

        Filial filial = new Filial();
        if (dto.getId() != null) {
            filial = repository.findByIdAndTenantIdentifier(dto.getId(), tenant)
                    .orElseThrow(() -> new RuntimeException("Filial não encontrada"));
        }

        filial.setTenantIdentifier(tenant);
        filial.setRazaoSocial(dto.getRazaoSocial());
        filial.setNomeFantasia(dto.getNomeFantasia());
        filial.setCnpj(dto.getCnpj());
        filial.setInscricaoEstadual(dto.getInscricaoEstadual());
        filial.setInscricaoMunicipal(dto.getInscricaoMunicipal());
        filial.setCrt(dto.getCrt());
        filial.setIsMatriz(dto.getIsMatriz() != null ? dto.getIsMatriz() : false);
        filial.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);

        return new FilialDTO(repository.save(filial));
    }
}
