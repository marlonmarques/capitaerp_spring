package com.erp.capitalerp.web.v1.servicos;

import com.erp.capitalerp.application.servicos.ServicoService;
import com.erp.capitalerp.application.servicos.dto.ServicoDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/servicos")
public class ServicoController {

    private final ServicoService servicoService;

    public ServicoController(ServicoService servicoService) {
        this.servicoService = servicoService;
    }

    @GetMapping
    public ResponseEntity<Page<ServicoDTO>> listar(@RequestParam(required = false) String busca, Pageable pageable) {
        Page<ServicoDTO> page = servicoService.listar(busca, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<ServicoDTO> buscarPorId(@PathVariable UUID id) {
        ServicoDTO dto = servicoService.buscarPorId(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<ServicoDTO> criar(@RequestBody ServicoDTO dto) {
        ServicoDTO criado = servicoService.criar(dto);
        return ResponseEntity.ok(criado);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<ServicoDTO> atualizar(@PathVariable UUID id, @RequestBody ServicoDTO dto) {
        ServicoDTO atualizado = servicoService.atualizar(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        servicoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
