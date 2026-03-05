package com.erp.capitalerp.application.fiscal.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class ConfiguracaoFiscalGeralDTO {
    private UUID id;
    private String certificado;
    private String senhaCertificado;
    private String ambienteServicos;
    private String ambienteProdutos;
    private Integer regimeTributario;
    private BigDecimal faturamentoAnual;
    private String cnaePrincipal;

    // Optional flag for the frontend to know if there's a certificate saved without
    // sending its content
    private Boolean temCertificado;

    public ConfiguracaoFiscalGeralDTO() {
    }

    public ConfiguracaoFiscalGeralDTO(com.erp.capitalerp.domain.fiscal.ConfiguracaoFiscalGeral entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.certificado = null; // Do not return the certificate contents for security/size reasons, except if
                                     // explicitly requested or we just return the boolean flag
            this.senhaCertificado = entity.getSenhaCertificado();
            this.ambienteServicos = entity.getAmbienteServicos();
            this.ambienteProdutos = entity.getAmbienteProdutos();
            this.regimeTributario = entity.getRegimeTributario();
            this.faturamentoAnual = entity.getFaturamentoAnual();
            this.cnaePrincipal = entity.getCnaePrincipal();
            this.temCertificado = (entity.getCertificado() != null && !entity.getCertificado().isEmpty());
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public Boolean getTemCertificado() {
        return temCertificado;
    }

    public void setTemCertificado(Boolean temCertificado) {
        this.temCertificado = temCertificado;
    }
}
