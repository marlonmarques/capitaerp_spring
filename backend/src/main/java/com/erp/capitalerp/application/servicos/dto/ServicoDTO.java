package com.erp.capitalerp.application.servicos.dto;

import com.erp.capitalerp.domain.servico.Servico;
import com.erp.capitalerp.domain.servico.ServicoStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record ServicoDTO(UUID id, String nome, String descricao, String codigoInterno, BigDecimal preco,
        ServicoStatus status, String codigoServicoLc116, BigDecimal aliquotaIss, String cnaeCodigo, String nbsCodigo,
        String descricaoNota, BigDecimal aliquotaIbsPadrao, BigDecimal aliquotaCbsPadrao) {

    public ServicoDTO(Servico entity) {
        this(entity.getId(), entity.getNome(), entity.getDescricao(), entity.getCodigoInterno(), entity.getPreco(),
                entity.getStatus(), entity.getCodigoServicoLc116(), entity.getAliquotaIss(), entity.getCnaeCodigo(),
                entity.getNbsCodigo(), entity.getDescricaoNota(), entity.getAliquotaIbsPadrao(),
                entity.getAliquotaCbsPadrao());
    }
}
