package com.erp.capitalerp.domain.fiscal;

public enum DestinoMensagemEnum {
    FISCO("Interesse do Fisco (infAdFisco)"), CONTRIBUINTE("Interesse do Contribuinte (infCpl)");

    private final String descricao;

    DestinoMensagemEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
