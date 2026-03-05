package com.erp.capitalerp.application.cadastros.dto;

public class CestResultDTO {
    private final String codigo;
    private final String descricao;
    private final String segmento;

    public CestResultDTO(String codigo, String descricao, String segmento) {
        this.codigo = codigo;
        this.descricao = descricao;
        this.segmento = segmento;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getSegmento() {
        return segmento;
    }

    /** Formata como "XXXX.XX.XX - Descrição" */
    public String getLabel() {
        if (codigo == null || codigo.length() < 7)
            return codigo + " - " + descricao;
        // Formata 0100100 → 01.001.00
        return codigo.substring(0, 2) + "." + codigo.substring(2, 5) + "." + codigo.substring(5, 7) + " - " + descricao;
    }
}
