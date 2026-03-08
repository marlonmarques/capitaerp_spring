package com.erp.capitalerp.web.v1.cadastros;

import com.erp.capitalerp.application.cadastros.PdvService;
import com.erp.capitalerp.application.cadastros.dto.PdvDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pdvs")
public class PdvController {

    private final PdvService service;

    public PdvController(PdvService service) {
        this.service = service;
    }

    @GetMapping("/filial/{filialId}")
    public ResponseEntity<List<PdvDTO>> listarPorFilial(@PathVariable UUID filialId) {
        return ResponseEntity.ok(service.listarPorFilial(filialId));
    }

    @PostMapping
    public ResponseEntity<PdvDTO> criar(@Valid @RequestBody PdvDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PdvDTO> atualizar(@PathVariable String id, @Valid @RequestBody PdvDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }

    @PostMapping("/{id}/proximo-numero")
    public ResponseEntity<Integer> obterProximoNumero(@PathVariable UUID id) {
        return ResponseEntity.ok(service.obterProximoNumero(id));
    }
}
