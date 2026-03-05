package com.erp.capitalerp.domain.cadastros;

import com.erp.capitalerp.domain.shared.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "categorias")
public class Categoria extends BaseEntity {
    private String nome;

    @Column(length = 1000)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private TipoCategoria tipo;

    @Column(name = "porcentagem_lucro_padrao", precision = 10, scale = 2)
    private java.math.BigDecimal porcentagemLucroPadrao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_pai_id")
    private Categoria categoriaPai;

    @OneToMany(mappedBy = "categoriaPai", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Categoria> subcategorias = new java.util.ArrayList<>();

    public Categoria() {
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

    public Categoria getCategoriaPai() {
        return categoriaPai;
    }

    public void setCategoriaPai(Categoria categoriaPai) {
        this.categoriaPai = categoriaPai;
    }

    public java.util.List<Categoria> getSubcategorias() {
        return subcategorias;
    }

    public void setSubcategorias(java.util.List<Categoria> subcategorias) {
        this.subcategorias = subcategorias;
    }
}
