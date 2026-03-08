package com.erp.capitalerp.domain.nfse;

import com.erp.capitalerp.domain.shared.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "config_nfse")
public class ConfiguracaoNfse extends BaseEntity {

    private String tenantIdentifier;
    private UUID filialId;
    private Boolean ativarNfse = false;
    private Integer serie = 1;
    private Integer numeroRps = 1;
    private UUID categoriaId;
    private String infoComplementarPadrao;
    private String cnaePadrao;
    private String nbsPadrao;
    private String itemLc116Padrao;
    private BigDecimal aliquotaPadrao;
    private UUID contaBancariaId;
    private String ambiente = "HOMOLOGACAO";
    private Boolean enviarEmail = false;
    private String assuntoEmail;
    private String mensagemEmail;

    public ConfiguracaoNfse() {
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

    public Boolean getAtivarNfse() {
        return ativarNfse;
    }

    public void setAtivarNfse(Boolean ativarNfse) {
        this.ativarNfse = ativarNfse;
    }

    public Integer getSerie() {
        return serie;
    }

    public void setSerie(Integer serie) {
        this.serie = serie;
    }

    public Integer getNumeroRps() {
        return numeroRps;
    }

    public void setNumeroRps(Integer numeroRps) {
        this.numeroRps = numeroRps;
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

    public String getCnaePadrao() {
        return cnaePadrao;
    }

    public void setCnaePadrao(String cnaePadrao) {
        this.cnaePadrao = cnaePadrao;
    }

    public String getNbsPadrao() {
        return nbsPadrao;
    }

    public void setNbsPadrao(String nbsPadrao) {
        this.nbsPadrao = nbsPadrao;
    }

    public String getItemLc116Padrao() {
        return itemLc116Padrao;
    }

    public void setItemLc116Padrao(String itemLc116Padrao) {
        this.itemLc116Padrao = itemLc116Padrao;
    }

    public BigDecimal getAliquotaPadrao() {
        return aliquotaPadrao;
    }

    public void setAliquotaPadrao(BigDecimal aliquotaPadrao) {
        this.aliquotaPadrao = aliquotaPadrao;
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
