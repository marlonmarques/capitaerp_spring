package com.erp.capitalerp.application.estoque.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProdutoBuscaVendaDTO(
        UUID produtoId,
        UUID variacaoId,
        String codigo,
        String nome,
        BigDecimal precoVenda,
        Integer estoqueAtual,
        String unidadeMedida,
        String ncm,
        String cfop,
        String icmsCst,
        BigDecimal icmsAliq,
        String pisCst,
        BigDecimal pisAliq,
        String cofinsCst,
        BigDecimal cofinsAliq,
        Integer origem
) {}
