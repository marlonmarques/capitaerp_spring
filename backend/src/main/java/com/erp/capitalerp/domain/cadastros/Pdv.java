package com.erp.capitalerp.domain.cadastros;

import com.erp.capitalerp.domain.shared.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "pdvs")
public class Pdv extends BaseEntity {

    @NotBlank
    @Size(min = 3, max = 20)
    private String tenantIdentifier;

    @ManyToOne
    @JoinColumn(name = "filial_id", nullable = false)
    private Filial filial;

    @NotBlank
    private String nome;

    @NotNull
    private Integer serieNfce;

    @NotNull
    private Integer numeroAtualNfce = 1;

    private Boolean ativo = true;

    public Pdv() {
    }

    public String getTenantIdentifier() {
        return tenantIdentifier;
    }

    public void setTenantIdentifier(String tenantIdentifier) {
        this.tenantIdentifier = tenantIdentifier;
    }

    public Filial getFilial() {
        return filial;
    }

    public void setFilial(Filial filial) {
        this.filial = filial;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Integer getSerieNfce() {
        return serieNfce;
    }

    public void setSerieNfce(Integer serieNfce) {
        this.serieNfce = serieNfce;
    }

    public Integer getNumeroAtualNfce() {
        return numeroAtualNfce;
    }

    public void setNumeroAtualNfce(Integer numeroAtualNfce) {
        this.numeroAtualNfce = numeroAtualNfce;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}
