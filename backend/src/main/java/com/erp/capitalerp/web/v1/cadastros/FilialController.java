package com.erp.capitalerp.web.v1.cadastros;

import com.erp.capitalerp.application.cadastros.FilialService;
import com.erp.capitalerp.application.cadastros.dto.FilialDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/filiais")
public class FilialController {

    private final FilialService service;

    public FilialController(FilialService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<FilialDTO>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @PostMapping
    public ResponseEntity<FilialDTO> criar(@Valid @RequestBody FilialDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FilialDTO> atualizar(@PathVariable String id, @Valid @RequestBody FilialDTO dto) {
        // Validation could be enhanced to check id match
        return ResponseEntity.ok(service.salvar(dto));
    }
}
