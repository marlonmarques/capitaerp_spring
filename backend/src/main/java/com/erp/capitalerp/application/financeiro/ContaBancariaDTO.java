package com.erp.capitalerp.application.financeiro;

import com.erp.capitalerp.domain.financeiro.BancoEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ContaBancariaDTO(String id, @NotBlank(message = "O nome da conta é obrigatório") String nome,
        @NotNull(message = "O Banco/Instituição é obrigatório") BancoEnum codigoBanco, String agencia,
        String numeroConta, String carteira, String convenio, String contrato, String tipoCarteira,
        String instrucoesBoleto1, String instrucoesBoleto2, String instrucoesBoleto3, BigDecimal taxaMora,
        BigDecimal taxaMulta, BigDecimal saldoInicial, Boolean viaApi, String tokenApi, String telefone, Boolean padrao,
        Boolean ativo, LocalDateTime criadoEm, LocalDateTime atualizadoEm) {
}
