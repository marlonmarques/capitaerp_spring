package com.erp.capitalerp.domain.nfe;

import com.erp.capitalerp.domain.estoque.Produto;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "tb_nfe_item")
public class NotaFiscalProdutoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @com.fasterxml.jackson.annotation.JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nota_id", nullable = false)
    private NotaFiscalProduto nota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Produto produto;

    @Column(name = "variacao_id")
    private UUID variacaoId;

    @Column(nullable = false, length = 60)
    private String codigoProduto;

    @Column(nullable = false, length = 120)
    private String descricao;

    @Column(nullable = false, length = 8)
    private String ncm;

    @Column(nullable = false, length = 4)
    private String cfop;

    @Column(nullable = false, length = 6)
    private String unidadeComercial = "UN";

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal quantidadeComercial;

    @Column(nullable = false, precision = 15, scale = 10)
    private BigDecimal valorUnitarioComercial;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valorBruto;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorFrete = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorSeguro = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorOutrasDespesas = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorLiquido;

    // Tributação ICMS
    private Integer origem = 0;
    @Column(length = 3)
    private String icmsCst;
    @Column(precision = 15, scale = 2)
    private BigDecimal icmsBaseCalculo = BigDecimal.ZERO;
    @Column(precision = 5, scale = 2)
    private BigDecimal icmsAliquota = BigDecimal.ZERO;
    @Column(precision = 15, scale = 2)
    private BigDecimal icmsValor = BigDecimal.ZERO;

    // PIS
    @Column(length = 2)
    private String pisCst = "01";
    @Column(precision = 15, scale = 2)
    private BigDecimal pisBaseCalculo = BigDecimal.ZERO;
    @Column(precision = 5, scale = 2)
    private BigDecimal pisAliquota = BigDecimal.ZERO;
    @Column(precision = 15, scale = 2)
    private BigDecimal pisValor = BigDecimal.ZERO;

    // COFINS
    @Column(length = 2)
    private String cofinsCst = "01";
    @Column(precision = 15, scale = 2)
    private BigDecimal cofinsBaseCalculo = BigDecimal.ZERO;
    @Column(precision = 5, scale = 2)
    private BigDecimal cofinsAliquota = BigDecimal.ZERO;
    @Column(precision = 15, scale = 2)
    private BigDecimal cofinsValor = BigDecimal.ZERO;

    // IPI
    @Column(length = 2)
    private String ipiCst = "99";
    @Column(length = 3)
    private String ipiEnquadramento = "999";
    @Column(precision = 15, scale = 2)
    private BigDecimal ipiBaseCalculo = BigDecimal.ZERO;
    @Column(precision = 5, scale = 2)
    private BigDecimal ipiAliquota = BigDecimal.ZERO;
    @Column(precision = 15, scale = 2)
    private BigDecimal ipiValor = BigDecimal.ZERO;

    public NotaFiscalProdutoItem() {
    }

    // Getters & Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public NotaFiscalProduto getNota() {
        return nota;
    }

    public void setNota(NotaFiscalProduto nota) {
        this.nota = nota;
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public UUID getVariacaoId() {
        return variacaoId;
    }

    public void setVariacaoId(UUID variacaoId) {
        this.variacaoId = variacaoId;
    }

    public String getCodigoProduto() {
        return codigoProduto;
    }

    public void setCodigoProduto(String codigoProduto) {
        this.codigoProduto = codigoProduto;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getNcm() {
        return ncm;
    }

    public void setNcm(String ncm) {
        this.ncm = ncm;
    }

    public String getCfop() {
        return cfop;
    }

    public void setCfop(String cfop) {
        this.cfop = cfop;
    }

    public String getUnidadeComercial() {
        return unidadeComercial;
    }

    public void setUnidadeComercial(String unidadeComercial) {
        this.unidadeComercial = unidadeComercial;
    }

    public BigDecimal getQuantidadeComercial() {
        return quantidadeComercial;
    }

    public void setQuantidadeComercial(BigDecimal quantidadeComercial) {
        this.quantidadeComercial = quantidadeComercial;
    }

    public BigDecimal getValorUnitarioComercial() {
        return valorUnitarioComercial;
    }

    public void setValorUnitarioComercial(BigDecimal valorUnitarioComercial) {
        this.valorUnitarioComercial = valorUnitarioComercial;
    }

    public BigDecimal getValorBruto() {
        return valorBruto;
    }

    public void setValorBruto(BigDecimal valorBruto) {
        this.valorBruto = valorBruto;
    }

    public BigDecimal getValorDesconto() {
        return valorDesconto;
    }

    public void setValorDesconto(BigDecimal valorDesconto) {
        this.valorDesconto = valorDesconto;
    }

    public BigDecimal getValorFrete() {
        return valorFrete;
    }

    public void setValorFrete(BigDecimal valorFrete) {
        this.valorFrete = valorFrete;
    }

    public BigDecimal getValorSeguro() {
        return valorSeguro;
    }

    public void setValorSeguro(BigDecimal valorSeguro) {
        this.valorSeguro = valorSeguro;
    }

    public BigDecimal getValorOutrasDespesas() {
        return valorOutrasDespesas;
    }

    public void setValorOutrasDespesas(BigDecimal valorOutrasDespesas) {
        this.valorOutrasDespesas = valorOutrasDespesas;
    }

    public BigDecimal getValorLiquido() {
        return valorLiquido;
    }

    public void setValorLiquido(BigDecimal valorLiquido) {
        this.valorLiquido = valorLiquido;
    }

    public Integer getOrigem() {
        return origem;
    }

    public void setOrigem(Integer origem) {
        this.origem = origem;
    }

    public String getIcmsCst() {
        return icmsCst;
    }

    public void setIcmsCst(String icmsCst) {
        this.icmsCst = icmsCst;
    }

    public BigDecimal getIcmsBaseCalculo() {
        return icmsBaseCalculo;
    }

    public void setIcmsBaseCalculo(BigDecimal icmsBaseCalculo) {
        this.icmsBaseCalculo = icmsBaseCalculo;
    }

    public BigDecimal getIcmsAliquota() {
        return icmsAliquota;
    }

    public void setIcmsAliquota(BigDecimal icmsAliquota) {
        this.icmsAliquota = icmsAliquota;
    }

    public BigDecimal getIcmsValor() {
        return icmsValor;
    }

    public void setIcmsValor(BigDecimal icmsValor) {
        this.icmsValor = icmsValor;
    }

    public String getPisCst() {
        return pisCst;
    }

    public void setPisCst(String pisCst) {
        this.pisCst = pisCst;
    }

    public BigDecimal getPisBaseCalculo() {
        return pisBaseCalculo;
    }

    public void setPisBaseCalculo(BigDecimal pisBaseCalculo) {
        this.pisBaseCalculo = pisBaseCalculo;
    }

    public BigDecimal getPisAliquota() {
        return pisAliquota;
    }

    public void setPisAliquota(BigDecimal pisAliquota) {
        this.pisAliquota = pisAliquota;
    }

    public BigDecimal getPisValor() {
        return pisValor;
    }

    public void setPisValor(BigDecimal pisValor) {
        this.pisValor = pisValor;
    }

    public String getCofinsCst() {
        return cofinsCst;
    }

    public void setCofinsCst(String cofinsCst) {
        this.cofinsCst = cofinsCst;
    }

    public BigDecimal getCofinsBaseCalculo() {
        return cofinsBaseCalculo;
    }

    public void setCofinsBaseCalculo(BigDecimal cofinsBaseCalculo) {
        this.cofinsBaseCalculo = cofinsBaseCalculo;
    }

    public BigDecimal getCofinsAliquota() {
        return cofinsAliquota;
    }

    public void setCofinsAliquota(BigDecimal cofinsAliquota) {
        this.cofinsAliquota = cofinsAliquota;
    }

    public BigDecimal getCofinsValor() {
        return cofinsValor;
    }

    public void setCofinsValor(BigDecimal cofinsValor) {
        this.cofinsValor = cofinsValor;
    }

    public String getIpiCst() {
        return ipiCst;
    }

    public void setIpiCst(String ipiCst) {
        this.ipiCst = ipiCst;
    }

    public String getIpiEnquadramento() {
        return ipiEnquadramento;
    }

    public void setIpiEnquadramento(String ipiEnquadramento) {
        this.ipiEnquadramento = ipiEnquadramento;
    }

    public BigDecimal getIpiBaseCalculo() {
        return ipiBaseCalculo;
    }

    public void setIpiBaseCalculo(BigDecimal ipiBaseCalculo) {
        this.ipiBaseCalculo = ipiBaseCalculo;
    }

    public BigDecimal getIpiAliquota() {
        return ipiAliquota;
    }

    public void setIpiAliquota(BigDecimal ipiAliquota) {
        this.ipiAliquota = ipiAliquota;
    }

    public BigDecimal getIpiValor() {
        return ipiValor;
    }

    public void setIpiValor(BigDecimal ipiValor) {
        this.ipiValor = ipiValor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof NotaFiscalProdutoItem))
            return false;
        NotaFiscalProdutoItem that = (NotaFiscalProdutoItem) o;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        // Retorna um valor fixo para a classe, padrão seguro para entidades JPA com ID
        // gerado no banco
        return getClass().hashCode();
    }
}
