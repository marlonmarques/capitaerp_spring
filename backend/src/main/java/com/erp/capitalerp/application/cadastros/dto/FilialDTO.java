package com.erp.capitalerp.application.cadastros.dto;

import com.erp.capitalerp.domain.cadastros.Filial;
import java.util.UUID;

public class FilialDTO {

    private UUID id;
    private String razaoSocial;
    private String nomeFantasia;
    private String cnpj;
    private String inscricaoEstadual;
    private String inscricaoMunicipal;
    private String crt;
    private Boolean isMatriz;
    private Boolean ativo;

    public FilialDTO() {
    }

    public FilialDTO(Filial filial) {
        this.id = filial.getId();
        this.razaoSocial = filial.getRazaoSocial();
        this.nomeFantasia = filial.getNomeFantasia();
        this.cnpj = filial.getCnpj();
        this.inscricaoEstadual = filial.getInscricaoEstadual();
        this.inscricaoMunicipal = filial.getInscricaoMunicipal();
        this.crt = filial.getCrt();
        this.isMatriz = filial.getIsMatriz();
        this.ativo = filial.getAtivo();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public void setNomeFantasia(String nomeFantasia) {
        this.nomeFantasia = nomeFantasia;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getInscricaoEstadual() {
        return inscricaoEstadual;
    }

    public void setInscricaoEstadual(String inscricaoEstadual) {
        this.inscricaoEstadual = inscricaoEstadual;
    }

    public String getInscricaoMunicipal() {
        return inscricaoMunicipal;
    }

    public void setInscricaoMunicipal(String inscricaoMunicipal) {
        this.inscricaoMunicipal = inscricaoMunicipal;
    }

    public String getCrt() {
        return crt;
    }

    public void setCrt(String crt) {
        this.crt = crt;
    }

    public Boolean getIsMatriz() {
        return isMatriz;
    }

    public void setIsMatriz(Boolean isMatriz) {
        this.isMatriz = isMatriz;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}
