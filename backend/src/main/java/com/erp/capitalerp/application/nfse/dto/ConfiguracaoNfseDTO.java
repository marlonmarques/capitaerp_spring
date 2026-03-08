package com.erp.capitalerp.application.nfse.dto;

import com.erp.capitalerp.domain.nfse.ConfiguracaoNfse;

import java.math.BigDecimal;
import java.util.UUID;

public record ConfiguracaoNfseDTO(UUID id, UUID filialId, Boolean ativarNfse, Integer serie, Integer numeroRps, UUID categoriaId,
        String infoComplementarPadrao, String cnaePadrao, String nbsPadrao, String itemLc116Padrao, BigDecimal aliquotaPadrao,
        UUID contaBancariaId, String ambiente, Boolean enviarEmail, String assuntoEmail, String mensagemEmail) {
    public ConfiguracaoNfseDTO(ConfiguracaoNfse c) {
        this(c.getId(), c.getFilialId(), c.getAtivarNfse(), c.getSerie(), c.getNumeroRps(), c.getCategoriaId(),
                c.getInfoComplementarPadrao(), c.getCnaePadrao(), c.getNbsPadrao(), c.getItemLc116Padrao(), c.getAliquotaPadrao(),
                c.getContaBancariaId(), c.getAmbiente(), c.getEnviarEmail(), c.getAssuntoEmail(), c.getMensagemEmail());
    }
}
