package com.erp.capitalerp.application.cadastros;

import com.erp.capitalerp.application.cadastros.dto.GrupoTributarioDTO;
import com.erp.capitalerp.domain.fiscal.GrupoTributario;
import com.erp.capitalerp.domain.shared.ResourceNotFoundExcepiton;
import com.erp.capitalerp.infrastructure.persistence.cadastros.GrupoTributarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class GrupoTributarioService {

    private final GrupoTributarioRepository repository;

    public GrupoTributarioService(GrupoTributarioRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<GrupoTributarioDTO> findAll() {
        return repository.findByAtivoTrue().stream().map(GrupoTributarioDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GrupoTributarioDTO> findAllIncludingInactive() {
        return repository.findAll().stream().map(GrupoTributarioDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GrupoTributarioDTO findById(UUID id) {
        GrupoTributario entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundExcepiton("Grupo tributário não encontrado: " + id));
        return new GrupoTributarioDTO(entity);
    }

    public GrupoTributarioDTO insert(GrupoTributarioDTO dto) {
        GrupoTributario entity = new GrupoTributario();
        copyToEntity(dto, entity);
        return new GrupoTributarioDTO(repository.save(entity));
    }

    public GrupoTributarioDTO update(UUID id, GrupoTributarioDTO dto) {
        GrupoTributario entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundExcepiton("Grupo tributário não encontrado: " + id));
        copyToEntity(dto, entity);
        return new GrupoTributarioDTO(repository.save(entity));
    }

    public void delete(UUID id) {
        GrupoTributario entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundExcepiton("Grupo tributário não encontrado: " + id));
        // Soft delete
        entity.setAtivo(false);
        repository.save(entity);
    }

    private void copyToEntity(GrupoTributarioDTO dto, GrupoTributario e) {
        e.setNome(dto.getNome());
        e.setDescricao(dto.getDescricao());
        e.setRegime(dto.getRegime());
        e.setTipoImposto(dto.getTipoImposto());
        e.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);

        // ICMS
        e.setCstCsosn(dto.getCstCsosn());
        e.setAliquotaIcms(dto.getAliquotaIcms());
        e.setReducaoBaseIcms(dto.getReducaoBaseIcms());
        e.setAliquotaDifal(dto.getAliquotaDifal());

        // ICMS ST
        e.setAliquotaSt(dto.getAliquotaSt());
        e.setMva(dto.getMva());
        e.setReducaoBaseSt(dto.getReducaoBaseSt());

        // IPI
        e.setCstIpi(dto.getCstIpi());
        e.setAliquotaIpi(dto.getAliquotaIpi());

        // PIS / COFINS
        e.setCstPis(dto.getCstPis());
        e.setAliquotaPis(dto.getAliquotaPis());
        e.setCstCofins(dto.getCstCofins());
        e.setAliquotaCofins(dto.getAliquotaCofins());

        // ISS
        e.setAliquotaIss(dto.getAliquotaIss());
        e.setReterIss(dto.getReterIss() != null ? dto.getReterIss() : false);

        // CFOP
        e.setCfopSaida(dto.getCfopSaida());
        e.setCfopEntrada(dto.getCfopEntrada());

        // Reforma Tributária
        e.setAliquotaIbs(dto.getAliquotaIbs());
        e.setAliquotaCbs(dto.getAliquotaCbs());
        e.setAliquotaIs(dto.getAliquotaIs());
        e.setCodigoIs(dto.getCodigoIs());
        e.setRegimeEspecialReforma(dto.getRegimeEspecialReforma());
    }
}
