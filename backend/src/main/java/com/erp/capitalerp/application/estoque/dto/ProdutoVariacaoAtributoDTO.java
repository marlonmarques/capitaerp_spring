package com.erp.capitalerp.application.estoque.dto;

import com.erp.capitalerp.domain.estoque.ProdutoVariacaoAtributo;
import java.util.UUID;

/**
 * DTO para atributos de variação (COR=Azul, TAMANHO=P, etc.)
 */
public record ProdutoVariacaoAtributoDTO(UUID id, String tipo, String valor) {
    public ProdutoVariacaoAtributoDTO(ProdutoVariacaoAtributo entity) {
        this(entity.getId(), entity.getTipo(), entity.getValor());
    }
}
