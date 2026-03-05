package com.erp.capitalerp.application.nfse.dto;

import com.erp.capitalerp.domain.nfse.ConfiguracaoNfe;

import java.util.UUID;

public record ConfiguracaoNfeDTO(UUID id, Boolean ativarNfe, Integer serie, Integer numeroNfe, UUID categoriaId,
        String infoComplementarPadrao, String cfopPadrao, String naturezaOperacaoPadrao, UUID contaBancariaId,
        String ambiente, Boolean enviarEmail, String assuntoEmail, String mensagemEmail) {
    public ConfiguracaoNfeDTO(ConfiguracaoNfe c) {
        this(c.getId(), c.getAtivarNfe(), c.getSerie(), c.getNumeroNfe(), c.getCategoriaId(),
                c.getInfoComplementarPadrao(), c.getCfopPadrao(), c.getNaturezaOperacaoPadrao(), c.getContaBancariaId(),
                c.getAmbiente(), c.getEnviarEmail(), c.getAssuntoEmail(), c.getMensagemEmail());
    }
}
