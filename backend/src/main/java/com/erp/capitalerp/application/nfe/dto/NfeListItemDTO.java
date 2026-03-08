package com.erp.capitalerp.application.nfe.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record NfeListItemDTO(
    UUID id, 
    Integer numero, 
    String serie, 
    String modelo,
    String naturezaOperacao, 
    String status,
    LocalDateTime dataEmissao, 
    String chaveNfe, 
    String mensagemRetorno, 
    BigDecimal valorTotalNota, 
    String clienteNome,
    String clienteDocumento
) {
}
