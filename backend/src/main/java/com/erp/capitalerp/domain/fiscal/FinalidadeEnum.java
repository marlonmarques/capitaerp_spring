package com.erp.capitalerp.domain.fiscal;

public enum FinalidadeEnum {
    NORMAL("Normal", 1), 
    COMPLEMENTAR("Complementar", 2), 
    AJUSTE("Ajuste", 3),
    DEVOLUCAO_RETORNO("Devolução de Mercadoria / Retorno", 4);

    private final String descricao;
    private final int codigo;

    FinalidadeEnum(String descricao, int codigo) {
        this.descricao = descricao;
        this.codigo = codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public int getCodigo() {
        return codigo;
    }
}
