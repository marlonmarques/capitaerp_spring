package com.erp.capitalerp.domain.servico;

import com.erp.capitalerp.domain.shared.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Entity
@Table(name = "servicos")
public class Servico extends BaseEntity {

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @Column(length = 1000)
    private String descricao;

    @Column(unique = true, nullable = true)
    private String codigoInterno;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Enumerated(EnumType.STRING)
    private ServicoStatus status;

    private String codigoServicoLc116; // Código da Lista de Serviços LC 116/03

    @Column(precision = 5, scale = 2)
    private BigDecimal aliquotaIss; // ISS legado

    // --- Início: Previsão Reforma Tributária e Campos da Tela ---
    @Column(length = 20)
    private String cnaeCodigo; // CNAE vinculado ao serviço (Consulta SQLite)

    @Column(length = 20)
    private String nbsCodigo; // NBS - Substituirá as tabelas municipais para IBS/CBS

    @Column(columnDefinition = "TEXT")
    private String descricaoNota; // Descrição rica e completa que aparecerá na NFS-e

    // Os novos impostos do IVA Dual que substituirão ISS/PIS/COFINS
    @Column(precision = 5, scale = 2)
    private BigDecimal aliquotaIbsPadrao; // Imposto sobre Bens e Serviços (Estado/Município)

    @Column(precision = 5, scale = 2)
    private BigDecimal aliquotaCbsPadrao; // Contribuição sobre Bens e Serviços (Federal)
    // --- Fim ---

    public Servico() {
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

    public String getCodigoInterno() {
        return codigoInterno;
    }

    public void setCodigoInterno(String codigoInterno) {
        this.codigoInterno = codigoInterno;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public ServicoStatus getStatus() {
        return status;
    }

    public void setStatus(ServicoStatus status) {
        this.status = status;
    }

    public String getCodigoServicoLc116() {
        return codigoServicoLc116;
    }

    public void setCodigoServicoLc116(String codigoServicoLc116) {
        this.codigoServicoLc116 = codigoServicoLc116;
    }

    public BigDecimal getAliquotaIss() {
        return aliquotaIss;
    }

    public void setAliquotaIss(BigDecimal aliquotaIss) {
        this.aliquotaIss = aliquotaIss;
    }

    public String getCnaeCodigo() {
        return cnaeCodigo;
    }

    public void setCnaeCodigo(String cnaeCodigo) {
        this.cnaeCodigo = cnaeCodigo;
    }

    public String getNbsCodigo() {
        return nbsCodigo;
    }

    public void setNbsCodigo(String nbsCodigo) {
        this.nbsCodigo = nbsCodigo;
    }

    public String getDescricaoNota() {
        return descricaoNota;
    }

    public void setDescricaoNota(String descricaoNota) {
        this.descricaoNota = descricaoNota;
    }

    public BigDecimal getAliquotaIbsPadrao() {
        return aliquotaIbsPadrao;
    }

    public void setAliquotaIbsPadrao(BigDecimal aliquotaIbsPadrao) {
        this.aliquotaIbsPadrao = aliquotaIbsPadrao;
    }

    public BigDecimal getAliquotaCbsPadrao() {
        return aliquotaCbsPadrao;
    }

    public void setAliquotaCbsPadrao(BigDecimal aliquotaCbsPadrao) {
        this.aliquotaCbsPadrao = aliquotaCbsPadrao;
    }
}
