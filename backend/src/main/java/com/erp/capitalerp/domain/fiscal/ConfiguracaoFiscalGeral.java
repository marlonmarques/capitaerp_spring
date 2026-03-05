package com.erp.capitalerp.domain.fiscal;

import com.erp.capitalerp.domain.shared.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.UUID;

import java.math.BigDecimal;

@Entity
@Table(name = "config_fiscal_geral")
public class ConfiguracaoFiscalGeral extends BaseEntity {

    private String tenantIdentifier;

    private UUID filialId;

    private String certificado; // Base64
    private String senhaCertificado;
    private String ambienteServicos = "HOMOLOGACAO";
    private String ambienteProdutos = "HOMOLOGACAO";
    private Integer regimeTributario = 6;
    private BigDecimal faturamentoAnual;
    private String cnaePrincipal;

    public ConfiguracaoFiscalGeral() {
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

    public String getCertificado() {
        return certificado;
    }

    public void setCertificado(String certificado) {
        this.certificado = certificado;
    }

    public String getSenhaCertificado() {
        return senhaCertificado;
    }

    public void setSenhaCertificado(String senhaCertificado) {
        this.senhaCertificado = senhaCertificado;
    }

    public String getAmbienteServicos() {
        return ambienteServicos;
    }

    public void setAmbienteServicos(String ambienteServicos) {
        this.ambienteServicos = ambienteServicos;
    }

    public String getAmbienteProdutos() {
        return ambienteProdutos;
    }

    public void setAmbienteProdutos(String ambienteProdutos) {
        this.ambienteProdutos = ambienteProdutos;
    }

    public Integer getRegimeTributario() {
        return regimeTributario;
    }

    public void setRegimeTributario(Integer regimeTributario) {
        this.regimeTributario = regimeTributario;
    }

    public BigDecimal getFaturamentoAnual() {
        return faturamentoAnual;
    }

    public void setFaturamentoAnual(BigDecimal faturamentoAnual) {
        this.faturamentoAnual = faturamentoAnual;
    }

    public String getCnaePrincipal() {
        return cnaePrincipal;
    }

    public void setCnaePrincipal(String cnaePrincipal) {
        this.cnaePrincipal = cnaePrincipal;
    }
}
