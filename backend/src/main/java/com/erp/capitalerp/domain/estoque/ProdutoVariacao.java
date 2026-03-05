package com.erp.capitalerp.domain.estoque;

import com.erp.capitalerp.domain.shared.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.BatchSize;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * ProdutoVariacao — representa uma combinação única de atributos de um produto.
 *
 * Exemplos: Camiseta P / Azul Marinho / Algodão Carregador 110V / Preto Perfume
 * 50ml / Masculino
 *
 * Os atributos são armazenados em ProdutoVariacaoAtributo (tabela separada),
 * permitindo tipos flexíveis (COR, TAMANHO, VOLTAGEM, MATERIAL, VOLUME, etc.)
 */
@Entity
@Table(name = "produto_variacoes")
public class ProdutoVariacao extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    /**
     * Nome gerado automaticamente pela concatenação dos atributos. Ex: "P / Azul
     * Marinho".
     */
    @Column(length = 255)
    private String nomeVariacao;

    /** SKU único da variação. */
    @Column(unique = true, length = 100)
    private String sku;

    @Column(unique = true, length = 50)
    private String codigoBarras;

    /** Se null, herda o precoCusto do produto pai. */
    @Column(precision = 10, scale = 2)
    private BigDecimal precoCusto;

    /** Se null, herda o precoVenda do produto pai. */
    @Column(precision = 10, scale = 2)
    private BigDecimal precoVenda;

    @Column(precision = 5, scale = 2)
    private BigDecimal margemLucro;

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Integer estoqueMinimo = 0;

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Integer estoqueAtual = 0;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(length = 500)
    private String imagemUrl;

    /**
     * Atributos desta variação (COR=Azul, TAMANHO=P, VOLTAGEM=110V, etc.)
     */
    @BatchSize(size = 30)
    @OneToMany(mappedBy = "variacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProdutoVariacaoAtributo> atributos = new ArrayList<>();

    public ProdutoVariacao() {
    }

    // ─── Comportamentos de domínio ────────────────────────────────────────────

    public boolean isAbaixoEstoqueMinimo() {
        return estoqueAtual < estoqueMinimo;
    }

    /** Retorna o preço de venda efetivo (próprio ou herdado do produto). */
    public BigDecimal getPrecoVendaEfetivo() {
        if (precoVenda != null)
            return precoVenda;
        return produto != null ? produto.getPrecoVenda() : BigDecimal.ZERO;
    }

    public void darBaixa(int quantidade) {
        if (quantidade > estoqueAtual) {
            throw new EstoqueInsuficienteException(
                    "Estoque insuficiente para a variação '%s' do produto '%s'. Disponível: %d, Solicitado: %d"
                            .formatted(nomeVariacao, produto.getNome(), estoqueAtual, quantidade));
        }
        this.estoqueAtual -= quantidade;
        if (produto != null && Boolean.TRUE.equals(produto.getTemVariacoes())) {
            produto.setEstoqueAtual(produto.getEstoqueAtual() - quantidade);
        }
    }

    public void darEntrada(int quantidade) {
        if (quantidade <= 0)
            throw new IllegalArgumentException("Quantidade deve ser positiva");
        this.estoqueAtual += quantidade;
        if (produto != null && Boolean.TRUE.equals(produto.getTemVariacoes())) {
            produto.setEstoqueAtual(produto.getEstoqueAtual() + quantidade);
        }
    }

    /** Gera o nomeVariacao concatenando todos os valores dos atributos. */
    public void atualizarNomeVariacao() {
        if (atributos == null || atributos.isEmpty()) {
            this.nomeVariacao = "Padrão";
            return;
        }
        this.nomeVariacao = atributos.stream().map(ProdutoVariacaoAtributo::getValor).reduce((a, b) -> a + " / " + b)
                .orElse("Padrão");
    }

    // ─── Getters & Setters ────────────────────────────────────────────────────

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public String getNomeVariacao() {
        return nomeVariacao;
    }

    public void setNomeVariacao(String nomeVariacao) {
        this.nomeVariacao = nomeVariacao;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getCodigoBarras() {
        return codigoBarras;
    }

    public void setCodigoBarras(String codigoBarras) {
        this.codigoBarras = codigoBarras;
    }

    public BigDecimal getPrecoCusto() {
        return precoCusto;
    }

    public void setPrecoCusto(BigDecimal precoCusto) {
        this.precoCusto = precoCusto;
    }

    public BigDecimal getPrecoVenda() {
        return precoVenda;
    }

    public void setPrecoVenda(BigDecimal precoVenda) {
        this.precoVenda = precoVenda;
    }

    public BigDecimal getMargemLucro() {
        return margemLucro;
    }

    public void setMargemLucro(BigDecimal margemLucro) {
        this.margemLucro = margemLucro;
    }

    public Integer getEstoqueMinimo() {
        return estoqueMinimo;
    }

    public void setEstoqueMinimo(Integer estoqueMinimo) {
        this.estoqueMinimo = estoqueMinimo;
    }

    public Integer getEstoqueAtual() {
        return estoqueAtual;
    }

    public void setEstoqueAtual(Integer estoqueAtual) {
        this.estoqueAtual = estoqueAtual;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public List<ProdutoVariacaoAtributo> getAtributos() {
        return atributos;
    }

    public void setAtributos(List<ProdutoVariacaoAtributo> atributos) {
        this.atributos = atributos;
    }
}
