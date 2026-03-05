package com.erp.capitalerp.sqlite.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "local_cest")
public class Cest {

    @Id
    @Column(length = 7)
    private String id; // ex: "0100100"

    @Column(length = 255, nullable = false)
    private String descricao;

    @Column(length = 100)
    private String segmento;

    @Column(name = "unidade_tributacao", length = 50)
    private String unidadeTributacao;

    @Column(name = "ncm_id")
    private Long ncmId; // FK para local_ncm.id

    public String getId() {
        return id;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getSegmento() {
        return segmento;
    }

    public String getUnidadeTributacao() {
        return unidadeTributacao;
    }

    public Long getNcmId() {
        return ncmId;
    }
}
