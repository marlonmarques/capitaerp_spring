package com.erp.capitalerp.application.estoque.dto;

import java.util.UUID;

public record ProdutoAbaixoMinimoResponse(UUID id, String nome, Integer estoqueAtual, Integer estoqueMinimo) {
}
