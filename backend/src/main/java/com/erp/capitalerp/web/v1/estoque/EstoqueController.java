package com.erp.capitalerp.web.v1.estoque;

import com.erp.capitalerp.application.estoque.dto.EstoqueSaldoDTO;
import com.erp.capitalerp.application.estoque.dto.MovimentacaoEstoqueDTO;
import com.erp.capitalerp.infrastructure.persistence.estoque.EstoqueSaldoRepository;
import com.erp.capitalerp.infrastructure.persistence.estoque.MovimentacaoEstoqueRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller centralizado do módulo de Estoque. Expõe saldos consolidados e
 * histórico de movimentações.
 */
@RestController
@RequestMapping("/api/v1/estoque")
public class EstoqueController {

    private final EstoqueSaldoRepository saldoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;

    public EstoqueController(EstoqueSaldoRepository saldoRepository,
            MovimentacaoEstoqueRepository movimentacaoRepository) {
        this.saldoRepository = saldoRepository;
        this.movimentacaoRepository = movimentacaoRepository;
    }

    /**
     * Lista todos os saldos de estoque. Filtros opcionais: localId e/ou produtoId.
     */
    @GetMapping("/saldos")
    public ResponseEntity<List<EstoqueSaldoDTO>> listarSaldos(@RequestParam(required = false) UUID localId,
            @RequestParam(required = false) UUID produtoId) {

        List<EstoqueSaldoDTO> result;

        if (localId != null && produtoId != null) {
            result = saldoRepository.findByLocalEstoqueIdAndProdutoId(localId, produtoId).stream()
                    .map(EstoqueSaldoDTO::new).collect(Collectors.toList());
        } else if (localId != null) {
            result = saldoRepository.findByLocalEstoqueId(localId).stream().map(EstoqueSaldoDTO::new)
                    .collect(Collectors.toList());
        } else if (produtoId != null) {
            result = saldoRepository.findByProdutoId(produtoId).stream().map(EstoqueSaldoDTO::new)
                    .collect(Collectors.toList());
        } else {
            result = saldoRepository.findAll().stream().map(EstoqueSaldoDTO::new).collect(Collectors.toList());
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Lista saldos abaixo do mínimo.
     */
    @GetMapping("/saldos/alertas")
    public ResponseEntity<List<EstoqueSaldoDTO>> listarAbaixoMinimo() {
        List<EstoqueSaldoDTO> result = saldoRepository.findAbaixoMinimo().stream().map(EstoqueSaldoDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /**
     * Lista as últimas movimentações (máximo 200). Filtros opcionais: produtoId
     * e/ou localId.
     */
    @GetMapping("/movimentacoes")
    public ResponseEntity<List<MovimentacaoEstoqueDTO>> listarMovimentacoes(
            @RequestParam(required = false) UUID produtoId, @RequestParam(required = false) UUID localId,
            @RequestParam(defaultValue = "200") int limite) {

        List<MovimentacaoEstoqueDTO> result;

        if (produtoId != null && localId != null) {
            result = movimentacaoRepository.findByProdutoAndLocal(produtoId, localId).stream()
                    .map(MovimentacaoEstoqueDTO::new).collect(Collectors.toList());
        } else if (produtoId != null) {
            result = movimentacaoRepository.findByProdutoIdOrderByCriadoEmDesc(produtoId).stream()
                    .map(MovimentacaoEstoqueDTO::new).collect(Collectors.toList());
        } else if (localId != null) {
            result = movimentacaoRepository.findByLocalEstoqueIdOrLocalDestinoIdOrderByCriadoEmDesc(localId, localId)
                    .stream().map(MovimentacaoEstoqueDTO::new).collect(Collectors.toList());
        } else {
            int cap = Math.min(limite, 500);
            result = movimentacaoRepository.findAllOrderByCriadoEmDesc(PageRequest.of(0, cap)).stream()
                    .map(MovimentacaoEstoqueDTO::new).collect(Collectors.toList());
        }

        return ResponseEntity.ok(result);
    }
}
