package com.erp.capitalerp.application.cadastros.dto;

import com.erp.capitalerp.domain.cadastros.Empresa;
import java.util.UUID;

public record EmpresaDTO(UUID id, String tenantIdentifier, String razaoSocial, String nomeFantasia, String cnpj,
        String telefone, String email, String logoUrl) {
    public EmpresaDTO(Empresa entity) {
        this(entity.getId(), entity.getTenantIdentifier(), entity.getRazaoSocial(), entity.getNomeFantasia(),
                entity.getCnpj(), entity.getTelefone(), entity.getEmail(), entity.getLogoUrl());
    }
}
