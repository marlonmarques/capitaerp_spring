package com.erp.capitalerp.domain.fiscal;

public enum RegimeTributarioEnum {

    SIMPLES_NACIONAL("Simples Nacional"), LUCRO_PRESUMIDO("Lucro Presumido"), LUCRO_REAL("Lucro Real"),
    MEI("Microempreendedor Individual"), ISENTO("Isento / Não Contribuinte");

    private final String descricao;

    RegimeTributarioEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
