package com.erp.capitalerp.domain.fiscal;

import com.erp.capitalerp.domain.shared.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "mensagens_fiscais")
public class MensagemFiscal extends BaseEntity {

    @Column(nullable = false)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DestinoMensagemEnum destino;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String textoTemplate;

    public MensagemFiscal() {
    }

    public MensagemFiscal(String titulo, DestinoMensagemEnum destino, String textoTemplate) {
        this.titulo = titulo;
        this.destino = destino;
        this.textoTemplate = textoTemplate;
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
