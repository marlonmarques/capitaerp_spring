package com.erp.capitalerp.sqlite.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "local_ncm")
public class Ncm {

    @Id
    private Long id;

    @Column(name = "codigo", length = 10)
    private String codigo;

    @Column(name = "descricao", length = 255)
    private String descricao;

    @Column(name = "nacional_federal")
    private Double nacionalFederal;

    @Column(name = "importado_federal")
    private Double importadoFederal;

    @Column(name = "estadual")
    private Double estadual;

    @Column(name = "municipal")
    private Double municipal;

    public Long getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public Double getNacionalFederal() {
        return nacionalFederal;
    }

    public Double getImportadoFederal() {
        return importadoFederal;
    }

    public Double getEstadual() {
        return estadual;
    }

    public Double getMunicipal() {
        return municipal;
    }
}
