package com.erp.capitalerp.web.v1.estoque;

import com.erp.capitalerp.application.estoque.EstoqueService;
import com.erp.capitalerp.application.estoque.ProdutoService;
import com.erp.capitalerp.application.estoque.dto.ProdutoAbaixoMinimoResponse;
import com.erp.capitalerp.application.estoque.dto.ProdutoDTO;
import com.erp.capitalerp.application.estoque.dto.ProdutoVariacaoDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;
    private final EstoqueService estoqueService;

    public ProdutoController(ProdutoService produtoService, EstoqueService estoqueService) {
        this.produtoService = produtoService;
        this.estoqueService = estoqueService;
    }

    // ─── CRUD Produto ─────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Page<ProdutoDTO>> listar(@RequestParam(required = false) String busca,
            @RequestParam(required = false) String status, Pageable pageable) {
        return ResponseEntity.ok(produtoService.listar(busca, status, pageable));
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<ProdutoDTO>> listarAtivos() {
        return ResponseEntity.ok(produtoService.listarAtivos());
    }

    @GetMapping("/venda")
    public ResponseEntity<List<com.erp.capitalerp.application.estoque.dto.ProdutoBuscaVendaDTO>> buscarParaVenda(
            @RequestParam String busca) {
        return ResponseEntity.ok(produtoService.buscarParaVenda(busca));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ProdutoDTO> inserir(@RequestBody ProdutoDTO dto) {
        ProdutoDTO criado = produtoService.inserir(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(criado.id()).toUri();
        return ResponseEntity.created(uri).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoDTO> atualizar(@PathVariable UUID id, @RequestBody ProdutoDTO dto) {
        return ResponseEntity.ok(produtoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        produtoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    /** Toggle rápido de favorito — usado pela listagem de produtos e PDV. */
    @PatchMapping("/{id}/favorito")
    public ResponseEntity<ProdutoDTO> toggleFavorito(@PathVariable UUID id) {
        return ResponseEntity.ok(produtoService.toggleFavorito(id));
    }

    // ─── Estoque ──────────────────────────────────────────────────────────────

    @GetMapping("/estoque-baixo")
    public ResponseEntity<List<ProdutoAbaixoMinimoResponse>> buscarEstoqueBaixo() {
        return ResponseEntity.ok(estoqueService.buscarAbaixoMinimo());
    }

    @PostMapping("/{id}/entrada")
    public ResponseEntity<Void> darEntrada(@PathVariable UUID id, @RequestParam int quantidade,
            @RequestParam(required = false) UUID variacaoId, @RequestParam(required = false) UUID localEstoqueId,
            @RequestParam(required = false) String referenciaId,
            @RequestParam(required = false) String referenciaTipo) {
        estoqueService.darEntrada(id, variacaoId, localEstoqueId, quantidade, referenciaId, referenciaTipo);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/baixa")
    public ResponseEntity<Void> darBaixa(@PathVariable UUID id, @RequestParam int quantidade,
            @RequestParam(required = false) UUID variacaoId, @RequestParam(required = false) UUID localEstoqueId,
            @RequestParam(required = false) String referenciaId,
            @RequestParam(required = false) String referenciaTipo) {
        estoqueService.darBaixa(id, variacaoId, localEstoqueId, quantidade, referenciaId, referenciaTipo);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/transferencia")
    public ResponseEntity<Void> transferir(@PathVariable UUID id, @RequestParam int quantidade,
            @RequestParam UUID origemId, @RequestParam UUID destinoId, @RequestParam(required = false) UUID variacaoId,
            @RequestParam(required = false) String motivo) {
        estoqueService.transferir(id, variacaoId, origemId, destinoId, quantidade, motivo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/movimentacoes")
    public ResponseEntity<List<com.erp.capitalerp.application.estoque.dto.MovimentacaoEstoqueDTO>> listarMovimentacoes(
            @PathVariable UUID id) {
        return ResponseEntity.ok(estoqueService.listarMovimentacoes(id));
    }

    // ─── Variações ────────────────────────────────────────────────────────────

    @GetMapping("/{id}/variacoes")
    public ResponseEntity<List<ProdutoVariacaoDTO>> listarVariacoes(@PathVariable UUID id) {
        return ResponseEntity.ok(produtoService.listarVariacoes(id));
    }

    @PostMapping("/{id}/variacoes")
    public ResponseEntity<ProdutoVariacaoDTO> adicionarVariacao(@PathVariable UUID id,
            @RequestBody ProdutoVariacaoDTO dto) {
        ProdutoVariacaoDTO criada = produtoService.adicionarVariacao(id, dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{variacaoId}").buildAndExpand(criada.id())
                .toUri();
        return ResponseEntity.created(uri).body(criada);
    }

    @PutMapping("/{id}/variacoes/{variacaoId}")
    public ResponseEntity<ProdutoVariacaoDTO> atualizarVariacao(@PathVariable UUID id, @PathVariable UUID variacaoId,
            @RequestBody ProdutoVariacaoDTO dto) {
        return ResponseEntity.ok(produtoService.atualizarVariacao(id, variacaoId, dto));
    }

    @DeleteMapping("/{id}/variacoes/{variacaoId}")
    public ResponseEntity<Void> excluirVariacao(@PathVariable UUID id, @PathVariable UUID variacaoId) {
        produtoService.excluirVariacao(id, variacaoId);
        return ResponseEntity.noContent().build();
    }
}
