package com.erp.capitalerp.application.cadastros;

import com.erp.capitalerp.application.cadastros.dto.PosicaoFiscalDTO;
import com.erp.capitalerp.domain.fiscal.MensagemFiscal;
import com.erp.capitalerp.domain.fiscal.PosicaoFiscal;
import com.erp.capitalerp.infrastructure.persistence.cadastros.MensagemFiscalRepository;
import com.erp.capitalerp.infrastructure.persistence.cadastros.PosicaoFiscalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
public class PosicaoFiscalService {

    private final PosicaoFiscalRepository posicaoRepository;
    private final MensagemFiscalRepository mensagemRepository;

    public PosicaoFiscalService(PosicaoFiscalRepository posicaoRepository,
            MensagemFiscalRepository mensagemRepository) {
        this.posicaoRepository = posicaoRepository;
        this.mensagemRepository = mensagemRepository;
    }

    @Transactional(readOnly = true)
    public List<PosicaoFiscalDTO> listarTodas() {
        return posicaoRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PosicaoFiscalDTO buscarPorId(UUID id) {
        PosicaoFiscal entidade = posicaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Posição Fiscal não encontrada com ID: " + id));
        return toDto(entidade);
    }

    @Transactional
    public PosicaoFiscalDTO criar(PosicaoFiscalDTO dto) {
        PosicaoFiscal entidade = new PosicaoFiscal();
        copyDtoToEntity(dto, entidade);
        entidade = posicaoRepository.save(entidade);
        return toDto(entidade);
    }

    @Transactional
    public PosicaoFiscalDTO atualizar(UUID id, PosicaoFiscalDTO dto) {
        PosicaoFiscal entidade = posicaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Posição Fiscal não encontrada com ID: " + id));
        copyDtoToEntity(dto, entidade);
        entidade = posicaoRepository.save(entidade);
        return toDto(entidade);
    }

    @Transactional
    public void deletar(UUID id) {
        if (!posicaoRepository.existsById(id)) {
            throw new IllegalArgumentException("Posição Fiscal não encontrada com ID: " + id);
        }
        posicaoRepository.deleteById(id);
    }

    private PosicaoFiscalDTO toDto(PosicaoFiscal entidade) {
        PosicaoFiscalDTO dto = new PosicaoFiscalDTO();
        dto.setId(entidade.getId());
        dto.setNome(entidade.getNome());
        dto.setTipoNota(entidade.getTipoNota());
        dto.setFinalidade(entidade.getFinalidade());
        dto.setConsumidorFinal(entidade.getConsumidorFinal());
        dto.setTipoOperacao(entidade.getTipoOperacao());
        dto.setOperacaoDestino(entidade.getOperacaoDestino());
        dto.setCfopPadraoCodigo(entidade.getCfopPadraoCodigo());

        if (entidade.getMensagens() != null && !entidade.getMensagens().isEmpty()) {
            dto.setMensagensIds(
                    entidade.getMensagens().stream().map(MensagemFiscal::getId).collect(Collectors.toList()));
        }
        return dto;
    }

    private void copyDtoToEntity(PosicaoFiscalDTO dto, PosicaoFiscal entidade) {
        entidade.setNome(dto.getNome());
        entidade.setTipoNota(dto.getTipoNota());
        entidade.setFinalidade(dto.getFinalidade());
        entidade.setConsumidorFinal(dto.getConsumidorFinal());
        entidade.setTipoOperacao(dto.getTipoOperacao());
        entidade.setOperacaoDestino(dto.getOperacaoDestino());
        entidade.setCfopPadraoCodigo(dto.getCfopPadraoCodigo());

        // Atualizando o vínculo de mensagens
        if (dto.getMensagensIds() != null && !dto.getMensagensIds().isEmpty()) {
            List<MensagemFiscal> mensagensSelecionadas = mensagemRepository.findAllById(dto.getMensagensIds());
            entidade.setMensagens(mensagensSelecionadas);
        } else {
            entidade.getMensagens().clear();
        }
    }
}
