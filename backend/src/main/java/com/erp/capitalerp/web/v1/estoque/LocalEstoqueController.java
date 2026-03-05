package com.erp.capitalerp.web.v1.estoque;

import com.erp.capitalerp.domain.estoque.LocalEstoque;
import com.erp.capitalerp.infrastructure.persistence.estoque.LocalEstoqueRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/locais-estoque")
public class LocalEstoqueController {

    private final LocalEstoqueRepository repository;

    public LocalEstoqueController(LocalEstoqueRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<LocalEstoque>> listar() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<LocalEstoque>> listarAtivos() {
        return ResponseEntity.ok(repository.findByAtivoTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocalEstoque> buscarPorId(@PathVariable UUID id) {
        LocalEstoque local = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Local de Estoque não encontrado: " + id));
        return ResponseEntity.ok(local);
    }

    @PostMapping
    public ResponseEntity<LocalEstoque> criar(@RequestBody LocalEstoque dto) {
        LocalEstoque novo = new LocalEstoque(dto.getNome(), dto.getDescricao());
        LocalEstoque salvo = repository.save(novo);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(salvo.getId()).toUri();
        return ResponseEntity.created(uri).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocalEstoque> atualizar(@PathVariable UUID id, @RequestBody LocalEstoque dto) {
        LocalEstoque local = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Local de Estoque não encontrado: " + id));
        local.setNome(dto.getNome());
        local.setDescricao(dto.getDescricao());
        if (dto.getAtivo() != null)
            local.setAtivo(dto.getAtivo());
        return ResponseEntity.ok(repository.save(local));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        LocalEstoque local = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Local de Estoque não encontrado: " + id));
        local.setAtivo(false);
        repository.save(local);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<LocalEstoque> ativar(@PathVariable UUID id) {
        LocalEstoque local = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Local de Estoque não encontrado: " + id));
        local.setAtivo(true);
        return ResponseEntity.ok(repository.save(local));
    }
}
