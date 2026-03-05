package com.erp.capitalerp.domain.estoque;

import jakarta.persistence.*;

/**
 * Atributo de variação de produto.
 *
 * Exemplos de uso: tipo = "COR", valor = "Azul Marinho" tipo = "TAMANHO", valor
 * = "P" tipo = "VOLTAGEM", valor = "110V" tipo = "MATERIAL", valor = "Couro"
 * tipo = "VOLUME", valor = "50ml" tipo = "SABOR", valor = "Chocolate"
 */
@Entity
@Table(name = "produto_variacao_atributos")
public class ProdutoVariacaoAtributo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variacao_id", nullable = false)
    private ProdutoVariacao variacao;

    /**
     * Tipo do atributo — normalizado em maiúsculas. Ex: COR, TAMANHO, VOLTAGEM,
     * MATERIAL, VOLUME, SABOR, AROMA, etc.
     */
    @Column(nullable = false, length = 60)
    private String tipo;

    /**
     * Valor do atributo. Ex: Azul Marinho, GG, 220V, Couro, 500ml.
     */
    @Column(nullable = false, length = 120)
    private String valor;

    public ProdutoVariacaoAtributo() {
    }

    public ProdutoVariacaoAtributo(ProdutoVariacao variacao, String tipo, String valor) {
        this.variacao = variacao;
        this.tipo = tipo.toUpperCase();
        this.valor = valor;
    }

    // ─── Getters & Setters ────────────────────────────────────────────────────

    public java.util.UUID getId() {
        return id;
    }

    public void setId(java.util.UUID id) {
        this.id = id;
    }

    public ProdutoVariacao getVariacao() {
        return variacao;
    }

    public void setVariacao(ProdutoVariacao variacao) {
        this.variacao = variacao;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo != null ? tipo.toUpperCase() : null;
    }

    public String getValor() {
        return valor;
    }

    public void setValor(String valor) {
        this.valor = valor;
    }
}
