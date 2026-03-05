package com.erp.capitalerp.web.v1.cadastros;

import com.erp.capitalerp.application.cadastros.VendedorService;
import com.erp.capitalerp.application.cadastros.dto.VendedorDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/vendedores")
public class VendedorController {

    private final VendedorService service;

    public VendedorController(VendedorService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Page<VendedorDTO>> findAll(@RequestParam(value = "nome", required = false) String nome,
            @RequestParam(value = "ativo", required = false) Boolean ativo, Pageable pageable) {
        Page<VendedorDTO> page = service.pesquisar(nome, ativo, pageable);
        return ResponseEntity.ok().body(page);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<VendedorDTO> findById(@PathVariable UUID id) {
        VendedorDTO dto = service.buscarPorId(id);
        return ResponseEntity.ok().body(dto);
    }

    @PostMapping
    public ResponseEntity<VendedorDTO> insert(@Valid @RequestBody VendedorDTO dto) {
        VendedorDTO novoDto = service.salvar(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(novoDto.id()).toUri();
        return ResponseEntity.created(uri).body(novoDto);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<VendedorDTO> update(@PathVariable UUID id, @Valid @RequestBody VendedorDTO dto) {
        VendedorDTO updatedDto = service.atualizar(id, dto);
        return ResponseEntity.ok().body(updatedDto);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
