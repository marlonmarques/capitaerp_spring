package com.erp.capitalerp.application.estoque.dto;

import com.erp.capitalerp.domain.estoque.EstoqueSaldo;

import java.util.UUID;

public record EstoqueSaldoDTO(UUID id, UUID produtoId, String produtoNome, String produtoCodigo, UUID variacaoId,
        String variacaoNome, UUID localEstoqueId, String localEstoqueNome, Integer quantidade, Integer estoqueMinimo,
        boolean abaixoMinimo) {

    public EstoqueSaldoDTO(EstoqueSaldo e) {
        this(e.getId(), e.getProduto() != null ? e.getProduto().getId() : null,
                e.getProduto() != null ? e.getProduto().getNome() : null,
                e.getProduto() != null ? e.getProduto().getCodigoBarras() : null,
                e.getVariacao() != null ? e.getVariacao().getId() : null,
                e.getVariacao() != null ? e.getVariacao().getNomeVariacao() : null,
                e.getLocalEstoque() != null ? e.getLocalEstoque().getId() : null,
                e.getLocalEstoque() != null ? e.getLocalEstoque().getNome() : null, e.getQuantidade(),
                e.getEstoqueMinimo(), e.isAbaixoMinimo());
    }
}
