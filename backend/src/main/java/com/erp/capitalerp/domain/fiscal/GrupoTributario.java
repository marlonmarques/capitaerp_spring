package com.erp.capitalerp.domain.fiscal;

import com.erp.capitalerp.domain.shared.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Grupo Tributário — centraliza as regras fiscais que serão aplicadas em
 * produtos e serviços na emissão de documentos fiscais (NF-e, NFS-e).
 *
 * Já preparado para a Reforma Tributária (EC 132/2023): - IBS = Imposto sobre
 * Bens e Serviços (substitui ICMS+ISS) - CBS = Contribuição sobre Bens e
 * Serviços (substitui PIS+COFINS) - IS = Imposto Seletivo (cigarros, bebidas
 * alcoólicas, etc.)
 */
@Entity
@Table(name = "grupos_tributarios")
public class GrupoTributario extends BaseEntity {

    // ─── Identificação ────────────────────────────────────────────────────────
    @Column(nullable = false, length = 120)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RegimeTributarioEnum regime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoImpostoEnum tipoImposto;

    @Column(nullable = false)
    private Boolean ativo = true;

    // ─── ICMS ────────────────────────────────────────────────────────────────
    /** CST (regime normal) ou CSOSN (Simples Nacional) */
    @Column(length = 4)
    private String cstCsosn;

    @Column(precision = 7, scale = 4)
    private BigDecimal aliquotaIcms;

    /** % de redução da base de cálculo do ICMS */
    @Column(precision = 7, scale = 4)
    private BigDecimal reducaoBaseIcms;

    /** Alíquota de diferencial de alíquotas (DIFAL) */
    @Column(precision = 7, scale = 4)
    private BigDecimal aliquotaDifal;

    // ─── ICMS ST (Substituição Tributária) ───────────────────────────────────
    @Column(precision = 7, scale = 4)
    private BigDecimal aliquotaSt;

    /** Margem de Valor Agregado (%) */
    @Column(precision = 7, scale = 4)
    private BigDecimal mva;

    @Column(precision = 7, scale = 4)
    private BigDecimal reducaoBaseSt;

    // ─── IPI ─────────────────────────────────────────────────────────────────
    @Column(length = 3)
    private String cstIpi;

    @Column(precision = 7, scale = 4)
    private BigDecimal aliquotaIpi;

    // ─── PIS ─────────────────────────────────────────────────────────────────
    @Column(length = 3)
    private String cstPis;

    @Column(precision = 7, scale = 4)
    private BigDecimal aliquotaPis;

    // ─── COFINS ──────────────────────────────────────────────────────────────
    @Column(length = 3)
    private String cstCofins;

    @Column(precision = 7, scale = 4)
    private BigDecimal aliquotaCofins;

    // ─── ISS (Serviços) ──────────────────────────────────────────────────────
    @Column(precision = 7, scale = 4)
    private BigDecimal aliquotaIss;

    private Boolean reterIss = false;

    // ─── CFOP padrão ─────────────────────────────────────────────────────────
    @Column(length = 6)
    private String cfopSaida;

    @Column(length = 6)
    private String cfopEntrada;

    // ─── REFORMA TRIBUTÁRIA (EC 132/2023) ─────────────────────────────────
    /**
     * IBS — Imposto sobre Bens e Serviços (substitui ICMS + ISS). Alíquota de
     * referência: estadual + municipal. Será válido a partir de 2026.
     */
    @Column(precision = 7, scale = 4)
    private BigDecimal aliquotaIbs;

    /**
     * CBS — Contribuição sobre Bens e Serviços (substitui PIS + COFINS). Alíquota
     * de referência federal. Será válido a partir de 2026.
     */
    @Column(precision = 7, scale = 4)
    private BigDecimal aliquotaCbs;

    /**
     * IS — Imposto Seletivo (extrafiscal, incide sobre produtos prejudiciais). Ex:
     * cigarros, bebidas alcoólicas, veículos de luxo etc.
     */
    @Column(precision = 7, scale = 4)
    private BigDecimal aliquotaIs;

    /** Código do bem/serviço para fins do Imposto Seletivo */
    @Column(length = 10)
    private String codigoIs;

    /** Regime especial no contexto do IBS/CBS (diferenciado, monofásico, etc.) */
    @Column(length = 50)
    private String regimeEspecialReforma;

    // ─── Getters & Setters ───────────────────────────────────────────────────

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

    public RegimeTributarioEnum getRegime() {
        return regime;
    }

    public void setRegime(RegimeTributarioEnum regime) {
        this.regime = regime;
    }

    public TipoImpostoEnum getTipoImposto() {
        return tipoImposto;
    }

    public void setTipoImposto(TipoImpostoEnum tipoImposto) {
        this.tipoImposto = tipoImposto;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public String getCstCsosn() {
        return cstCsosn;
    }

    public void setCstCsosn(String cstCsosn) {
        this.cstCsosn = cstCsosn;
    }

    public BigDecimal getAliquotaIcms() {
        return aliquotaIcms;
    }

    public void setAliquotaIcms(BigDecimal aliquotaIcms) {
        this.aliquotaIcms = aliquotaIcms;
    }

    public BigDecimal getReducaoBaseIcms() {
        return reducaoBaseIcms;
    }

    public void setReducaoBaseIcms(BigDecimal reducaoBaseIcms) {
        this.reducaoBaseIcms = reducaoBaseIcms;
    }

    public BigDecimal getAliquotaDifal() {
        return aliquotaDifal;
    }

    public void setAliquotaDifal(BigDecimal aliquotaDifal) {
        this.aliquotaDifal = aliquotaDifal;
    }

    public BigDecimal getAliquotaSt() {
        return aliquotaSt;
    }

    public void setAliquotaSt(BigDecimal aliquotaSt) {
        this.aliquotaSt = aliquotaSt;
    }

    public BigDecimal getMva() {
        return mva;
    }

    public void setMva(BigDecimal mva) {
        this.mva = mva;
    }

    public BigDecimal getReducaoBaseSt() {
        return reducaoBaseSt;
    }

    public void setReducaoBaseSt(BigDecimal reducaoBaseSt) {
        this.reducaoBaseSt = reducaoBaseSt;
    }

    public String getCstIpi() {
        return cstIpi;
    }

    public void setCstIpi(String cstIpi) {
        this.cstIpi = cstIpi;
    }

    public BigDecimal getAliquotaIpi() {
        return aliquotaIpi;
    }

    public void setAliquotaIpi(BigDecimal aliquotaIpi) {
        this.aliquotaIpi = aliquotaIpi;
    }

    public String getCstPis() {
        return cstPis;
    }

    public void setCstPis(String cstPis) {
        this.cstPis = cstPis;
    }

    public BigDecimal getAliquotaPis() {
        return aliquotaPis;
    }

    public void setAliquotaPis(BigDecimal aliquotaPis) {
        this.aliquotaPis = aliquotaPis;
    }

    public String getCstCofins() {
        return cstCofins;
    }

    public void setCstCofins(String cstCofins) {
        this.cstCofins = cstCofins;
    }

    public BigDecimal getAliquotaCofins() {
        return aliquotaCofins;
    }

    public void setAliquotaCofins(BigDecimal aliquotaCofins) {
        this.aliquotaCofins = aliquotaCofins;
    }

    public BigDecimal getAliquotaIss() {
        return aliquotaIss;
    }

    public void setAliquotaIss(BigDecimal aliquotaIss) {
        this.aliquotaIss = aliquotaIss;
    }

    public Boolean getReterIss() {
        return reterIss;
    }

    public void setReterIss(Boolean reterIss) {
        this.reterIss = reterIss;
    }

    public String getCfopSaida() {
        return cfopSaida;
    }

    public void setCfopSaida(String cfopSaida) {
        this.cfopSaida = cfopSaida;
    }

    public String getCfopEntrada() {
        return cfopEntrada;
    }

    public void setCfopEntrada(String cfopEntrada) {
        this.cfopEntrada = cfopEntrada;
    }

    public BigDecimal getAliquotaIbs() {
        return aliquotaIbs;
    }

    public void setAliquotaIbs(BigDecimal aliquotaIbs) {
        this.aliquotaIbs = aliquotaIbs;
    }

    public BigDecimal getAliquotaCbs() {
        return aliquotaCbs;
    }

    public void setAliquotaCbs(BigDecimal aliquotaCbs) {
        this.aliquotaCbs = aliquotaCbs;
    }

    public BigDecimal getAliquotaIs() {
        return aliquotaIs;
    }

    public void setAliquotaIs(BigDecimal aliquotaIs) {
        this.aliquotaIs = aliquotaIs;
    }

    public String getCodigoIs() {
        return codigoIs;
    }

    public void setCodigoIs(String codigoIs) {
        this.codigoIs = codigoIs;
    }

    public String getRegimeEspecialReforma() {
        return regimeEspecialReforma;
    }

    public void setRegimeEspecialReforma(String regimeEspecialReforma) {
        this.regimeEspecialReforma = regimeEspecialReforma;
    }
}
