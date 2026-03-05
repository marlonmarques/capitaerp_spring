package com.erp.capitalerp.application.estoque.dto;

import com.erp.capitalerp.domain.estoque.MovimentacaoEstoque;
import com.erp.capitalerp.domain.estoque.TipoMovimentacao;

import java.time.LocalDateTime;
import java.util.UUID;

public record MovimentacaoEstoqueDTO(UUID id, UUID produtoId, String produtoNome, UUID variacaoId, String variacaoNome,
        UUID localEstoqueId, String localEstoqueNome, UUID localDestinoId, String localDestinoNome,
        TipoMovimentacao tipo, int quantidade, int saldoAnterior, int saldoPosterior, UUID referenciaId,
        String referenciaTipo, String motivo, LocalDateTime dataMovimentacao, String responsavel) {

    public MovimentacaoEstoqueDTO(MovimentacaoEstoque entity) {
        this(entity.getId(), entity.getProduto() != null ? entity.getProduto().getId() : null,
                entity.getProduto() != null ? entity.getProduto().getNome() : null,
                entity.getVariacao() != null ? entity.getVariacao().getId() : null,
                entity.getVariacao() != null ? entity.getVariacao().getNomeVariacao() : null,
                entity.getLocalEstoque() != null ? entity.getLocalEstoque().getId() : null,
                entity.getLocalEstoque() != null ? entity.getLocalEstoque().getNome() : null,
                entity.getLocalDestino() != null ? entity.getLocalDestino().getId() : null,
                entity.getLocalDestino() != null ? entity.getLocalDestino().getNome() : null, entity.getTipo(),
                entity.getQuantidade(), entity.getSaldoAnterior(), entity.getSaldoPosterior(), entity.getReferenciaId(),
                entity.getReferenciaTipo(), entity.getMotivo(), entity.getCriadoEm(), entity.getCriadoPor());
    }
}
