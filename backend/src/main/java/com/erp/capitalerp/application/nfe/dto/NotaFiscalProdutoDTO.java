package com.erp.capitalerp.application.nfe.dto;

import com.erp.capitalerp.domain.nfe.ModeloNFe;
import com.erp.capitalerp.domain.nfe.StatusNFe;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record NotaFiscalProdutoDTO(
    UUID id,
    UUID filialId,
    ModeloNFe modelo,
    Integer numero,
    String serie,
    StatusNFe status,
    Long clienteId,
    String chaveNfe,
    LocalDateTime dataEmissao,
    BigDecimal valorTotalNota,
    List<NotaFiscalProdutoItemDTO> itens,
    List<NotaFiscalProdutoPagamentoDTO> pagamentos
) {
    public record NotaFiscalProdutoItemDTO(
        UUID id,
        UUID produtoId,
        String codigoProduto,
        String descricao,
        String ncm,
        String cfop,
        BigDecimal quantidade,
        BigDecimal valorUnitario,
        BigDecimal valorBruto,
        BigDecimal valorLiquido
    ) {}

    public record NotaFiscalProdutoPagamentoDTO(
        UUID id,
        String tipoPagamento,
        BigDecimal valorPagamento
    ) {}
}
