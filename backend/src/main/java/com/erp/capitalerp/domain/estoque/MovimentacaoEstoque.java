package com.erp.capitalerp.domain.estoque;

import com.erp.capitalerp.domain.shared.BaseEntity;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "movimentacoes_estoque")
public class MovimentacaoEstoque extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id")
    private Produto produto;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variacao_id")
    private ProdutoVariacao variacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "local_estoque_id", nullable = false)
    private LocalEstoque localEstoque;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "local_destino_id")
    private LocalEstoque localDestino;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimentacao tipo; // ENTRADA, SAIDA, AJUSTE, DEVOLUCAO

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false)
    private Integer saldoAnterior;

    @Column(nullable = false)
    private Integer saldoPosterior;

    private String motivo;

    // Rastreabilidade: pode ser ligada a uma venda, NF de compra, etc.
    private UUID referenciaId;
    private String referenciaTipo; // "VENDA", "COMPRA", "AJUSTE_MANUAL"

    public MovimentacaoEstoque() {
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public TipoMovimentacao getTipo() {
        return tipo;
    }

    public void setTipo(TipoMovimentacao tipo) {
        this.tipo = tipo;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public Integer getSaldoAnterior() {
        return saldoAnterior;
    }

    public void setSaldoAnterior(Integer saldoAnterior) {
        this.saldoAnterior = saldoAnterior;
    }

    public Integer getSaldoPosterior() {
        return saldoPosterior;
    }

    public void setSaldoPosterior(Integer saldoPosterior) {
        this.saldoPosterior = saldoPosterior;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public UUID getReferenciaId() {
        return referenciaId;
    }

    public void setReferenciaId(UUID referenciaId) {
        this.referenciaId = referenciaId;
    }

    public String getReferenciaTipo() {
        return referenciaTipo;
    }

    public void setReferenciaTipo(String referenciaTipo) {
        this.referenciaTipo = referenciaTipo;
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

    public LocalEstoque getLocalDestino() {
        return localDestino;
    }

    public void setLocalDestino(LocalEstoque localDestino) {
        this.localDestino = localDestino;
    }
}
