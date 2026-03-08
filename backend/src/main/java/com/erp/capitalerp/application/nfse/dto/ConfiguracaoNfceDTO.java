package com.erp.capitalerp.application.nfse.dto;

import com.erp.capitalerp.domain.nfse.ConfiguracaoNfce;
import java.util.UUID;

public record ConfiguracaoNfceDTO(UUID id, UUID filialId, Boolean ativarNfce, Integer serie, Integer numeroNfce, UUID categoriaId,
        String infoComplementarPadrao, String cfopPadrao, UUID contaBancariaId, String ambiente, Boolean enviarEmail,
        String assuntoEmail, String mensagemEmail, String idCsc, String csc) {
    
    public ConfiguracaoNfceDTO(ConfiguracaoNfce c) {
        this(c.getId(), c.getFilialId(), c.getAtivarNfce(), c.getSerie(), c.getNumeroNfce(), c.getCategoriaId(),
                c.getInfoComplementarPadrao(), c.getCfopPadrao(), c.getContaBancariaId(), c.getAmbiente(), c.getEnviarEmail(),
                c.getAssuntoEmail(), c.getMensagemEmail(), c.getIdCsc(), c.getCsc());
    }
}
