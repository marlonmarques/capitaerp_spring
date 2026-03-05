package com.erp.capitalerp.application.cadastros.dto;

import java.io.Serializable;

public class NcmResultDTO implements Serializable {
    private String codigo;
    private String descricao;
    private Double pisCofinsNacional; // nacional_federal
    private Double pisCofinsImportado; // importado_federal
    private Double icmsEstadual; // estadual
    private Double issMunicipal; // municipal

    public NcmResultDTO() {
    }

    public NcmResultDTO(String codigo, String descricao, Double pisCofinsNacional, Double pisCofinsImportado,
            Double icmsEstadual, Double issMunicipal) {
        this.codigo = codigo;
        this.descricao = descricao;
        this.pisCofinsNacional = pisCofinsNacional;
        this.pisCofinsImportado = pisCofinsImportado;
        this.icmsEstadual = icmsEstadual;
        this.issMunicipal = issMunicipal;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public Double getPisCofinsNacional() {
        return pisCofinsNacional;
    }

    public Double getPisCofinsImportado() {
        return pisCofinsImportado;
    }

    public Double getIcmsEstadual() {
        return icmsEstadual;
    }

    public Double getIssMunicipal() {
        return issMunicipal;
    }

    // label helper para o autocomplete
    public String getLabel() {
        return codigo + " - " + descricao;
    }
}
