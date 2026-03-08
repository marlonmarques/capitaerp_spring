package com.erp.capitalerp.domain.cadastros;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "planos")
public class Plano {

    @Id
    private UUID id;
    private String nome;
    private String descricao;
    private Boolean moduloNfse;
    private Boolean moduloNfe;
    private Boolean moduloNfce;
    private Boolean moduloEstoque;
    private Boolean moduloFinanceiro;
    private Integer limiteUsuarios;
    private Integer limiteFiliais;
    private BigDecimal valorMensal;
    private Boolean ativo;

    public Plano() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

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

    public Boolean getModuloNfse() {
        return moduloNfse;
    }

    public void setModuloNfse(Boolean moduloNfse) {
        this.moduloNfse = moduloNfse;
    }

    public Boolean getModuloNfe() {
        return moduloNfe;
    }

    public void setModuloNfe(Boolean moduloNfe) {
        this.moduloNfe = moduloNfe;
    }

    public Boolean getModuloNfce() {
        return moduloNfce;
    }

    public void setModuloNfce(Boolean moduloNfce) {
        this.moduloNfce = moduloNfce;
    }

    public Boolean getModuloEstoque() {
        return moduloEstoque;
    }

    public void setModuloEstoque(Boolean moduloEstoque) {
        this.moduloEstoque = moduloEstoque;
    }

    public Boolean getModuloFinanceiro() {
        return moduloFinanceiro;
    }

    public void setModuloFinanceiro(Boolean moduloFinanceiro) {
        this.moduloFinanceiro = moduloFinanceiro;
    }

    public Integer getLimiteUsuarios() {
        return limiteUsuarios;
    }

    public void setLimiteUsuarios(Integer limiteUsuarios) {
        this.limiteUsuarios = limiteUsuarios;
    }

    public Integer getLimiteFiliais() {
        return limiteFiliais;
    }

    public void setLimiteFiliais(Integer limiteFiliais) {
        this.limiteFiliais = limiteFiliais;
    }

    public BigDecimal getValorMensal() {
        return valorMensal;
    }

    public void setValorMensal(BigDecimal valorMensal) {
        this.valorMensal = valorMensal;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}
