package com.erp.capitalerp.sqlite.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "cnae")
public class Cnae {

    @Id
    @Column(name = "code", length = 50)
    private String code;

    @Column(name = "mascara", length = 100)
    private String mascara;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "servico", length = 255)
    private String servico;

    @Column(name = "codigom")
    private Integer codigom;

    @Column(name = "atividade", length = 255)
    private String atividade;

    @Column(name = "alicota")
    private Integer alicota;

    public String getCode() {
        return code;
    }

    public String getMascara() {
        return mascara;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getServico() {
        return servico;
    }

    public Integer getCodigom() {
        return codigom;
    }

    public String getAtividade() {
        return atividade;
    }

    public Integer getAlicota() {
        return alicota;
    }
}
