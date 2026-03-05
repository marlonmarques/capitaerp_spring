package com.erp.capitalerp.domain.fiscal;

public enum FinalidadeEnum {
    NORMAL("Normal"), COMPLEMENTAR("Complementar"), AJUSTE("Ajuste"),
    DEVOLUCAO_RETORNO("Devolução de Mercadoria / Retorno");

    private final String descricao;

    FinalidadeEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
