package com.erp.capitalerp.web.v1.cadastros;

import com.erp.capitalerp.application.cadastros.PosicaoFiscalService;
import com.erp.capitalerp.application.cadastros.dto.PosicaoFiscalDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posicoes-fiscais")
public class PosicaoFiscalController {

    private final PosicaoFiscalService service;

    public PosicaoFiscalController(PosicaoFiscalService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PosicaoFiscalDTO>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PosicaoFiscalDTO> buscarPorId(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PosicaoFiscalDTO> criar(@RequestBody @Valid PosicaoFiscalDTO dto) {
        PosicaoFiscalDTO criado = service.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PosicaoFiscalDTO> atualizar(@PathVariable java.util.UUID id,
            @RequestBody @Valid PosicaoFiscalDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable java.util.UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
