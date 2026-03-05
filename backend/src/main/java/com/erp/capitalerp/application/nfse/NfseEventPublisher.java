package com.erp.capitalerp.application.nfse;

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
 * Gerenciador de conexões SSE (Server-Sent Events) para feedback em tempo real.
 *
 * <p>
 * O Angular abre uma conexão SSE logo após disparar a emissão. Este serviço
 * mantém o registro dos emitters ativos e permite que o
 * {@link EmissaoJobScheduler} envie eventos progressivos ao cliente sem
 * polling.
 *
 * <p>
 * <b>Thread-safety:</b> usa {@link ConcurrentHashMap} — seguro para acesso
 * concurrent do scheduler e das requisições HTTP.
 */
@Service
public class NfseEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(NfseEventPublisher.class);

    /** Timeout padrão para a conexão SSE: 5 minutos */
    private static final long SSE_TIMEOUT_MS = 5 * 60 * 1_000L;

    /** Mapa nfseId → SseEmitter ativo */
    private final Map<UUID, SseEmitter> emitters = new ConcurrentHashMap<>();

    // ─── Registro e Criação ───────────────────────────────────────────────────

    /**
     * Cria e registra um novo SseEmitter para a nota informada. Configura callbacks
     * de cleanup automático ao completar, timeout ou erro.
     */
    public SseEmitter criar(UUID nfseId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

        emitter.onCompletion(() -> {
            emitters.remove(nfseId);
            log.debug("SSE concluído para nfse={}", nfseId);
        });
        emitter.onTimeout(() -> {
            emitters.remove(nfseId);
            log.debug("SSE timeout para nfse={}", nfseId);
            emitter.complete();
        });
        emitter.onError(ex -> {
            emitters.remove(nfseId);
            log.debug("SSE erro para nfse={}: {}", nfseId, ex.getMessage());
        });

        emitters.put(nfseId, emitter);
        log.info("SSE registrado para nfse={}", nfseId);
        return emitter;
    }

    // ─── Publicação de Eventos ────────────────────────────────────────────────

    /**
     * Publica um evento de log/progresso (não finaliza a conexão).
     *
     * @param nfseId   ID da NFS-e
     * @param tipo     tipo do evento: "log", "status", "alerta"
     * @param mensagem texto exibido no painel do Angular
     */
    public void publicar(UUID nfseId, String tipo, String mensagem) {
        enviar(nfseId, tipo, mensagem, false);
    }

    /**
     * Publica o evento final e fecha a conexão SSE. Chame este método quando o job
     * terminar (CONCLUIDO ou FALHOU).
     *
     * @param nfseId   ID da NFS-e
     * @param sucesso  true = AUTORIZADA, false = REJEITADA/FALHOU
     * @param mensagem texto final
     */
    public void finalizar(UUID nfseId, boolean sucesso, String mensagem) {
        enviar(nfseId, sucesso ? "autorizada" : "rejeitada", mensagem, true);
    }

    // ─── Helpers Internos ─────────────────────────────────────────────────────

    private void enviar(UUID nfseId, String tipo, String mensagem, boolean fechar) {
        SseEmitter emitter = emitters.get(nfseId);
        if (emitter == null) {
            log.debug("Nenhum SSE ativo para nfse={} (evento descartado: {})", nfseId, tipo);
            return;
        }

        try {
            NfseEventoDTO evento = new NfseEventoDTO(tipo, mensagem, fechar, LocalDateTime.now());
            emitter.send(SseEmitter.event().name(tipo).data(evento));

            if (fechar) {
                emitter.complete();
                emitters.remove(nfseId);
            }
        } catch (IOException e) {
            log.warn("Falha ao enviar SSE para nfse={}: {}", nfseId, e.getMessage());
            emitters.remove(nfseId);
            try {
                emitter.complete();
            } catch (Exception ignored) {
            }
        }
    }

    /** DTO interno serializado como JSON para o Angular. */
    public record NfseEventoDTO(String tipo, String mensagem, boolean final_, LocalDateTime timestamp) {
    }

    /** Retorna quantas conexões SSE estão abertas (útil para monitoramento). */
    public int totalConexoesAtivas() {
        return emitters.size();
    }
}
