package com.erp.capitalerp.application.servicos;

import com.erp.capitalerp.application.servicos.dto.ServicoDTO;
import com.erp.capitalerp.domain.servico.Servico;
import com.erp.capitalerp.infrastructure.persistence.servicos.ServicoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class ServicoService {

    private final ServicoRepository servicoRepository;

    public ServicoService(ServicoRepository servicoRepository) {
        this.servicoRepository = servicoRepository;
    }

    @Transactional(readOnly = true)
    public Page<ServicoDTO> listar(String busca, Pageable pageable) {
        return servicoRepository.findComFiltros(busca, pageable).map(ServicoDTO::new);
    }

    @Transactional(readOnly = true)
    public ServicoDTO buscarPorId(UUID id) {
        Servico servico = servicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado: " + id));
        return new ServicoDTO(servico);
    }

    @Transactional
    public ServicoDTO criar(ServicoDTO dto) {
        Servico servico = new Servico();
        copyDtoToEntity(dto, servico);
        servico = servicoRepository.save(servico);
        return new ServicoDTO(servico);
    }

    @Transactional
    public ServicoDTO atualizar(UUID id, ServicoDTO dto) {
        Servico servico = servicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado: " + id));
        copyDtoToEntity(dto, servico);
        servico = servicoRepository.save(servico);
        return new ServicoDTO(servico);
    }

    @Transactional
    public void deletar(UUID id) {
        if (!servicoRepository.existsById(id)) {
            throw new EntityNotFoundException("Serviço não encontrado: " + id);
        }
        servicoRepository.deleteById(id);
    }

    private void copyDtoToEntity(ServicoDTO dto, Servico entidade) {
        entidade.setNome(dto.nome());
        entidade.setDescricao(dto.descricao());
        entidade.setCodigoInterno(dto.codigoInterno());
        entidade.setPreco(dto.preco());
        entidade.setStatus(dto.status());
        entidade.setCodigoServicoLc116(dto.codigoServicoLc116());
        entidade.setAliquotaIss(dto.aliquotaIss());

        // --- Campos Reforma Tributária ---
        entidade.setCnaeCodigo(dto.cnaeCodigo());
        entidade.setNbsCodigo(dto.nbsCodigo());
        entidade.setDescricaoNota(dto.descricaoNota());
        entidade.setAliquotaIbsPadrao(dto.aliquotaIbsPadrao());
        entidade.setAliquotaCbsPadrao(dto.aliquotaCbsPadrao());
    }
}
