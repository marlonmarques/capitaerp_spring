package com.erp.capitalerp.application.cadastros.dto;

import com.erp.capitalerp.domain.cadastros.Pdv;
import java.util.UUID;

public class PdvDTO {

    private UUID id;
    private UUID filialId;
    private String nome;
    private Integer serieNfce;
    private Integer numeroAtualNfce;
    private Boolean ativo;

    public PdvDTO() {
    }

    public PdvDTO(Pdv pdv) {
        this.id = pdv.getId();
        this.filialId = pdv.getFilial() != null ? pdv.getFilial().getId() : null;
        this.nome = pdv.getNome();
        this.serieNfce = pdv.getSerieNfce();
        this.numeroAtualNfce = pdv.getNumeroAtualNfce();
        this.ativo = pdv.getAtivo();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getFilialId() {
        return filialId;
    }

    public void setFilialId(UUID filialId) {
        this.filialId = filialId;
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
