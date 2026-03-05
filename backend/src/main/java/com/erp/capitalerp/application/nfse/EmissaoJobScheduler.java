package com.erp.capitalerp.application.nfse;

import com.erp.capitalerp.domain.nfse.FilaEmissaoNfse;
import com.erp.capitalerp.domain.nfse.NotaFiscalServico;
import com.erp.capitalerp.domain.nfse.StatusFila;
import com.erp.capitalerp.domain.nfse.StatusNFSe;
import com.erp.capitalerp.infrastructure.persistence.nfse.FilaEmissaoRepository;
import com.erp.capitalerp.infrastructure.persistence.nfse.NotaFiscalServicoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Scheduler que processa a fila de emissão NFS-e de forma assíncrona.
 *
 * <p>
 * Equivalente ao Worker do Laravel Queue. Roda a cada {@value INTERVALO_MS}ms,
 * processa até {@value MAX_POR_CICLO} jobs por ciclo e gerencia retentativas
 * com backoff exponencial.
 *
 * <p>
 * Publica eventos SSE em tempo real via {@link NfseEventPublisher} para que o
 * Angular receba feedback imediato de cada etapa.
 *
 * <p>
 * <b>Recuperação de falhas:</b> jobs travados em PROCESSANDO por mais de
 * {@value TIMEOUT_PROCESSANDO_MINUTOS} minutos são re-enfileirados
 * automaticamente (proteção contra crash do servidor).
 */
@Service
public class EmissaoJobScheduler {

    private static final Logger log = LoggerFactory.getLogger(EmissaoJobScheduler.class);

    /** Intervalo entre ciclos do scheduler (ms) */
    private static final long INTERVALO_MS = 5_000;

    /** Máximo de jobs processados por ciclo (evita sobrecarga) */
    private static final int MAX_POR_CICLO = 5;

    /** Jobs PROCESSANDO por mais de X minutos são considerados travados */
    private static final int TIMEOUT_PROCESSANDO_MINUTOS = 10;

    private final FilaEmissaoRepository filaRepository;
    private final NotaFiscalServicoRepository nfseRepository;
    private final AcbrNFSeService acbrService;
    private final NfseEventPublisher eventPublisher;

    public EmissaoJobScheduler(FilaEmissaoRepository filaRepository, NotaFiscalServicoRepository nfseRepository,
            AcbrNFSeService acbrService, NfseEventPublisher eventPublisher) {
        this.filaRepository = filaRepository;
        this.nfseRepository = nfseRepository;
        this.acbrService = acbrService;
        this.eventPublisher = eventPublisher;
    }

    // ─── Ciclo Principal ──────────────────────────────────────────────────────

    /**
     * Ciclo principal do scheduler. Executa a cada 5 segundos. fixedDelay garante
     * que o próximo ciclo só começa após o anterior terminar.
     */
    @Scheduled(fixedDelay = INTERVALO_MS)
    public void processarFila() {
        recuperarJobsTravados();

        List<FilaEmissaoNfse> pendentes = filaRepository.buscarPendentes(LocalDateTime.now(), MAX_POR_CICLO);

        if (pendentes.isEmpty())
            return;

        log.info("[Scheduler] {} job(s) para processar", pendentes.size());

        for (FilaEmissaoNfse job : pendentes) {
            try {
                processarJob(job);
            } catch (Exception e) {
                log.error("[Scheduler] Erro inesperado no job {}: {}", job.getId(), e.getMessage(), e);
            }
        }
    }

    // ─── Processamento de Job ─────────────────────────────────────────────────

    @Transactional
    protected void processarJob(FilaEmissaoNfse job) {
        UUID nfseId = job.getNfseId();
        log.info("[Job {}] Iniciando para nfse={}", job.getId(), nfseId);

        // 1. Lock: marca como PROCESSANDO
        job.marcarProcessando();
        filaRepository.save(job);

        // 2. Busca a nota
        NotaFiscalServico nota;
        try {
            nota = nfseRepository.findById(nfseId)
                    .orElseThrow(() -> new EntityNotFoundException("NFS-e não encontrada: " + nfseId));
        } catch (EntityNotFoundException e) {
            job.falhar("NFS-e não encontrada no banco: " + nfseId);
            filaRepository.save(job);
            return;
        }

        // 3. Notifica Angular: iniciando
        eventPublisher.publicar(nfseId, "log", "🔄 Iniciando emissão RPS #" + nota.getNumeroRps() + "...");

        // 4. Atualiza nota para PROCESSANDO
        nota.setStatus(StatusNFSe.PROCESSANDO);
        nota.setMensagemRetorno("Enviando à prefeitura...");
        nfseRepository.save(nota);

        // 5. Chama ACBr
        eventPublisher.publicar(nfseId, "log", "📡 Conectando ao serviço ACBr...");
        AcbrNFSeService.EmissaoResult resultado;

        try {
            resultado = acbrService.emitir(nota);
        } catch (Exception e) {
            String msgErro = "Erro ao chamar ACBr: " + truncar(e.getMessage(), 300);
            log.error("[Job {}] {}", job.getId(), msgErro, e);
            tratarFalha(job, nota, msgErro, nfseId);
            return;
        }

        // 6. Aplica resultado
        aplicarResultado(nota, resultado);
        nfseRepository.save(nota);

        // 7. Finaliza job e notifica Angular
        if (resultado.status == StatusNFSe.AUTORIZADA) {
            job.concluir("NFS-e #" + resultado.numeroNfse + " autorizada");
            filaRepository.save(job);
            eventPublisher.finalizar(nfseId, true, "✅ NFS-e nº " + resultado.numeroNfse + " autorizada com sucesso!");
            log.info("[Job {}] CONCLUÍDO — NFS-e #{}", job.getId(), resultado.numeroNfse);

        } else if (resultado.status == StatusNFSe.PROCESSANDO) {
            // Resposta assíncrona da prefeitura — registra protocolo e aguarda
            eventPublisher.publicar(nfseId, "status", "⏳ Processando na prefeitura. Protocolo: " + resultado.protocolo);
            job.concluir("Aguardando retorno assíncrono da prefeitura. Protocolo: " + resultado.protocolo);
            filaRepository.save(job);
            // SSE permanece aberto — Angular ficará aguardando webhook ou consulta manual
            eventPublisher.finalizar(nfseId, false, "⏳ Nota em processamento na prefeitura. Consulte em breve.");

        } else {
            // REJEITADA
            tratarFalha(job, nota, resultado.mensagem, nfseId);
        }
    }

    // ─── Recuperação de Jobs Travados ─────────────────────────────────────────

    /**
     * Re-enfileira jobs que ficaram presos em PROCESSANDO (ex: crash do servidor).
     * Roda antes de cada ciclo principal.
     */
    @Transactional
    protected void recuperarJobsTravados() {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(TIMEOUT_PROCESSANDO_MINUTOS);
        List<FilaEmissaoNfse> travados = filaRepository.buscarTravados(limite);

        for (FilaEmissaoNfse job : travados) {
            log.warn("[Recovery] Re-enfileirando job travado: {}", job.getId());
            job.falhar("Timeout de processamento (servidor reiniciado?)");
            filaRepository.save(job);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void tratarFalha(FilaEmissaoNfse job, NotaFiscalServico nota, String mensagem, UUID nfseId) {
        boolean esgotado = job.falhar(mensagem);
        filaRepository.save(job);

        if (esgotado) {
            nota.setStatus(StatusNFSe.REJEITADA);
            nota.setMensagemRetorno(mensagem);
            nfseRepository.save(nota);
            eventPublisher.finalizar(nfseId, false,
                    "❌ Falha definitiva após " + job.getTentativas() + " tentativas: " + truncar(mensagem, 200));
            log.error("[Job {}] FALHOU definitivamente após {} tentativas", job.getId(), job.getTentativas());
        } else {
            eventPublisher.publicar(nfseId, "alerta", "⚠️ Tentativa " + job.getTentativas() + "/"
                    + job.getMaxTentativas() + " falhou. Reagendando... Erro: " + truncar(mensagem, 150));
            // SSE permanece aberto enquanto há tentativas restantes
        }
    }

    private void aplicarResultado(NotaFiscalServico nota, AcbrNFSeService.EmissaoResult result) {
        nota.setStatus(result.status);
        nota.setMensagemRetorno(result.mensagem);

        if (result.status == StatusNFSe.AUTORIZADA) {
            nota.setNumeroNfse(result.numeroNfse);
            nota.setCodigoVerificacao(result.codigoVerificacao);
            nota.setDataAutorizacao(LocalDateTime.now());
            if (result.xmlNfse != null && !result.xmlNfse.isBlank()) {
                nota.setXmlNfse(result.xmlNfse);
            }
        } else if (result.status == StatusNFSe.PROCESSANDO) {
            nota.setProtocoloLote(result.protocolo);
        }
    }

    private String truncar(String s, int max) {
        if (s == null)
            return "";
        return s.length() > max ? s.substring(0, max) + "..." : s;
    }
}
