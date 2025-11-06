package com.erp.capitalerp.entities;

import java.time.Instant;
import java.util.HashSet;
import java.util.Locale.Category;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    private Long posicaoFiscal;
    private Long codPagto;
    /* 
    @ManyToMany
    @JoinTable(name = "tb_product_category",
        joinColumns = @jakarta.persistence.JoinColumn(name = "product_id"),
        inverseJoinColumns = @jakarta.persistence.JoinColumn(name = "category_id"))
    Set<Category> categories = new HashSet<>();
    */

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant createdAt;
    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public Cliente() {
    }

    public Cliente(Long id, String name, String lastName, String razaoSocial, Long tipoPessoa, String cpf,
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
