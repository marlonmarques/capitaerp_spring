package com.erp.capitalerp.domain.fiscal;

public enum TipoNotaEnum {
    ENTRADA("Entrada"), SAIDA("Saída");

    private final String descricao;

    TipoNotaEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
