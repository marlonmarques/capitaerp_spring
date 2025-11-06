package com.erp.capitalerp.dto;

import org.hibernate.validator.constraints.br.CPF;

import com.erp.capitalerp.entities.Cliente;

import jakarta.validation.constraints.NotEmpty;

public class ClienteDTO {

    private Long id;
    @NotEmpty(message = "Campo requerido")
    private String name;
    private String lastName;
    private String razaoSocial;
    private Long tipoPessoa;
    @NotEmpty(message = "Campo requerido")
    @CPF(message = "CPF inválido")
    private String cpf;
    private String telefone;
    private String celular;
    private String inscEString;
    private String inscMunicipal;
    private Long iss;
    private Long indIe;
    private Long posicaoFiscal;
    private Long codPagto;

    public ClienteDTO() {
    }

    public ClienteDTO(Long id, String name, String lastName, String razaoSocial, Long tipoPessoa, String cpf,
            String telefone, String celular, String inscEString, String inscMunicipal, Long iss, Long indIe,
            Long posicaoFiscal, Long codPagto) {
        this.id = id;
        this.name = name;
        this.lastName = lastName;
        this.razaoSocial = razaoSocial;
        this.tipoPessoa = tipoPessoa;
        this.cpf = cpf;
        this.telefone = telefone;
        this.celular = celular;
        this.inscEString = inscEString;
        this.inscMunicipal = inscMunicipal;
        this.iss = iss;
        this.indIe = indIe;
        this.posicaoFiscal = posicaoFiscal;
        this.codPagto = codPagto;
    }

    public ClienteDTO(Cliente entity) {
        id = entity.getId();
        name = entity.getName();
        lastName = entity.getLastName();
        razaoSocial = entity.getRazaoSocial();
        tipoPessoa = entity.getTipoPessoa();
        cpf = entity.getCpf();
        telefone = entity.getTelefone();
        celular = entity.getCelular();
        inscEString = entity.getInscEString();
        inscMunicipal = entity.getInscMunicipal();
        iss = entity.getIss();
        indIe = entity.getIndIe();
        posicaoFiscal = entity.getPosicaoFiscal();
        codPagto = entity.getCodPagto();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public Long getTipoPessoa() {
        return tipoPessoa;
    }

    public void setTipoPessoa(Long tipoPessoa) {
        this.tipoPessoa = tipoPessoa;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getCelular() {
        return celular;
    }

    public void setCelular(String celular) {
        this.celular = celular;
    }

    public String getInscEString() {
        return inscEString;
    }

    public void setInscEString(String inscEString) {
        this.inscEString = inscEString;
    }

    public String getInscMunicipal() {
        return inscMunicipal;
    }

    public void setInscMunicipal(String inscMunicipal) {
        this.inscMunicipal = inscMunicipal;
    }

    public Long getIss() {
        return iss;
    }

    public void setIss(Long iss) {
        this.iss = iss;
    }

    public Long getIndIe() {
        return indIe;
    }

    public void setIndIe(Long indIe) {
        this.indIe = indIe;
    }

    public Long getPosicaoFiscal() {
        return posicaoFiscal;
    }

    public void setPosicaoFiscal(Long posicaoFiscal) {
        this.posicaoFiscal = posicaoFiscal;
    }

    public Long getCodPagto() {
        return codPagto;
    }

    public void setCodPagto(Long codPagto) {
        this.codPagto = codPagto;
    }

    

}
