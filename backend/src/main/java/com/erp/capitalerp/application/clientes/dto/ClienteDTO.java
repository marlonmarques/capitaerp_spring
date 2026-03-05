package com.erp.capitalerp.application.clientes.dto;

import com.erp.capitalerp.domain.clientes.Cliente;

public class ClienteDTO {

    private Long id;
    private String name;
    private String lastName;
    private String razaoSocial;
    private Long tipoPessoa;
    private String cpf;
    private String telefone;
    private String celular;
    private String inscEString;
    private String inscMunicipal;
    private Long iss;
    private Long indIe;
    private String posicaoFiscalId;
    private Long codPagto;
    private String rg;
    private Boolean reterIss;
    private String notaInterna;

    private java.util.List<EnderecoClienteDTO> enderecos = new java.util.ArrayList<>();
    private java.util.List<EmailClienteDTO> emails = new java.util.ArrayList<>();

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
        this.posicaoFiscalId = posicaoFiscal != null ? String.valueOf(posicaoFiscal) : null;
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
        posicaoFiscalId = entity.getPosicaoFiscalId();
        codPagto = entity.getCodPagto();
        rg = entity.getRg();
        reterIss = entity.getReterIss();
        notaInterna = entity.getNotaInterna();
        if (entity.getEnderecos() != null) {
            this.enderecos = entity.getEnderecos().stream().map(EnderecoClienteDTO::new)
                    .collect(java.util.stream.Collectors.toList());
        }
        if (entity.getEmails() != null) {
            this.emails = entity.getEmails().stream().map(EmailClienteDTO::new)
                    .collect(java.util.stream.Collectors.toList());
        }
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

    public String getPosicaoFiscalId() {
        return posicaoFiscalId;
    }

    public void setPosicaoFiscalId(String posicaoFiscalId) {
        this.posicaoFiscalId = posicaoFiscalId;
    }

    public Long getCodPagto() {
        return codPagto;
    }

    public void setCodPagto(Long codPagto) {
        this.codPagto = codPagto;
    }

    public java.util.List<EnderecoClienteDTO> getEnderecos() {
        return enderecos;
    }

    public void setEnderecos(java.util.List<EnderecoClienteDTO> enderecos) {
        this.enderecos = enderecos;
    }

    public java.util.List<EmailClienteDTO> getEmails() {
        return emails;
    }

    public void setEmails(java.util.List<EmailClienteDTO> emails) {
        this.emails = emails;
    }

    public String getRg() {
        return rg;
    }

    public void setRg(String rg) {
        this.rg = rg;
    }

    public Boolean getReterIss() {
        return reterIss;
    }

    public void setReterIss(Boolean reterIss) {
        this.reterIss = reterIss;
    }

    public String getNotaInterna() {
        return notaInterna;
    }

    public void setNotaInterna(String notaInterna) {
        this.notaInterna = notaInterna;
    }
}
