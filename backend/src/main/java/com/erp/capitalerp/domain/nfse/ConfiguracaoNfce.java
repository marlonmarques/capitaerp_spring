package com.erp.capitalerp.domain.nfse;

import com.erp.capitalerp.domain.shared.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "config_nfce")
public class ConfiguracaoNfce extends BaseEntity {

    private String tenantIdentifier;
    private UUID filialId;
    private Boolean ativarNfce = false;
    private Integer serie = 1;
    private Integer numeroNfce = 1;
    private UUID categoriaId;
    private String infoComplementarPadrao;
    private String cfopPadrao;
    private UUID contaBancariaId;
    private String ambiente = "HOMOLOGACAO";
    private Boolean enviarEmail = false;
    private String assuntoEmail;
    private String mensagemEmail;
    private String idCsc;
    private String csc;

    public ConfiguracaoNfce() {
    }

    public String getTenantIdentifier() {
        return tenantIdentifier;
    }

    public void setTenantIdentifier(String tenantIdentifier) {
        this.tenantIdentifier = tenantIdentifier;
    }

    public UUID getFilialId() {
        return filialId;
    }

    public void setFilialId(UUID filialId) {
        this.filialId = filialId;
    }

    public Boolean getAtivarNfce() {
        return ativarNfce;
    }

    public void setAtivarNfce(Boolean ativarNfce) {
        this.ativarNfce = ativarNfce;
    }

    public Integer getSerie() {
        return serie;
    }

    public void setSerie(Integer serie) {
        this.serie = serie;
    }

    public Integer getNumeroNfce() {
        return numeroNfce;
    }

    public void setNumeroNfce(Integer numeroNfce) {
        this.numeroNfce = numeroNfce;
    }

    public UUID getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(UUID categoriaId) {
        this.categoriaId = categoriaId;
    }

    public String getInfoComplementarPadrao() {
        return infoComplementarPadrao;
    }

    public void setInfoComplementarPadrao(String infoComplementarPadrao) {
        this.infoComplementarPadrao = infoComplementarPadrao;
    }

    public String getCfopPadrao() {
        return cfopPadrao;
    }

    public void setCfopPadrao(String cfopPadrao) {
        this.cfopPadrao = cfopPadrao;
    }

    public UUID getContaBancariaId() {
        return contaBancariaId;
    }

    public void setContaBancariaId(UUID contaBancariaId) {
        this.contaBancariaId = contaBancariaId;
    }

    public String getAmbiente() {
        return ambiente;
    }

    public void setAmbiente(String ambiente) {
        this.ambiente = ambiente;
    }

    public Boolean getEnviarEmail() {
        return enviarEmail;
    }

    public void setEnviarEmail(Boolean enviarEmail) {
        this.enviarEmail = enviarEmail;
    }

    public String getAssuntoEmail() {
        return assuntoEmail;
    }

    public void setAssuntoEmail(String assuntoEmail) {
        this.assuntoEmail = assuntoEmail;
    }

    public String getMensagemEmail() {
        return mensagemEmail;
    }

    public void setMensagemEmail(String mensagemEmail) {
        this.mensagemEmail = mensagemEmail;
    }

    public String getIdCsc() {
        return idCsc;
    }

    public void setIdCsc(String idCsc) {
        this.idCsc = idCsc;
    }

    public String getCsc() {
        return csc;
    }

    public void setCsc(String csc) {
        this.csc = csc;
    }
}
