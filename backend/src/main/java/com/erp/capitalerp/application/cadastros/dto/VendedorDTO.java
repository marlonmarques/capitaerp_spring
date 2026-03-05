package com.erp.capitalerp.application.cadastros.dto;

import com.erp.capitalerp.domain.cadastros.Vendedor;
import java.math.BigDecimal;
import java.util.UUID;

public record VendedorDTO(UUID id, String nome, String cpfCnpj, String telefone, String email,
        BigDecimal percentualComissao, Boolean ativo, Long usuarioId) {
    public VendedorDTO(Vendedor entity) {
        this(entity.getId(), entity.getNome(), entity.getCpfCnpj(), entity.getTelefone(), entity.getEmail(),
                entity.getPercentualComissao(), entity.getAtivo(),
                entity.getUsuario() != null ? entity.getUsuario().getId() : null);
    }
}
