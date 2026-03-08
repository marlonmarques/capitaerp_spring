
package com.erp.capitalerp.application.usuarios.dto;

import java.util.HashSet;
import java.util.Set;

import com.erp.capitalerp.application.cadastros.dto.FilialDTO;
import com.erp.capitalerp.domain.usuarios.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UserDTO {

    private Long id;

    @NotBlank(message = "Campo requerido")
    private String firstName;
    private String lastName;

    @Email(message = "Digite um email válido")
    private String email;

    Set<RoleDTO> roles = new HashSet<>();
    private java.util.UUID filialId;
    Set<FilialDTO> filiais = new HashSet<>();
    private String password;

    public UserDTO() {
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public UserDTO(Long id, String firstName, String lastName, String email, java.util.UUID filialId) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.filialId = filialId;
    }

    public UserDTO(User x) {
        id = x.getId();
        firstName = x.getFirstName();
        lastName = x.getLastName();
        email = x.getEmail();
        filialId = x.getFilialId();
        x.getRoles().forEach(role -> this.roles.add(new RoleDTO(role)));
        x.getFiliais().forEach(f -> this.filiais.add(new FilialDTO(f)));
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Set<RoleDTO> getRoles() {
        return roles;
    }

    public void setRoles(Set<RoleDTO> roles) {
        this.roles = roles;
    }

    public java.util.UUID getFilialId() {
        return filialId;
    }

    public void setFilialId(java.util.UUID filialId) {
        this.filialId = filialId;
    }

    public Set<FilialDTO> getFiliais() {
        return filiais;
    }

    public void setFiliais(Set<FilialDTO> filiais) {
        this.filiais = filiais;
    }

}
