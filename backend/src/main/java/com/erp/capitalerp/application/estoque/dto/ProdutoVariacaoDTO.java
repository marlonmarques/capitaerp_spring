package com.erp.capitalerp.application.estoque.dto;

import com.erp.capitalerp.domain.estoque.ProdutoVariacao;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * DTO completo de ProdutoVariacao incluindo atributos.
 */
public record ProdutoVariacaoDTO(UUID id, UUID produtoId, String nomeVariacao, String sku, String codigoBarras,
        BigDecimal precoCusto, BigDecimal precoVenda, BigDecimal margemLucro, BigDecimal precoVendaEfetivo,
        Integer estoqueMinimo, Integer estoqueAtual, Boolean ativo, String imagemUrl,
        List<ProdutoVariacaoAtributoDTO> atributos) {
    public ProdutoVariacaoDTO(ProdutoVariacao entity) {
        this(entity.getId(), entity.getProduto() != null ? entity.getProduto().getId() : null, entity.getNomeVariacao(),
                entity.getSku(), entity.getCodigoBarras(), entity.getPrecoCusto(), entity.getPrecoVenda(),
                entity.getMargemLucro(), entity.getPrecoVendaEfetivo(), entity.getEstoqueMinimo(),
                entity.getEstoqueAtual(), entity.getAtivo(), entity.getImagemUrl(),
                entity.getAtributos() != null ? entity.getAtributos().stream().map(ProdutoVariacaoAtributoDTO::new)
                        .collect(Collectors.toList()) : List.of());
    }
}
