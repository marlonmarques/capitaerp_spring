package com.erp.capitalerp.domain.financeiro;

public enum BancoEnum {
    CAIXA_INTERNO("Caixa Interno (Dinheiro)"), BANCO_DO_BRASIL("Banco do Brasil"),
    CAIXA_ECONOMICA("Caixa Econômica Federal"), ITAU("Itaú"), BRADESCO("Bradesco"), SANTANDER("Santander"),
    INTER("Banco Inter"), NUBANK("Nubank"), ASAAS("Asaas (Gateway)"), PAGHIPER("PagHiper (Gateway)"),
    OUTROS("Outro Banco/Gateway");

    private final String descricao;

    BancoEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
