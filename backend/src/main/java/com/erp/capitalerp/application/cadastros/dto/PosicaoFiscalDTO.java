package com.erp.capitalerp.application.cadastros.dto;

import com.erp.capitalerp.domain.fiscal.FinalidadeEnum;
import com.erp.capitalerp.domain.fiscal.TipoNotaEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.List;
import java.util.UUID;

public class PosicaoFiscalDTO implements Serializable {

    private UUID id;

    @NotBlank(message = "O nome da posição fiscal é obrigatório")
    private String nome;

    @NotNull(message = "O tipo de nota é obrigatório")
    private TipoNotaEnum tipoNota;

    @NotNull(message = "A finalidade da nota é obrigatória")
    private FinalidadeEnum finalidade;

    @NotNull(message = "A flag de consumidor final é obrigatória")
    private Boolean consumidorFinal;

    private String tipoOperacao;
    private String operacaoDestino;
    private String cfopPadraoCodigo;

    // Apenas os IDs das mensagens selecionadas no formulário (List/Select)
    private List<UUID> mensagensIds;

    public PosicaoFiscalDTO() {
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

    public List<UUID> getMensagensIds() {
        return mensagensIds;
    }

    public void setMensagensIds(List<UUID> mensagensIds) {
        this.mensagensIds = mensagensIds;
    }
}
