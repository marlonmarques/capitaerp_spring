package com.erp.capitalerp.application.cadastros.dto;

import com.erp.capitalerp.domain.cadastros.Plano;
import java.math.BigDecimal;
import java.util.UUID;

public record PlanoDTO(
    UUID id,
    String nome,
    String descricao,
    Boolean moduloNfse,
    Boolean moduloNfe,
    Boolean moduloNfce,
    Boolean moduloEstoque,
    Boolean moduloFinanceiro,
    Integer limiteUsuarios,
    Integer limiteFiliais,
    BigDecimal valorMensal,
    Boolean ativo
) {
    public PlanoDTO(Plano entity) {
        this(
            entity.getId(),
            entity.getNome(),
            entity.getDescricao(),
            entity.getModuloNfse(),
            entity.getModuloNfe(),
            entity.getModuloNfce(),
            entity.getModuloEstoque(),
            entity.getModuloFinanceiro(),
            entity.getLimiteUsuarios(),
            entity.getLimiteFiliais(),
            entity.getValorMensal(),
            entity.getAtivo()
        );
    }
}
