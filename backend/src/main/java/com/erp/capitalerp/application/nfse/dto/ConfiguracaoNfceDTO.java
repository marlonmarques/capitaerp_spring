package com.erp.capitalerp.application.nfse.dto;

import java.util.UUID;

public record ConfiguracaoNfceDTO(UUID id, Boolean ativarNfce, Integer serie, Integer numeroNfce, UUID categoriaId,
        String infoComplementarPadrao, String cfopPadrao, UUID contaBancariaId, String ambiente, Boolean enviarEmail,
        String assuntoEmail, String mensagemEmail, String idCsc, String csc) {
}
