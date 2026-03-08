package com.erp.capitalerp.application.cadastros;

import com.erp.capitalerp.application.cadastros.dto.PdvDTO;
import com.erp.capitalerp.config.multitenancy.TenantContext;
import com.erp.capitalerp.domain.cadastros.Filial;
import com.erp.capitalerp.domain.cadastros.Pdv;
import com.erp.capitalerp.infrastructure.persistence.cadastros.FilialRepository;
import com.erp.capitalerp.infrastructure.persistence.cadastros.PdvRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PdvService {

    private final PdvRepository repository;
    private final FilialRepository filialRepository;

    public PdvService(PdvRepository repository, FilialRepository filialRepository) {
        this.repository = repository;
        this.filialRepository = filialRepository;
    }

    @Transactional(readOnly = true)
    public List<PdvDTO> listarPorFilial(UUID filialId) {
        String tenant = TenantContext.getCurrentTenant();
        return repository.findByFilialIdAndTenantIdentifier(filialId, tenant).stream().map(PdvDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public PdvDTO salvar(PdvDTO dto) {
        String tenant = TenantContext.getCurrentTenant();

        Pdv pdv = new Pdv();
        if (dto.getId() != null) {
            pdv = repository.findByIdAndTenantIdentifier(dto.getId(), tenant)
                    .orElseThrow(() -> new RuntimeException("PDV não encontrado"));
        }

        Filial filial = filialRepository.findByIdAndTenantIdentifier(dto.getFilialId(), tenant)
                .orElseThrow(() -> new RuntimeException("Filial não encontrada"));

        pdv.setTenantIdentifier(tenant);
        pdv.setFilial(filial);
        pdv.setNome(dto.getNome());

        // Blindagem: Se já emitiu nota (numero > 1), não permite alterar série ou número
        if (dto.getId() != null && pdv.getNumeroAtualNfce() > 1) {
            if (!pdv.getSerieNfce().equals(dto.getSerieNfce())) {
                throw new RuntimeException("Série não pode ser alterada após emissão de notas.");
            }
            if (!pdv.getNumeroAtualNfce().equals(dto.getNumeroAtualNfce())) {
                throw new RuntimeException("O contador de notas não pode ser alterado manualmente após o início das emissões.");
            }
        } else {
            pdv.setSerieNfce(dto.getSerieNfce());
            pdv.setNumeroAtualNfce(dto.getNumeroAtualNfce() != null ? dto.getNumeroAtualNfce() : 1);
        }

        pdv.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);

        return new PdvDTO(repository.save(pdv));
    }

    @Transactional
    public Integer obterProximoNumero(UUID pdvId) {
        String tenant = TenantContext.getCurrentTenant();
        Pdv pdv = repository.findByIdAndTenantIdentifier(pdvId, tenant)
                .orElseThrow(() -> new RuntimeException("PDV não encontrado"));

        Integer atual = pdv.getNumeroAtualNfce();
        pdv.setNumeroAtualNfce(atual + 1);
        repository.save(pdv); // Saves updated number safely locking in transaction implicitly
        return atual;
    }
}
