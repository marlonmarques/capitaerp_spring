package com.erp.capitalerp.domain.fiscal;

import com.erp.capitalerp.domain.shared.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posicoes_fiscais")
public class PosicaoFiscal extends BaseEntity {

    @Column(nullable = false)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoNotaEnum tipoNota;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FinalidadeEnum finalidade;

    @Column(nullable = false)
    private Boolean consumidorFinal;

    @Column(length = 255)
    private String tipoOperacao; // 0-Não se Aplica, 1-Operação presencial, etc.

    @Column(length = 255)
    private String operacaoDestino; // 1-Operação interna, 2-Operação interestadual, 3-Exterior

    // Salvando o Código CFOP (String) que está no banco compartilhado de Tabelas
    // Fiscais.
    @Column(length = 10)
    private String cfopPadraoCodigo;

    // Relacionamento com as Mensagens Fiscais reutilizáveis
    @ManyToMany
    @JoinTable(name = "posicao_fiscal_mensagens", joinColumns = @JoinColumn(name = "posicao_fiscal_id"), inverseJoinColumns = @JoinColumn(name = "mensagem_fiscal_id"))
    private List<MensagemFiscal> mensagens = new ArrayList<>();

    public PosicaoFiscal() {
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public TipoNotaEnum getTipoNota() {
        return tipoNota;
    }

    public void setTipoNota(TipoNotaEnum tipoNota) {
        this.tipoNota = tipoNota;
    }

    public FinalidadeEnum getFinalidade() {
        return finalidade;
    }

    public void setFinalidade(FinalidadeEnum finalidade) {
        this.finalidade = finalidade;
    }

    public Boolean getConsumidorFinal() {
        return consumidorFinal;
    }

    public void setConsumidorFinal(Boolean consumidorFinal) {
        this.consumidorFinal = consumidorFinal;
    }

    public String getTipoOperacao() {
        return tipoOperacao;
    }

    public void setTipoOperacao(String tipoOperacao) {
        this.tipoOperacao = tipoOperacao;
    }

    public String getOperacaoDestino() {
        return operacaoDestino;
    }

    public void setOperacaoDestino(String operacaoDestino) {
        this.operacaoDestino = operacaoDestino;
    }

    public String getCfopPadraoCodigo() {
        return cfopPadraoCodigo;
    }

    public void setCfopPadraoCodigo(String cfopPadraoCodigo) {
        this.cfopPadraoCodigo = cfopPadraoCodigo;
    }

    public List<MensagemFiscal> getMensagens() {
        return mensagens;
    }

    public void setMensagens(List<MensagemFiscal> mensagens) {
        this.mensagens = mensagens;
    }
}
