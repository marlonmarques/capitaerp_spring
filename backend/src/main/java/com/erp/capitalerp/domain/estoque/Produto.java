package com.erp.capitalerp.domain.estoque;

import com.erp.capitalerp.domain.cadastros.Categoria;
import com.erp.capitalerp.domain.cadastros.Fornecedor;
import com.erp.capitalerp.domain.fiscal.GrupoTributario;
import com.erp.capitalerp.domain.shared.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.hibernate.annotations.BatchSize;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidade Produto — núcleo do módulo de estoque.
 *
 * Conceitos: - Produto sem variações: estoqueAtual/Minimo gerenciado no próprio
 * produto. - Produto com variações: estoqueAtual do produto é somente leitura
 * (soma das variações). Cada ProdutoVariacao possui seu próprio estoque. -
 * Tributação centralizada via GrupoTributario (null = campos legado ainda
 * válidos). - Soft-delete: deletadoEm != null significa excluído logicamente.
 */
@Entity
@Table(name = "produtos")
public class Produto extends BaseEntity {

    // ─── Identificação ────────────────────────────────────────────────────────

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @Column(length = 2000)
    private String descricao;

    /** Código de barras do produto principal (GTIN/EAN). */
    @Column(unique = true, length = 50)
    private String codigoBarras;

    /** Código NCM — 8 dígitos para NF-e. */
    @Column(length = 8)
    private String codigoNcm;

    /** CEST — quando aplicável (ST). */
    @Column(length = 7)
    private String codigoCest;

    /** Unidade de medida: UN, KG, LT, MT, CX, PC, M2, etc. */
    @Column(length = 20, nullable = false)
    private String unidadeMedida = "UN";

    /** Origem: NACIONAL, IMPORTADO, NACIONAL_IMPORTADO_PROPORCIONAL, etc. */
    @Column(length = 30, nullable = false)
    private String origem = "NACIONAL";

    // ─── Precificação ─────────────────────────────────────────────────────────

    @NotNull
    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoVenda;

    @Column(precision = 10, scale = 2)
    private BigDecimal precoCusto;

    @Column(precision = 5, scale = 2)
    private BigDecimal margemLucro;

    // ─── Estoque ──────────────────────────────────────────────────────────────

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Integer estoqueMinimo = 0;

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Integer estoqueAtual = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProdutoStatus status = ProdutoStatus.ATIVO;

    // ─── Dimensões / Logística ────────────────────────────────────────────────

    @Column(precision = 10, scale = 4)
    private BigDecimal pesoBruto;

    @Column(precision = 10, scale = 4)
    private BigDecimal pesoLiquido;

    @Column(name = "largura_cm", precision = 8, scale = 2)
    private BigDecimal larguraCm;

    @Column(name = "altura_cm", precision = 8, scale = 2)
    private BigDecimal alturaCm;

    @Column(name = "profundidade_cm", precision = 8, scale = 2)
    private BigDecimal profundidadeCm;

    // ─── Imagens ──────────────────────────────────────────────────────────────

    @Column(length = 500)
    private String imagemUrl;

    /** JSON array de URLs adicionais: ["url1","url2",...] */
    @Column(columnDefinition = "TEXT")
    private String imagensUrls;

    // ─── Tributação (Legado — campos diretos) ─────────────────────────────────

    @Column(precision = 5, scale = 2)
    private BigDecimal aliquotaIcms;

    @Column(precision = 5, scale = 2)
    private BigDecimal aliquotaPis;

    @Column(precision = 5, scale = 2)
    private BigDecimal aliquotaCofins;

    private String cstIcms;
    private String cstPis;
    private String cstCofins;
    private String cfop;

    // ─── Relacionamentos ──────────────────────────────────────────────────────

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id")
    private Fornecedor fornecedorPrincipal;

    /**
     * Grupo tributário centralizado. Se preenchido, sobrepõe os campos de
     * tributação legado.
     */
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_tributario_id")
    private GrupoTributario grupoTributario;

    /** Indica se o produto possui variações (cor, tamanho, etc.). */
    @Column(nullable = false)
    private Boolean temVariacoes = false;

    /**
     * Marca o produto como favorito — usado no PDV para acesso rápido. Aparece em
     * destaque na tela de vendas.
     */
    @Column(nullable = false)
    private Boolean favorito = false;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @BatchSize(size = 30)
    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProdutoVariacao> variacoes = new ArrayList<>();

    // ─── Soft-delete ─────────────────────────────────────────────────────────

    @Column(name = "deletado_em")
    private LocalDateTime deletadoEm;

    // ─── Construtor ───────────────────────────────────────────────────────────

    public Produto() {
    }

    // ─── Comportamentos de domínio ────────────────────────────────────────────

    public boolean isAtivo() {
        return status == ProdutoStatus.ATIVO && deletadoEm == null;
    }

    public boolean isAbaixoEstoqueMinimo() {
        return estoqueAtual < estoqueMinimo;
    }

    public void recalcularEstoqueDasVariacoes() {
        if (Boolean.TRUE.equals(this.temVariacoes)) {
            int novoAtual = 0;
            int novoMinimo = 0;
            if (variacoes != null) {
                for (ProdutoVariacao v : variacoes) {
                    novoAtual += (v.getEstoqueAtual() != null) ? v.getEstoqueAtual() : 0;
                    novoMinimo += (v.getEstoqueMinimo() != null) ? v.getEstoqueMinimo() : 0;
                }
            }
            this.estoqueAtual = novoAtual;
            this.estoqueMinimo = novoMinimo;
        }
    }

    public void darBaixa(int quantidade) {
        if (Boolean.TRUE.equals(this.temVariacoes)) {
            throw new IllegalStateException("Produto possui variações. A baixa de estoque deve ser feita na variação específica.");
        }
        if (quantidade > estoqueAtual) {
            throw new EstoqueInsuficienteException("Estoque insuficiente para %s. Disponível: %d, Solicitado: %d"
                    .formatted(nome, estoqueAtual, quantidade));
        }
        this.estoqueAtual -= quantidade;
    }

    public void darEntrada(int quantidade) {
        if (Boolean.TRUE.equals(this.temVariacoes)) {
            throw new IllegalStateException("Produto possui variações. A entrada de estoque deve ser feita na variação específica.");
        }
        if (quantidade <= 0)
            throw new IllegalArgumentException("Quantidade deve ser positiva");
        this.estoqueAtual += quantidade;
    }

    public void excluirLogicamente() {
        this.deletadoEm = LocalDateTime.now();
        this.status = ProdutoStatus.INATIVO;
    }

    // ─── Getters & Setters ────────────────────────────────────────────────────

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCodigoBarras() {
        return codigoBarras;
    }

    public void setCodigoBarras(String codigoBarras) {
        this.codigoBarras = codigoBarras;
    }

    public String getCodigoNcm() {
        return codigoNcm;
    }

    public void setCodigoNcm(String codigoNcm) {
        this.codigoNcm = codigoNcm;
    }

    public String getCodigoCest() {
        return codigoCest;
    }

    public void setCodigoCest(String codigoCest) {
        this.codigoCest = codigoCest;
    }

    public String getUnidadeMedida() {
        return unidadeMedida;
    }

    public void setUnidadeMedida(String unidadeMedida) {
        this.unidadeMedida = unidadeMedida;
    }

    public String getOrigem() {
        return origem;
    }

    public void setOrigem(String origem) {
        this.origem = origem;
    }

    public BigDecimal getPrecoVenda() {
        return precoVenda;
    }

    public void setPrecoVenda(BigDecimal precoVenda) {
        this.precoVenda = precoVenda;
    }

    public BigDecimal getPrecoCusto() {
        return precoCusto;
    }

    public void setPrecoCusto(BigDecimal precoCusto) {
        this.precoCusto = precoCusto;
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

    public ProdutoStatus getStatus() {
        return status;
    }

    public void setStatus(ProdutoStatus status) {
        this.status = status;
    }

    public BigDecimal getPesoBruto() {
        return pesoBruto;
    }

    public void setPesoBruto(BigDecimal pesoBruto) {
        this.pesoBruto = pesoBruto;
    }

    public BigDecimal getPesoLiquido() {
        return pesoLiquido;
    }

    public void setPesoLiquido(BigDecimal pesoLiquido) {
        this.pesoLiquido = pesoLiquido;
    }

    public BigDecimal getLarguraCm() {
        return larguraCm;
    }

    public void setLarguraCm(BigDecimal larguraCm) {
        this.larguraCm = larguraCm;
    }

    public BigDecimal getAlturaCm() {
        return alturaCm;
    }

    public void setAlturaCm(BigDecimal alturaCm) {
        this.alturaCm = alturaCm;
    }

    public BigDecimal getProfundidadeCm() {
        return profundidadeCm;
    }

    public void setProfundidadeCm(BigDecimal profundidadeCm) {
        this.profundidadeCm = profundidadeCm;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public String getImagensUrls() {
        return imagensUrls;
    }

    public void setImagensUrls(String imagensUrls) {
        this.imagensUrls = imagensUrls;
    }

    public BigDecimal getAliquotaIcms() {
        return aliquotaIcms;
    }

    public void setAliquotaIcms(BigDecimal aliquotaIcms) {
        this.aliquotaIcms = aliquotaIcms;
    }

    public BigDecimal getAliquotaPis() {
        return aliquotaPis;
    }

    public void setAliquotaPis(BigDecimal aliquotaPis) {
        this.aliquotaPis = aliquotaPis;
    }

    public BigDecimal getAliquotaCofins() {
        return aliquotaCofins;
    }

    public void setAliquotaCofins(BigDecimal aliquotaCofins) {
        this.aliquotaCofins = aliquotaCofins;
    }

    public String getCstIcms() {
        return cstIcms;
    }

    public void setCstIcms(String cstIcms) {
        this.cstIcms = cstIcms;
    }

    public String getCstPis() {
        return cstPis;
    }

    public void setCstPis(String cstPis) {
        this.cstPis = cstPis;
    }

    public String getCstCofins() {
        return cstCofins;
    }

    public void setCstCofins(String cstCofins) {
        this.cstCofins = cstCofins;
    }

    public String getCfop() {
        return cfop;
    }

    public void setCfop(String cfop) {
        this.cfop = cfop;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Fornecedor getFornecedorPrincipal() {
        return fornecedorPrincipal;
    }

    public void setFornecedorPrincipal(Fornecedor fornecedorPrincipal) {
        this.fornecedorPrincipal = fornecedorPrincipal;
    }

    public GrupoTributario getGrupoTributario() {
        return grupoTributario;
    }

    public void setGrupoTributario(GrupoTributario grupoTributario) {
        this.grupoTributario = grupoTributario;
    }

    public Boolean getTemVariacoes() {
        return temVariacoes;
    }

    public void setTemVariacoes(Boolean temVariacoes) {
        this.temVariacoes = temVariacoes;
    }

    public Boolean getFavorito() {
        return favorito;
    }

    public void setFavorito(Boolean favorito) {
        this.favorito = favorito != null ? favorito : false;
    }

    public List<ProdutoVariacao> getVariacoes() {
        return variacoes;
    }

    public void setVariacoes(List<ProdutoVariacao> variacoes) {
        this.variacoes = variacoes;
    }

    public LocalDateTime getDeletadoEm() {
        return deletadoEm;
    }

    public void setDeletadoEm(LocalDateTime deletadoEm) {
        this.deletadoEm = deletadoEm;
    }
}
