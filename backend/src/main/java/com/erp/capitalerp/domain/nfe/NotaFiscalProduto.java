package com.erp.capitalerp.domain.nfe;

import com.erp.capitalerp.domain.cadastros.Filial;
import com.erp.capitalerp.domain.clientes.Cliente;
import com.erp.capitalerp.domain.fiscal.FinalidadeEnum;
import com.erp.capitalerp.domain.shared.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "tb_nfe")
public class NotaFiscalProduto extends BaseEntity {

    @Column(name = "filial_id")
    private UUID filialId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ModeloNFe modelo = ModeloNFe.NFE;

    @Column(nullable = false)
    private Integer numero;

    @Column(nullable = false, length = 10)
    private String serie = "1";

    @Column(length = 8)
    private String codigoAleatorio;

    @Column(length = 60)
    private String naturezaOperacao = "VENDA DE MERCADORIA";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusNFe status = StatusNFe.RASCUNHO;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id")
    @JsonIgnoreProperties({ "enderecos", "emails" })
    private Cliente cliente;

    @Column(length = 44)
    private String chaveNfe;

    @Column(length = 100)
    private String protocoloNfe;

    @Column(length = 100)
    private String protocoloLote;

    @Column(columnDefinition = "TEXT")
    private String xmlProcessado;

    @Column(columnDefinition = "TEXT")
    private String mensagemRetorno;

    @Column(length = 10)
    private String codigoRetorno;

    @Column(nullable = false)
    private LocalDateTime dataEmissao;

    private LocalDateTime dataSaidaEntrada;
    private LocalDateTime dataAutorizacao;
    private LocalDateTime dataCancelamento;

    @Column(length = 10)
    private String tipoNota = "SAIDA";

    @Column(length = 20)
    private String ambiente = "HOMOLOGACAO";

    @Enumerated(EnumType.STRING)
    private FinalidadeEnum finalidade = FinalidadeEnum.NORMAL;

    private Integer indicadorPresenca = 9;
    private Integer indicadorFinal = 1;
    private Integer sequenciaEvento = 0;

    @Column(columnDefinition = "TEXT")
    private String informacoesFisco;

    @Column(columnDefinition = "TEXT")
    private String informacoesComplementares;

    // Totais
    @Column(precision = 15, scale = 2)
    private BigDecimal valorTotalNota = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorTotalProdutos = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorFrete = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorSeguro = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorOutros = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorBaseCalculoIcms = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorIcms = BigDecimal.ZERO;

    @Column(name = "posicao_fiscal_id")
    private UUID posicaoFiscalId;

    // Transporte
    @Column(length = 1)
    private String modFrete = "9"; // 9-Sem Frete

    @Column(length = 60)
    private String transportadoraNome;

    @Column(length = 18)
    private String transportadoraCnpjCpf;

    @Column(length = 8)
    private String placaVeiculo;

    @Column(length = 2)
    private String placaUf;

    private Integer quantidadeVolumes;

    @Column(length = 60)
    private String especieVolumes;

    @Column(precision = 12, scale = 3)
    private BigDecimal pesoBrutoTotal = BigDecimal.ZERO;

    @Column(precision = 12, scale = 3)
    private BigDecimal pesoLiquidoTotal = BigDecimal.ZERO;

    // Devolução e Ajustes
    @Column(length = 44)
    private String chaveReferenciada;

    // --- MUDANÇA AQUI: List virou Set ---
    @com.fasterxml.jackson.annotation.JsonManagedReference
    @OneToMany(mappedBy = "nota", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<NotaFiscalProdutoItem> itens = new HashSet<>();

    // --- MUDANÇA AQUI: List virou Set ---
    @com.fasterxml.jackson.annotation.JsonManagedReference
    @OneToMany(mappedBy = "nota", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<NotaFiscalProdutoPagamento> pagamentos = new HashSet<>();

    public NotaFiscalProduto() {
    }

    // Helpers
    public void addItem(NotaFiscalProdutoItem item) {
        itens.add(item);
        item.setNota(this);
    }

    public void addPagamento(NotaFiscalProdutoPagamento pagamento) {
        pagamentos.add(pagamento);
        pagamento.setNota(this);
    }

    // Getters & Setters
    public UUID getFilialId() {
        return filialId;
    }

    public void setFilialId(UUID filialId) {
        this.filialId = filialId;
    }

    public ModeloNFe getModelo() {
        return modelo;
    }

    public void setModelo(ModeloNFe modelo) {
        this.modelo = modelo;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public String getSerie() {
        return serie;
    }

    public void setSerie(String serie) {
        this.serie = serie;
    }

    public String getCodigoAleatorio() {
        return codigoAleatorio;
    }

    public void setCodigoAleatorio(String codigoAleatorio) {
        this.codigoAleatorio = codigoAleatorio;
    }

    public String getNaturezaOperacao() {
        return naturezaOperacao;
    }

    public void setNaturezaOperacao(String naturezaOperacao) {
        this.naturezaOperacao = naturezaOperacao;
    }

    public StatusNFe getStatus() {
        return status;
    }

    public void setStatus(StatusNFe status) {
        this.status = status;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public String getChaveNfe() {
        return chaveNfe;
    }

    public void setChaveNfe(String chaveNfe) {
        this.chaveNfe = chaveNfe;
    }

    public String getProtocoloNfe() {
        return protocoloNfe;
    }

    public void setProtocoloNfe(String protocoloNfe) {
        this.protocoloNfe = protocoloNfe;
    }

    public String getProtocoloLote() {
        return protocoloLote;
    }

    public void setProtocoloLote(String protocoloLote) {
        this.protocoloLote = protocoloLote;
    }

    public String getXmlProcessado() {
        return xmlProcessado;
    }

    public void setXmlProcessado(String xmlProcessado) {
        this.xmlProcessado = xmlProcessado;
    }

    public String getMensagemRetorno() {
        return mensagemRetorno;
    }

    public void setMensagemRetorno(String mensagemRetorno) {
        this.mensagemRetorno = mensagemRetorno;
    }

    public String getCodigoRetorno() {
        return codigoRetorno;
    }

    public void setCodigoRetorno(String codigoRetorno) {
        this.codigoRetorno = codigoRetorno;
    }

    public LocalDateTime getDataEmissao() {
        return dataEmissao;
    }

    public void setDataEmissao(LocalDateTime dataEmissao) {
        this.dataEmissao = dataEmissao;
    }

    public LocalDateTime getDataSaidaEntrada() {
        return dataSaidaEntrada;
    }

    public void setDataSaidaEntrada(LocalDateTime dataSaidaEntrada) {
        this.dataSaidaEntrada = dataSaidaEntrada;
    }

    public LocalDateTime getDataAutorizacao() {
        return dataAutorizacao;
    }

    public void setDataAutorizacao(LocalDateTime dataAutorizacao) {
        this.dataAutorizacao = dataAutorizacao;
    }

    public LocalDateTime getDataCancelamento() {
        return dataCancelamento;
    }

    public void setDataCancelamento(LocalDateTime dataCancelamento) {
        this.dataCancelamento = dataCancelamento;
    }

    public String getTipoNota() {
        return tipoNota;
    }

    public void setTipoNota(String tipoNota) {
        this.tipoNota = tipoNota;
    }

    public String getAmbiente() {
        return ambiente;
    }

    public void setAmbiente(String ambiente) {
        this.ambiente = ambiente;
    }

    public FinalidadeEnum getFinalidade() {
        return finalidade;
    }

    public void setFinalidade(FinalidadeEnum finalidade) {
        this.finalidade = finalidade;
    }

    public Integer getIndicadorPresenca() {
        return indicadorPresenca;
    }

    public void setIndicadorPresenca(Integer indicadorPresenca) {
        this.indicadorPresenca = indicadorPresenca;
    }

    public Integer getIndicadorFinal() {
        return indicadorFinal;
    }

    public void setIndicadorFinal(Integer indicadorFinal) {
        this.indicadorFinal = indicadorFinal;
    }

    public String getInformacoesFisco() {
        return informacoesFisco;
    }

    public void setInformacoesFisco(String informacoesFisco) {
        this.informacoesFisco = informacoesFisco;
    }

    public String getInformacoesComplementares() {
        return informacoesComplementares;
    }

    public void setInformacoesComplementares(String informacoesComplementares) {
        this.informacoesComplementares = informacoesComplementares;
    }

    public BigDecimal getValorTotalNota() {
        return valorTotalNota;
    }

    public void setValorTotalNota(BigDecimal valorTotalNota) {
        this.valorTotalNota = valorTotalNota;
    }

    public BigDecimal getValorTotalProdutos() {
        return valorTotalProdutos;
    }

    public void setValorTotalProdutos(BigDecimal valorTotalProdutos) {
        this.valorTotalProdutos = valorTotalProdutos;
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

    public BigDecimal getValorDesconto() {
        return valorDesconto;
    }

    public void setValorDesconto(BigDecimal valorDesconto) {
        this.valorDesconto = valorDesconto;
    }

    public BigDecimal getValorOutros() {
        return valorOutros;
    }

    public void setValorOutros(BigDecimal valorOutros) {
        this.valorOutros = valorOutros;
    }

    public BigDecimal getValorBaseCalculoIcms() {
        return valorBaseCalculoIcms;
    }

    public void setValorBaseCalculoIcms(BigDecimal valorBaseCalculoIcms) {
        this.valorBaseCalculoIcms = valorBaseCalculoIcms;
    }

    public BigDecimal getValorIcms() {
        return valorIcms;
    }

    public void setValorIcms(BigDecimal valorIcms) {
        this.valorIcms = valorIcms;
    }

    public Set<NotaFiscalProdutoItem> getItens() {
        return itens;
    }

    public void setItens(Set<NotaFiscalProdutoItem> itens) {
        this.itens = itens;
    }

    public Set<NotaFiscalProdutoPagamento> getPagamentos() {
        return pagamentos;
    }

    public void setPagamentos(Set<NotaFiscalProdutoPagamento> pagamentos) {
        this.pagamentos = pagamentos;
    }

    public Integer getSequenciaEvento() {
        return sequenciaEvento;
    }

    public void setSequenciaEvento(Integer sequenciaEvento) {
        this.sequenciaEvento = sequenciaEvento;
    }

    public String getModFrete() {
        return modFrete;
    }

    public void setModFrete(String modFrete) {
        this.modFrete = modFrete;
    }

    public String getTransportadoraNome() {
        return transportadoraNome;
    }

    public void setTransportadoraNome(String transportadoraNome) {
        this.transportadoraNome = transportadoraNome;
    }

    public String getTransportadoraCnpjCpf() {
        return transportadoraCnpjCpf;
    }

    public void setTransportadoraCnpjCpf(String transportadoraCnpjCpf) {
        this.transportadoraCnpjCpf = transportadoraCnpjCpf;
    }

    public String getPlacaVeiculo() {
        return placaVeiculo;
    }

    public void setPlacaVeiculo(String placaVeiculo) {
        this.placaVeiculo = placaVeiculo;
    }

    public String getPlacaUf() {
        return placaUf;
    }

    public void setPlacaUf(String placaUf) {
        this.placaUf = placaUf;
    }

    public Integer getQuantidadeVolumes() {
        return quantidadeVolumes;
    }

    public void setQuantidadeVolumes(Integer quantidadeVolumes) {
        this.quantidadeVolumes = quantidadeVolumes;
    }

    public String getEspecieVolumes() {
        return especieVolumes;
    }

    public void setEspecieVolumes(String especieVolumes) {
        this.especieVolumes = especieVolumes;
    }

    public BigDecimal getPesoBrutoTotal() {
        return pesoBrutoTotal;
    }

    public void setPesoBrutoTotal(BigDecimal pesoBrutoTotal) {
        this.pesoBrutoTotal = pesoBrutoTotal;
    }

    public BigDecimal getPesoLiquidoTotal() {
        return pesoLiquidoTotal;
    }

    public void setPesoLiquidoTotal(BigDecimal pesoLiquidoTotal) {
        this.pesoLiquidoTotal = pesoLiquidoTotal;
    }

    public String getChaveReferenciada() {
        return chaveReferenciada;
    }

    public void setChaveReferenciada(String chaveReferenciada) {
        this.chaveReferenciada = chaveReferenciada;
    }

    public UUID getPosicaoFiscalId() {
        return posicaoFiscalId;
    }

    public void setPosicaoFiscalId(UUID posicaoFiscalId) {
        this.posicaoFiscalId = posicaoFiscalId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof NotaFiscalProduto))
            return false;
        NotaFiscalProduto that = (NotaFiscalProduto) o;
        return getId() != null && getId().equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
