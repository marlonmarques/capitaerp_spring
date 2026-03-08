package com.erp.capitalerp.application.nfe;

import java.math.BigDecimal;
import java.util.Map;

public record NfeDashboardDTO(
    long total,
    long autorizadas,
    long processando,
    long rejeitadas,
    BigDecimal valorMesAtual,
    BigDecimal valorMesAnterior,
    Map<String, Long> porStatus
) {}
