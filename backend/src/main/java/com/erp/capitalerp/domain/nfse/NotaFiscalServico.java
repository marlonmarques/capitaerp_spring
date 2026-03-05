package com.erp.capitalerp.domain.nfse;

import com.erp.capitalerp.domain.clientes.Cliente;
import com.erp.capitalerp.domain.shared.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidade NFS-e — Nota Fiscal de Serviços Eletrônica.
 *
 * <p>
 * Ciclo: RASCUNHO → PROCESSANDO → AUTORIZADA / REJEITADA <br>
 * Cancelamento: AUTORIZADA → CANCELADA
 *
 * <p>
 * Integração com ACBr Microserviço via
 * {@link com.erp.capitalerp.application.nfse.AcbrNFSeService}.
 */
@Entity
@Table(name = "nfse")
public class NotaFiscalServico extends BaseEntity {

    // ─── Identificação ────────────────────────────────────────────────────────

    @Column(nullable = false)
    private Integer numeroRps;

    @Column(nullable = false, length = 10)
    private String serieRps = "1";

    /** Número gerado pela prefeitura após autorização */
    @Column(length = 20)
    private String numeroNfse;

    @Column(length = 50)
    private String codigoVerificacao;

    // ─── Status ───────────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusNFSe status = StatusNFSe.RASCUNHO;

    // ─── Tomador ──────────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    /** Emails extras para envio — JSON array */
    @Column(columnDefinition = "TEXT")
    private String emailsEnvio;

    // ─── Serviço ──────────────────────────────────────────────────────────────

    @Column(length = 5)
    private String naturezaOperacao = "1";

    @Column(columnDefinition = "TEXT", nullable = false)
    private String discriminacaoServico;

    @Column(columnDefinition = "TEXT")
    private String informacoesComplementares;

    @Column(length = 20)
    private String codigoCnae;

    /** Item da Lista LC 116/03 — ex: "01.01" */
    @Column(length = 10)
    private String itemLc116;

    /** Código NBS para o Padrão Nacional */
    @Column(length = 20)
    private String codigoNbs;

    /** Código IBGE do município de prestação */
    @Column(length = 10)
    private String municipioIbge;

    @Column(length = 2)
    private String ufPrestacao = "DF";

    private Short exigibilidadeIss = 1;

    @Column(nullable = false)
    private Boolean issRetido = false;

    // ─── Datas ────────────────────────────────────────────────────────────────

    @Column(nullable = false)
    private LocalDate dataEmissao;

    @Column(nullable = false)
    private LocalDate dataCompetencia;

    private LocalDate dataVencimento;
    private LocalDateTime dataAutorizacao;
    private LocalDateTime dataCancelamento;

    // ─── Valores ──────────────────────────────────────────────────────────────

    @NotNull
    @Positive
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valorServicos = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal aliquotaIss = new BigDecimal("2.00");

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valorIss = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valorIssRetido = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valorLiquido = BigDecimal.ZERO;

    // ─── ACBr / Prefeitura ────────────────────────────────────────────────────

    @Column(length = 100)
    private String protocoloLote;

    @Column(columnDefinition = "TEXT")
    private String xmlNfse;

    @Column(columnDefinition = "TEXT")
    private String mensagemRetorno;

    public NotaFiscalServico() {
    }

    // ─── Comportamento de Domínio ─────────────────────────────────────────────

    /** Recalcula ISS e Líquido com base nos valores informados */
    public void recalcularValores() {
        BigDecimal base = valorServicos.subtract(valorDesconto != null ? valorDesconto : BigDecimal.ZERO);
        if (aliquotaIss != null && aliquotaIss.compareTo(BigDecimal.ZERO) > 0) {
            this.valorIss = base.multiply(aliquotaIss).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
        } else {
            this.valorIss = BigDecimal.ZERO;
        }
        this.valorIssRetido = Boolean.TRUE.equals(issRetido) ? this.valorIss : BigDecimal.ZERO;
        this.valorLiquido = base.subtract(this.valorIssRetido);
    }

    public boolean podeEmitir() {
        return status == StatusNFSe.RASCUNHO || status == StatusNFSe.REJEITADA;
    }

    public boolean podeCancelar() {
        return status == StatusNFSe.AUTORIZADA;
    }

    // ─── Getters & Setters ────────────────────────────────────────────────────

    public Integer getNumeroRps() {
        return numeroRps;
    }

    public void setNumeroRps(Integer numeroRps) {
        this.numeroRps = numeroRps;
    }

    public String getSerieRps() {
        return serieRps;
    }

    public void setSerieRps(String serieRps) {
        this.serieRps = serieRps;
    }

    public String getNumeroNfse() {
        return numeroNfse;
    }

    public void setNumeroNfse(String numeroNfse) {
        this.numeroNfse = numeroNfse;
    }

    public String getCodigoVerificacao() {
        return codigoVerificacao;
    }

    public void setCodigoVerificacao(String codigoVerificacao) {
        this.codigoVerificacao = codigoVerificacao;
    }

    public StatusNFSe getStatus() {
        return status;
    }

    public void setStatus(StatusNFSe status) {
        this.status = status;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public String getEmailsEnvio() {
        return emailsEnvio;
    }

    public void setEmailsEnvio(String emailsEnvio) {
        this.emailsEnvio = emailsEnvio;
    }

    public String getNaturezaOperacao() {
        return naturezaOperacao;
    }

    public void setNaturezaOperacao(String naturezaOperacao) {
        this.naturezaOperacao = naturezaOperacao;
    }

    public String getDiscriminacaoServico() {
        return discriminacaoServico;
    }

    public void setDiscriminacaoServico(String discriminacaoServico) {
        this.discriminacaoServico = discriminacaoServico;
    }

    public String getInformacoesComplementares() {
        return informacoesComplementares;
    }

    public void setInformacoesComplementares(String informacoesComplementares) {
        this.informacoesComplementares = informacoesComplementares;
    }

    public String getCodigoCnae() {
        return codigoCnae;
    }

    public void setCodigoCnae(String codigoCnae) {
        this.codigoCnae = codigoCnae;
    }

    public String getItemLc116() {
        return itemLc116;
    }

    public void setItemLc116(String itemLc116) {
        this.itemLc116 = itemLc116;
    }

    public String getCodigoNbs() {
        return codigoNbs;
    }

    public void setCodigoNbs(String codigoNbs) {
        this.codigoNbs = codigoNbs;
    }

    public String getMunicipioIbge() {
        return municipioIbge;
    }

    public void setMunicipioIbge(String municipioIbge) {
        this.municipioIbge = municipioIbge;
    }

    public String getUfPrestacao() {
        return ufPrestacao;
    }

    public void setUfPrestacao(String ufPrestacao) {
        this.ufPrestacao = ufPrestacao;
    }

    public Short getExigibilidadeIss() {
        return exigibilidadeIss;
    }

    public void setExigibilidadeIss(Short exigibilidadeIss) {
        this.exigibilidadeIss = exigibilidadeIss;
    }

    public Boolean getIssRetido() {
        return issRetido;
    }

    public void setIssRetido(Boolean issRetido) {
        this.issRetido = issRetido;
    }

    public LocalDate getDataEmissao() {
        return dataEmissao;
    }

    public void setDataEmissao(LocalDate dataEmissao) {
        this.dataEmissao = dataEmissao;
    }

    public LocalDate getDataCompetencia() {
        return dataCompetencia;
    }

    public void setDataCompetencia(LocalDate dataCompetencia) {
        this.dataCompetencia = dataCompetencia;
    }

    public LocalDate getDataVencimento() {
        return dataVencimento;
    }

    public void setDataVencimento(LocalDate dataVencimento) {
        this.dataVencimento = dataVencimento;
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

    public BigDecimal getValorServicos() {
        return valorServicos;
    }

    public void setValorServicos(BigDecimal valorServicos) {
        this.valorServicos = valorServicos;
    }

    public BigDecimal getValorDesconto() {
        return valorDesconto;
    }

    public void setValorDesconto(BigDecimal valorDesconto) {
        this.valorDesconto = valorDesconto;
    }

    public BigDecimal getAliquotaIss() {
        return aliquotaIss;
    }

    public void setAliquotaIss(BigDecimal aliquotaIss) {
        this.aliquotaIss = aliquotaIss;
    }

    public BigDecimal getValorIss() {
        return valorIss;
    }

    public void setValorIss(BigDecimal valorIss) {
        this.valorIss = valorIss;
    }

    public BigDecimal getValorIssRetido() {
        return valorIssRetido;
    }

    public void setValorIssRetido(BigDecimal valorIssRetido) {
        this.valorIssRetido = valorIssRetido;
    }

    public BigDecimal getValorLiquido() {
        return valorLiquido;
    }

    public void setValorLiquido(BigDecimal valorLiquido) {
        this.valorLiquido = valorLiquido;
    }

    public String getProtocoloLote() {
        return protocoloLote;
    }

    public void setProtocoloLote(String protocoloLote) {
        this.protocoloLote = protocoloLote;
    }

    public String getXmlNfse() {
        return xmlNfse;
    }

    public void setXmlNfse(String xmlNfse) {
        this.xmlNfse = xmlNfse;
    }

    public String getMensagemRetorno() {
        return mensagemRetorno;
    }

    public void setMensagemRetorno(String mensagemRetorno) {
        this.mensagemRetorno = mensagemRetorno;
    }
}
