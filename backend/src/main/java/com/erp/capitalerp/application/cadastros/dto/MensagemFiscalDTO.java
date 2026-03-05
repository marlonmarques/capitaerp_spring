package com.erp.capitalerp.application.cadastros.dto;

import com.erp.capitalerp.domain.fiscal.DestinoMensagemEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.UUID;

public class MensagemFiscalDTO implements Serializable {

    private UUID id;

    @NotBlank(message = "O nome ou título da mensagem é obrigatório")
    private String titulo;

    @NotNull(message = "O destino da mensagem (Fisco ou Contribuinte) é obrigatório")
    private DestinoMensagemEnum destino;

    @NotBlank(message = "O corpo do texto/mensagem fiscal é obrigatório")
    private String textoTemplate;

    public MensagemFiscalDTO() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public DestinoMensagemEnum getDestino() {
        return destino;
    }

    public void setDestino(DestinoMensagemEnum destino) {
        this.destino = destino;
    }

    public String getTextoTemplate() {
        return textoTemplate;
    }

    public void setTextoTemplate(String textoTemplate) {
        this.textoTemplate = textoTemplate;
    }
}
