package com.erp.capitalerp.web.v1.cadastros;

import com.erp.capitalerp.application.cadastros.MensagemFiscalService;
import com.erp.capitalerp.application.cadastros.dto.MensagemFiscalDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mensagens-fiscais")
public class MensagemFiscalController {

    private final MensagemFiscalService service;

    public MensagemFiscalController(MensagemFiscalService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<MensagemFiscalDTO>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MensagemFiscalDTO> buscarPorId(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<MensagemFiscalDTO> criar(@RequestBody @Valid MensagemFiscalDTO dto) {
        MensagemFiscalDTO criado = service.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MensagemFiscalDTO> atualizar(@PathVariable java.util.UUID id,
            @RequestBody @Valid MensagemFiscalDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable java.util.UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
