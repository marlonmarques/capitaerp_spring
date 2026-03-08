package com.erp.capitalerp.web.v1.usuarios;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.erp.capitalerp.application.usuarios.dto.RoleDTO;
import com.erp.capitalerp.infrastructure.persistence.usuarios.RoleRepository;

@RestController
@RequestMapping(value = "/api/v1/roles")
public class RoleResource {

    @Autowired
    private RoleRepository repository;

    @GetMapping
    public ResponseEntity<List<RoleDTO>> findAll() {
        List<RoleDTO> list = repository.findAll().stream()
                .map(role -> new RoleDTO(role))
                .collect(Collectors.toList());
        return ResponseEntity.ok().body(list);
    }
}
