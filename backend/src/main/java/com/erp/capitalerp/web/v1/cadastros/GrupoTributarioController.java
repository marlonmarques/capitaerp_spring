package com.erp.capitalerp.web.v1.cadastros;

import com.erp.capitalerp.application.cadastros.GrupoTributarioService;
import com.erp.capitalerp.application.cadastros.dto.GrupoTributarioDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/grupos-tributarios")
public class GrupoTributarioController {

    private final GrupoTributarioService service;

    public GrupoTributarioController(GrupoTributarioService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<GrupoTributarioDTO>> findAll(
            @RequestParam(required = false, defaultValue = "false") boolean incluirInativos) {
        List<GrupoTributarioDTO> list = incluirInativos ? service.findAllIncludingInactive() : service.findAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GrupoTributarioDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<GrupoTributarioDTO> insert(@Valid @RequestBody GrupoTributarioDTO dto) {
        GrupoTributarioDTO result = service.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(result.getId()).toUri();
        return ResponseEntity.created(uri).body(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GrupoTributarioDTO> update(@PathVariable UUID id,
            @Valid @RequestBody GrupoTributarioDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
