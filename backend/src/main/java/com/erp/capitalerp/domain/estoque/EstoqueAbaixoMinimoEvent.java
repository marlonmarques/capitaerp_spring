package com.erp.capitalerp.domain.estoque;

public class EstoqueAbaixoMinimoEvent {
    private final Produto produto;

    public EstoqueAbaixoMinimoEvent(Produto produto) {
        this.produto = produto;
    }

    public Produto getProduto() {
        return produto;
    }
}
