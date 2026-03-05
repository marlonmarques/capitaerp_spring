package com.erp.capitalerp.domain.financeiro;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Where;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "contas_bancarias")
@Where(clause = "excluido = false")
public class ContaBancaria {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private BancoEnum codigoBanco;

    @Column(length = 20)
    private String agencia;

    @Column(length = 30)
    private String numeroConta;

    @Column(length = 20)
    private String carteira;

    @Column(length = 50)
    private String convenio;

    @Column(length = 50)
    private String contrato;

    @Column(length = 20)
    private String tipoCarteira;

    @Column(length = 150)
    private String instrucoesBoleto1;

    @Column(length = 150)
    private String instrucoesBoleto2;

    @Column(length = 150)
    private String instrucoesBoleto3;

    @Column(precision = 10, scale = 4)
    private BigDecimal taxaMora;

    @Column(precision = 10, scale = 4)
    private BigDecimal taxaMulta;

    @Column(precision = 19, scale = 4)
    private BigDecimal saldoInicial = BigDecimal.ZERO;

    private Boolean viaApi = false;

    @Column(length = 255)
    private String tokenApi;

    @Column(length = 20)
    private String telefone;

    private Boolean padrao = false;

    private Boolean ativo = true;

    private Boolean excluido = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
        atualizadoEm = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public BancoEnum getCodigoBanco() {
        return codigoBanco;
    }

    public void setCodigoBanco(BancoEnum codigoBanco) {
        this.codigoBanco = codigoBanco;
    }

    public String getAgencia() {
        return agencia;
    }

    public void setAgencia(String agencia) {
        this.agencia = agencia;
    }

    public String getNumeroConta() {
        return numeroConta;
    }

    public void setNumeroConta(String numeroConta) {
        this.numeroConta = numeroConta;
    }

    public String getCarteira() {
        return carteira;
    }

    public void setCarteira(String carteira) {
        this.carteira = carteira;
    }

    public String getConvenio() {
        return convenio;
    }

    public void setConvenio(String convenio) {
        this.convenio = convenio;
    }

    public String getContrato() {
        return contrato;
    }

    public void setContrato(String contrato) {
        this.contrato = contrato;
    }

    public String getTipoCarteira() {
        return tipoCarteira;
    }

    public void setTipoCarteira(String tipoCarteira) {
        this.tipoCarteira = tipoCarteira;
    }

    public String getInstrucoesBoleto1() {
        return instrucoesBoleto1;
    }

    public void setInstrucoesBoleto1(String instrucoesBoleto1) {
        this.instrucoesBoleto1 = instrucoesBoleto1;
    }

    public String getInstrucoesBoleto2() {
        return instrucoesBoleto2;
    }

    public void setInstrucoesBoleto2(String instrucoesBoleto2) {
        this.instrucoesBoleto2 = instrucoesBoleto2;
    }

    public String getInstrucoesBoleto3() {
        return instrucoesBoleto3;
    }

    public void setInstrucoesBoleto3(String instrucoesBoleto3) {
        this.instrucoesBoleto3 = instrucoesBoleto3;
    }

    public BigDecimal getTaxaMora() {
        return taxaMora;
    }

    public void setTaxaMora(BigDecimal taxaMora) {
        this.taxaMora = taxaMora;
    }

    public BigDecimal getTaxaMulta() {
        return taxaMulta;
    }

    public void setTaxaMulta(BigDecimal taxaMulta) {
        this.taxaMulta = taxaMulta;
    }

    public BigDecimal getSaldoInicial() {
        return saldoInicial;
    }

    public void setSaldoInicial(BigDecimal saldoInicial) {
        this.saldoInicial = saldoInicial;
    }

    public Boolean getViaApi() {
        return viaApi;
    }

    public void setViaApi(Boolean viaApi) {
        this.viaApi = viaApi;
    }

    public String getTokenApi() {
        return tokenApi;
    }

    public void setTokenApi(String tokenApi) {
        this.tokenApi = tokenApi;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public Boolean getPadrao() {
        return padrao;
    }

    public void setPadrao(Boolean padrao) {
        this.padrao = padrao;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Boolean getExcluido() {
        return excluido;
    }

    public void setExcluido(Boolean excluido) {
        this.excluido = excluido;
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
}
