package com.erp.capitalerp.domain.nfe;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "tb_nfe_pagamento")
public class NotaFiscalProdutoPagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @com.fasterxml.jackson.annotation.JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nota_id", nullable = false)
    private NotaFiscalProduto nota;

    @Column(nullable = false, length = 2)
    private String tipoPagamento; // 01, 03, 15, 17, etc.

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valorPagamento;

    private Integer indicadorPagamento = 0; // 0-Vista, 1-Prazo

    @Column(length = 2)
    private String bandeiraCartao;

    @Column(length = 14)
    private String cnpjCredenciadora;

    @Column(length = 60)
    private String codigoAutorizacao;

    private java.time.LocalDate dataVencimento;

    public NotaFiscalProdutoPagamento() {
    }

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

    public String getTipoPagamento() {
        return tipoPagamento;
    }

    public void setTipoPagamento(String tipoPagamento) {
        this.tipoPagamento = tipoPagamento;
    }

    public BigDecimal getValorPagamento() {
        return valorPagamento;
    }

    public void setValorPagamento(BigDecimal valorPagamento) {
        this.valorPagamento = valorPagamento;
    }

    public Integer getIndicadorPagamento() {
        return indicadorPagamento;
    }

    public void setIndicadorPagamento(Integer indicadorPagamento) {
        this.indicadorPagamento = indicadorPagamento;
    }

    public String getBandeiraCartao() {
        return bandeiraCartao;
    }

    public void setBandeiraCartao(String bandeiraCartao) {
        this.bandeiraCartao = bandeiraCartao;
    }

    public String getCnpjCredenciadora() {
        return cnpjCredenciadora;
    }

    public void setCnpjCredenciadora(String cnpjCredenciadora) {
        this.cnpjCredenciadora = cnpjCredenciadora;
    }

    public String getCodigoAutorizacao() {
        return codigoAutorizacao;
    }

    public void setCodigoAutorizacao(String codigoAutorizacao) {
        this.codigoAutorizacao = codigoAutorizacao;
    }

    public java.time.LocalDate getDataVencimento() {
        return dataVencimento;
    }

    public void setDataVencimento(java.time.LocalDate dataVencimento) {
        this.dataVencimento = dataVencimento;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof NotaFiscalProdutoPagamento))
            return false;
        NotaFiscalProdutoPagamento that = (NotaFiscalProdutoPagamento) o;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
