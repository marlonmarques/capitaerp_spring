package com.erp.capitalerp.application.cadastros.dto;

import com.erp.capitalerp.domain.cadastros.Fornecedor;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

public class FornecedorDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private UUID id;
    private String nomeFantasia;
    private String razaoSocial;
    private String cnpj;
    private String inscricaoEstadual;
    private String telefone;
    private String email;
    private String cep;
    private String endereco;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String uf;
    private String codigoIbgeUf;
    private String codigoIbgeCidade;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

    public FornecedorDTO() {
    }

    public FornecedorDTO(UUID id, String nomeFantasia, String razaoSocial, String cnpj) {
        this.id = id;
        this.nomeFantasia = nomeFantasia;
        this.razaoSocial = razaoSocial;
        this.cnpj = cnpj;
    }

    public FornecedorDTO(Fornecedor entity) {
        this.id = entity.getId();
        this.nomeFantasia = entity.getNomeFantasia();
        this.razaoSocial = entity.getRazaoSocial();
        this.cnpj = entity.getCnpj();
        this.inscricaoEstadual = entity.getInscricaoEstadual();
        this.telefone = entity.getTelefone();
        this.email = entity.getEmail();
        this.cep = entity.getCep();
        this.endereco = entity.getEndereco();
        this.numero = entity.getNumero();
        this.complemento = entity.getComplemento();
        this.bairro = entity.getBairro();
        this.cidade = entity.getCidade();
        this.uf = entity.getUf();
        this.codigoIbgeUf = entity.getCodigoIbgeUf();
        this.codigoIbgeCidade = entity.getCodigoIbgeCidade();
        this.criadoEm = entity.getCriadoEm();
        this.atualizadoEm = entity.getAtualizadoEm();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public void setNomeFantasia(String nomeFantasia) {
        this.nomeFantasia = nomeFantasia;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    public String getInscricaoEstadual() {
        return inscricaoEstadual;
    }

    public void setInscricaoEstadual(String inscricaoEstadual) {
        this.inscricaoEstadual = inscricaoEstadual;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public String getCodigoIbgeUf() {
        return codigoIbgeUf;
    }

    public void setCodigoIbgeUf(String codigoIbgeUf) {
        this.codigoIbgeUf = codigoIbgeUf;
    }

    public String getCodigoIbgeCidade() {
        return codigoIbgeCidade;
    }

    public void setCodigoIbgeCidade(String codigoIbgeCidade) {
        this.codigoIbgeCidade = codigoIbgeCidade;
    }
}
