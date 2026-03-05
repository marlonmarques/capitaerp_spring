package com.erp.capitalerp.domain.estoque;

import com.erp.capitalerp.domain.shared.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "estoque_saldos", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "produto_id", "variacao_id", "local_estoque_id" }) })
public class EstoqueSaldo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variacao_id")
    private ProdutoVariacao variacao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "local_estoque_id", nullable = false)
    private LocalEstoque localEstoque;

    @NotNull
    @Column(nullable = false)
    private Integer quantidade = 0;

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Integer estoqueMinimo = 0;

    public EstoqueSaldo() {
    }

    public void adicionar(int qtd) {
        if (qtd <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero para entrada");
        }
        this.quantidade += qtd;
    }

    public void abater(int qtd) {
        if (qtd <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que zero para baixa/saída");
        }
        if (this.quantidade < qtd) {
            throw new EstoqueInsuficienteException("Estoque insuficiente no local " + localEstoque.getNome()
                    + ". Disponível: " + this.quantidade + ", Solicitado: " + qtd);
        }
        this.quantidade -= qtd;
    }

    public boolean isAbaixoMinimo() {
        return this.quantidade < this.estoqueMinimo;
    }

    // Getters and Setters

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public ProdutoVariacao getVariacao() {
        return variacao;
    }

    public void setVariacao(ProdutoVariacao variacao) {
        this.variacao = variacao;
    }

    public LocalEstoque getLocalEstoque() {
        return localEstoque;
    }

    public void setLocalEstoque(LocalEstoque localEstoque) {
        this.localEstoque = localEstoque;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public Integer getEstoqueMinimo() {
        return estoqueMinimo;
    }

    public void setEstoqueMinimo(Integer estoqueMinimo) {
        this.estoqueMinimo = estoqueMinimo;
    }
}
