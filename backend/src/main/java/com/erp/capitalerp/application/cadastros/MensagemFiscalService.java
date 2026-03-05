package com.erp.capitalerp.application.cadastros;

import com.erp.capitalerp.application.cadastros.dto.MensagemFiscalDTO;
import com.erp.capitalerp.domain.fiscal.MensagemFiscal;
import com.erp.capitalerp.infrastructure.persistence.cadastros.MensagemFiscalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
public class MensagemFiscalService {

    private final MensagemFiscalRepository repository;

    public MensagemFiscalService(MensagemFiscalRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<MensagemFiscalDTO> listarTodas() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MensagemFiscalDTO buscarPorId(UUID id) {
        MensagemFiscal entidade = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mensagem Fiscal não encontrada com ID: " + id));
        return toDto(entidade);
    }

    @Transactional
    public MensagemFiscalDTO criar(MensagemFiscalDTO dto) {
        MensagemFiscal entidade = new MensagemFiscal();
        copyDtoToEntity(dto, entidade);
        entidade = repository.save(entidade);
        return toDto(entidade);
    }

    @Transactional
    public MensagemFiscalDTO atualizar(UUID id, MensagemFiscalDTO dto) {
        MensagemFiscal entidade = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mensagem Fiscal não encontrada com ID: " + id));
        copyDtoToEntity(dto, entidade);
        entidade = repository.save(entidade);
        return toDto(entidade);
    }

    @Transactional
    public void deletar(UUID id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Mensagem Fiscal não encontrada com ID: " + id);
        }
        repository.deleteById(id);
    }

    private MensagemFiscalDTO toDto(MensagemFiscal entidade) {
        MensagemFiscalDTO dto = new MensagemFiscalDTO();
        dto.setId(entidade.getId());
        dto.setTitulo(entidade.getTitulo());
        dto.setDestino(entidade.getDestino());
        dto.setTextoTemplate(entidade.getTextoTemplate());
        return dto;
    }

    private void copyDtoToEntity(MensagemFiscalDTO dto, MensagemFiscal entidade) {
        entidade.setTitulo(dto.getTitulo());
        entidade.setDestino(dto.getDestino());
        entidade.setTextoTemplate(dto.getTextoTemplate());
    }
}
