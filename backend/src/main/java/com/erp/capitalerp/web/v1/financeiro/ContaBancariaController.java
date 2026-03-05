package com.erp.capitalerp.web.v1.financeiro;

import com.erp.capitalerp.application.financeiro.ContaBancariaDTO;
import com.erp.capitalerp.application.financeiro.ContaBancariaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/contas-bancarias")
@CrossOrigin(origins = "*") // Para Angular UI
public class ContaBancariaController {

    private final ContaBancariaService service;

    public ContaBancariaController(ContaBancariaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ContaBancariaDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContaBancariaDTO> findById(@PathVariable String id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<ContaBancariaDTO> insert(@Valid @RequestBody ContaBancariaDTO dto) {
        ContaBancariaDTO savedDto = service.insert(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContaBancariaDTO> update(@PathVariable String id, @Valid @RequestBody ContaBancariaDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
