package com.erp.capitalerp.application.cadastros.dto;

import com.erp.capitalerp.domain.cadastros.Categoria;
import com.erp.capitalerp.domain.cadastros.TipoCategoria;
import java.util.UUID;
import java.io.Serializable;

public class CategoriaDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private UUID id;
    private String nome;
    private String descricao;
    private TipoCategoria tipo;
    private java.math.BigDecimal porcentagemLucroPadrao;
    private UUID categoriaPaiId;
    private java.time.LocalDateTime criadoEm;
    private java.time.LocalDateTime atualizadoEm;

    public CategoriaDTO() {
    }

    public CategoriaDTO(UUID id, String nome, String descricao, TipoCategoria tipo,
            java.math.BigDecimal porcentagemLucroPadrao, UUID categoriaPaiId) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.tipo = tipo;
        this.porcentagemLucroPadrao = porcentagemLucroPadrao;
        this.categoriaPaiId = categoriaPaiId;
    }

    public CategoriaDTO(Categoria entity) {
        this.id = entity.getId();
        this.nome = entity.getNome();
        this.descricao = entity.getDescricao();
        this.tipo = entity.getTipo();
        this.porcentagemLucroPadrao = entity.getPorcentagemLucroPadrao();
        this.categoriaPaiId = entity.getCategoriaPai() != null ? entity.getCategoriaPai().getId() : null;
        this.criadoEm = entity.getCriadoEm();
        this.atualizadoEm = entity.getAtualizadoEm();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public TipoCategoria getTipo() {
        return tipo;
    }

    public void setTipo(TipoCategoria tipo) {
        this.tipo = tipo;
    }

    public java.math.BigDecimal getPorcentagemLucroPadrao() {
        return porcentagemLucroPadrao;
    }

    public void setPorcentagemLucroPadrao(java.math.BigDecimal porcentagemLucroPadrao) {
        this.porcentagemLucroPadrao = porcentagemLucroPadrao;
    }

    public UUID getCategoriaPaiId() {
        return categoriaPaiId;
    }

    public void setCategoriaPaiId(UUID categoriaPaiId) {
        this.categoriaPaiId = categoriaPaiId;
    }

    public java.time.LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(java.time.LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public java.time.LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(java.time.LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
