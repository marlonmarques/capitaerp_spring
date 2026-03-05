package com.erp.capitalerp.application.clientes.dto;

import com.erp.capitalerp.domain.clientes.EmailCliente;

public class EmailClienteDTO {
    private Long id;
    private String email;
    private Boolean principal;

    public EmailClienteDTO() {
    }

    public EmailClienteDTO(EmailCliente entity) {
        this.id = entity.getId();
        this.email = entity.getEmail();
        this.principal = entity.getPrincipal();
    }

    public EmailClienteDTO(Long id, String email, Boolean principal) {
        this.id = id;
        this.email = email;
        this.principal = principal;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getPrincipal() {
        return principal;
    }

    public void setPrincipal(Boolean principal) {
        this.principal = principal;
    }
}
