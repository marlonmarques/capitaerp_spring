package com.erp.capitalerp.domain.nfse;

import com.erp.capitalerp.domain.shared.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "config_nfe")
public class ConfiguracaoNfe extends BaseEntity {

    private String tenantIdentifier;
    private UUID filialId;
    private Boolean ativarNfe = false;
    private Integer serie = 1;
    private Integer numeroNfe = 1;
    private UUID categoriaId;
    private String infoComplementarPadrao;
    private String cfopPadrao;
    private String naturezaOperacaoPadrao;
    private UUID contaBancariaId;
    private String ambiente = "HOMOLOGACAO";
    private Boolean enviarEmail = false;
    private String assuntoEmail;
    private String mensagemEmail;

    public ConfiguracaoNfe() {
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

    public Boolean getAtivarNfe() {
        return ativarNfe;
    }

    public void setAtivarNfe(Boolean ativarNfe) {
        this.ativarNfe = ativarNfe;
    }

    public Integer getSerie() {
        return serie;
    }

    public void setSerie(Integer serie) {
        this.serie = serie;
    }

    public Integer getNumeroNfe() {
        return numeroNfe;
    }

    public void setNumeroNfe(Integer numeroNfe) {
        this.numeroNfe = numeroNfe;
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

    public String getNaturezaOperacaoPadrao() {
        return naturezaOperacaoPadrao;
    }

    public void setNaturezaOperacaoPadrao(String naturezaOperacaoPadrao) {
        this.naturezaOperacaoPadrao = naturezaOperacaoPadrao;
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
}
