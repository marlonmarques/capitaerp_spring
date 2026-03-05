package com.erp.capitalerp.application.cadastros.dto;

import com.erp.capitalerp.domain.fiscal.GrupoTributario;
import com.erp.capitalerp.domain.fiscal.RegimeTributarioEnum;
import com.erp.capitalerp.domain.fiscal.TipoImpostoEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public class GrupoTributarioDTO {

    private UUID id;

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 120)
    private String nome;

    private String descricao;

    @NotNull(message = "Regime tributário é obrigatório")
    private RegimeTributarioEnum regime;

    @NotNull(message = "Tipo de imposto é obrigatório")
    private TipoImpostoEnum tipoImposto;

    private Boolean ativo = true;

    // ICMS
    private String cstCsosn;
    private BigDecimal aliquotaIcms;
    private BigDecimal reducaoBaseIcms;
    private BigDecimal aliquotaDifal;

    // ICMS ST
    private BigDecimal aliquotaSt;
    private BigDecimal mva;
    private BigDecimal reducaoBaseSt;

    // IPI
    private String cstIpi;
    private BigDecimal aliquotaIpi;

    // PIS
    private String cstPis;
    private BigDecimal aliquotaPis;

    // COFINS
    private String cstCofins;
    private BigDecimal aliquotaCofins;

    // ISS
    private BigDecimal aliquotaIss;
    private Boolean reterIss;

    // CFOP
    private String cfopSaida;
    private String cfopEntrada;

    // Reforma Tributária (EC 132/2023)
    private BigDecimal aliquotaIbs;
    private BigDecimal aliquotaCbs;
    private BigDecimal aliquotaIs;
    private String codigoIs;
    private String regimeEspecialReforma;

    // Timestamps
    private String criadoEm;
    private String atualizadoEm;

    public GrupoTributarioDTO() {
    }

    /** Conversão de Entity → DTO */
    public GrupoTributarioDTO(GrupoTributario e) {
        this.id = e.getId();
        this.nome = e.getNome();
        this.descricao = e.getDescricao();
        this.regime = e.getRegime();
        this.tipoImposto = e.getTipoImposto();
        this.ativo = e.getAtivo();
        this.cstCsosn = e.getCstCsosn();
        this.aliquotaIcms = e.getAliquotaIcms();
        this.reducaoBaseIcms = e.getReducaoBaseIcms();
        this.aliquotaDifal = e.getAliquotaDifal();
        this.aliquotaSt = e.getAliquotaSt();
        this.mva = e.getMva();
        this.reducaoBaseSt = e.getReducaoBaseSt();
        this.cstIpi = e.getCstIpi();
        this.aliquotaIpi = e.getAliquotaIpi();
        this.cstPis = e.getCstPis();
        this.aliquotaPis = e.getAliquotaPis();
        this.cstCofins = e.getCstCofins();
        this.aliquotaCofins = e.getAliquotaCofins();
        this.aliquotaIss = e.getAliquotaIss();
        this.reterIss = e.getReterIss();
        this.cfopSaida = e.getCfopSaida();
        this.cfopEntrada = e.getCfopEntrada();
        this.aliquotaIbs = e.getAliquotaIbs();
        this.aliquotaCbs = e.getAliquotaCbs();
        this.aliquotaIs = e.getAliquotaIs();
        this.codigoIs = e.getCodigoIs();
        this.regimeEspecialReforma = e.getRegimeEspecialReforma();
        this.criadoEm = e.getCriadoEm() != null ? e.getCriadoEm().toString() : null;
        this.atualizadoEm = e.getAtualizadoEm() != null ? e.getAtualizadoEm().toString() : null;
    }

    // ─── Getters & Setters ────────────────────────────────────────────────────

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

    public String getCriadoEm() {
        return criadoEm;
    }

    public String getAtualizadoEm() {
        return atualizadoEm;
    }
}
