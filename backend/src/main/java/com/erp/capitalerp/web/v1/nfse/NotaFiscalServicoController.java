package com.erp.capitalerp.web.v1.nfse;

import com.erp.capitalerp.application.nfse.NfseEventPublisher;
import com.erp.capitalerp.application.nfse.NotaFiscalServicoService;
import com.erp.capitalerp.application.nfse.dto.NotaFiscalServicoDTO;
import com.erp.capitalerp.domain.nfse.FilaEmissaoNfse;
import com.erp.capitalerp.infrastructure.persistence.nfse.FilaEmissaoRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.UUID;

/**
 * REST Controller para NFS-e. Base path: /api/v1/nfse
 */
@RestController
@RequestMapping("/api/v1/nfse")
public class NotaFiscalServicoController {

    private final NotaFiscalServicoService service;
    private final NfseEventPublisher eventPublisher;
    private final FilaEmissaoRepository filaRepository;

    public NotaFiscalServicoController(NotaFiscalServicoService service, NfseEventPublisher eventPublisher,
            FilaEmissaoRepository filaRepository) {
        this.service = service;
        this.eventPublisher = eventPublisher;
        this.filaRepository = filaRepository;
    }

    // ─── Listagem / Busca ──────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<Page<NotaFiscalServicoDTO>> listar(@RequestParam(required = false) String busca,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "criadoEm", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(service.listar(busca, status, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<NotaFiscalServicoDTO> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<NotaFiscalServicoDTO> criar(@Valid @RequestBody NotaFiscalServicoDTO dto) {
        return ResponseEntity.status(201).body(service.salvar(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<NotaFiscalServicoDTO> atualizar(@PathVariable UUID id,
            @RequestBody NotaFiscalServicoDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Operações Fiscais ─────────────────────────────────────────────────────

    /**
     * Emite a NFS-e no ACBr Microserviço. POST /api/v1/nfse/{id}/emitir
     */
    @PostMapping("/{id}/emitir")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<NotaFiscalServicoDTO> emitir(@PathVariable UUID id) {
        return ResponseEntity.ok(service.emitir(id));
    }

    /**
     * Consulta o status da NFS-e na prefeitura (útil para notas PROCESSANDO). POST
     * /api/v1/nfse/{id}/consultar
     */
    @PostMapping("/{id}/consultar")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<NotaFiscalServicoDTO> consultar(@PathVariable UUID id) {
        return ResponseEntity.ok(service.consultar(id));
    }

    /**
     * Cancela a NFS-e na prefeitura. POST /api/v1/nfse/{id}/cancelar Body: {
     * "motivo": "...", "codigo": "1" }
     */
    @PostMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<NotaFiscalServicoDTO> cancelar(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String motivo = body.getOrDefault("motivo", "Erro na emissão");
        String codigo = body.getOrDefault("codigo", "1");
        return ResponseEntity.ok(service.cancelar(id, motivo, codigo));
    }

    // ─── SSE — Feedback em Tempo Real ──────────────────────────────────────────

    /**
     * Abre uma conexão SSE para receber eventos em tempo real da emissão.
     *
     * <p>
     * O Angular deve abrir esta conexão logo após chamar {@code POST /{id}/emitir}.
     * Os eventos recebidos serão:
     * <ul>
     * <li>{@code log} — mensagens de progresso ("Conectando ao ACBr...")</li>
     * <li>{@code alerta} — tentativa falhou, reagendando</li>
     * <li>{@code autorizada} — NFS-e autorizada (evento final, fecha conexão)</li>
     * <li>{@code rejeitada} — NFS-e rejeitada definitivamente (evento final)</li>
     * </ul>
     *
     * GET /api/v1/nfse/{id}/eventos
     */
    @GetMapping(value = "/{id}/eventos", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public SseEmitter streamEventos(@PathVariable UUID id) {
        return eventPublisher.criar(id);
    }

    /**
     * Retorna o histórico de jobs da fila para uma NFS-e específica. Útil para
     * debug e auditoria.
     *
     * GET /api/v1/nfse/{id}/fila
     */
    @GetMapping("/{id}/fila")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<java.util.List<FilaEmissaoNfse>> historicoFila(@PathVariable UUID id) {
        return ResponseEntity.ok(filaRepository.findByNfseIdOrderByCriadoEmDesc(id));
    }
}
