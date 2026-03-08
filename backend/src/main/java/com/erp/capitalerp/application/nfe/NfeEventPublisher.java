package com.erp.capitalerp.application.nfe;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Gerenciador de conexões SSE (Server-Sent Events) para feedback em tempo real da emissão de NF-e.
 */
@Service
public class NfeEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(NfeEventPublisher.class);

    private static final long SSE_TIMEOUT_MS = 5 * 60 * 1_000L;

    private final Map<UUID, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter criar(UUID nfeId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

        emitter.onCompletion(() -> {
            emitters.remove(nfeId);
            log.debug("SSE concluído para nfe={}", nfeId);
        });
        emitter.onTimeout(() -> {
            emitters.remove(nfeId);
            log.debug("SSE timeout para nfe={}", nfeId);
            emitter.complete();
        });
        emitter.onError(ex -> {
            emitters.remove(nfeId);
            log.debug("SSE erro para nfe={}: {}", nfeId, ex.getMessage());
        });

        emitters.put(nfeId, emitter);
        log.info("SSE registrado para nfe={}", nfeId);
        return emitter;
    }

    public void publicar(UUID nfeId, String tipo, String mensagem) {
        enviar(nfeId, tipo, mensagem, false);
    }

    public void finalizar(UUID nfeId, boolean sucesso, String mensagem) {
        enviar(nfeId, sucesso ? "autorizada" : "rejeitada", mensagem, true);
    }

    private void enviar(UUID nfeId, String tipo, String mensagem, boolean fechar) {
        SseEmitter emitter = emitters.get(nfeId);
        if (emitter == null) {
            log.debug("Nenhum SSE ativo para nfe={} (evento descartado: {})", nfeId, tipo);
            return;
        }

        try {
            NfeEventoDTO evento = new NfeEventoDTO(tipo, mensagem, fechar, LocalDateTime.now());
            emitter.send(SseEmitter.event().name(tipo).data(evento));

            if (fechar) {
                emitter.complete();
                emitters.remove(nfeId);
            }
        } catch (IOException e) {
            log.warn("Falha ao enviar SSE para nfe={}: {}", nfeId, e.getMessage());
            emitters.remove(nfeId);
            try {
                emitter.complete();
            } catch (Exception ignored) {
            }
        }
    }

    public record NfeEventoDTO(String tipo, String mensagem, boolean final_, LocalDateTime timestamp) {
    }
}
