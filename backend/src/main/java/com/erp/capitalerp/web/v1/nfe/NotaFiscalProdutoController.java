package com.erp.capitalerp.web.v1.nfe;

import com.erp.capitalerp.application.nfe.NfeDashboardDTO;
import com.erp.capitalerp.application.nfe.NfeEventPublisher;
import com.erp.capitalerp.application.nfe.NotaFiscalProdutoService;
import com.erp.capitalerp.application.nfe.dto.NfeListItemDTO;
import com.erp.capitalerp.domain.nfe.NotaFiscalProduto;
import com.erp.capitalerp.domain.nfe.StatusNFe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.http.MediaType;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/nfe")
public class NotaFiscalProdutoController {

    private final NotaFiscalProdutoService service;
    private final NfeEventPublisher eventPublisher;

    public NotaFiscalProdutoController(NotaFiscalProdutoService service, NfeEventPublisher eventPublisher) {
        this.service = service;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping(value = "/{id}/eventos", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEventos(@PathVariable UUID id) {
        return eventPublisher.criar(id);
    }

    @GetMapping("/resumo")
    public ResponseEntity<NfeDashboardDTO> obterResumo() {
        return ResponseEntity.ok(service.obterResumo());
    }

    @GetMapping
    public ResponseEntity<Page<NfeListItemDTO>> listar(@RequestParam(required = false) String busca,
            @RequestParam(required = false) String status, Pageable pageable) {

        StatusNFe statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = StatusNFe.valueOf(status);
            } catch (Exception ignored) {
            }
        }

        return ResponseEntity.ok(service.listar(busca, statusEnum, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotaFiscalProduto> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<NotaFiscalProduto> salvar(@RequestBody NotaFiscalProduto nota) {
        return ResponseEntity.ok(service.salvar(nota));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/emitir")
    public ResponseEntity<Void> emitir(@PathVariable UUID id) {
        service.emitir(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/consultar")
    public ResponseEntity<Void> consultar(@PathVariable UUID id) {
        service.consultar(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelar(@PathVariable UUID id, @RequestBody String justificativa) {
        service.cancelar(id, justificativa);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cce")
    public ResponseEntity<Void> cartaCorrecao(@PathVariable UUID id, @RequestBody String texto) {
        service.cartaCorrecao(id, texto);
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/{id}/imprimir", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> imprimir(@PathVariable UUID id) {
        byte[] pdf = service.imprimirDanfe(id);
        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=danfe-" + id + ".pdf")
                .body(pdf);
    }
}
