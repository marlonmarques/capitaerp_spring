package com.erp.capitalerp.application.nfe;

import com.erp.capitalerp.domain.nfe.FilaEmissaoNfe;
import com.erp.capitalerp.domain.nfe.NotaFiscalProduto;
import com.erp.capitalerp.domain.nfse.StatusFila;
import com.erp.capitalerp.application.nfe.NfeEventPublisher;
import com.erp.capitalerp.infrastructure.persistence.nfe.FilaEmissaoNfeRepository;
import com.erp.capitalerp.infrastructure.persistence.nfe.NotaFiscalProdutoRepository;
import com.erp.capitalerp.domain.nfe.StatusNFe;
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
 * Scheduler que processa a fila de emissão NF-e (Produtos) de forma assíncrona.
 * Semelhante ao Worker do Laravel Queue.
 */
@Service
public class EmissaoNfeJobScheduler {

    private static final Logger log = LoggerFactory.getLogger(EmissaoNfeJobScheduler.class);

    private static final long INTERVALO_MS = 5_000;
    private static final int MAX_POR_CICLO = 5;
    private static final int TIMEOUT_PROCESSANDO_MINUTOS = 10;

    private final FilaEmissaoNfeRepository filaRepository;
    private final NotaFiscalProdutoRepository nfeRepository;
    private final NotaFiscalProdutoService nfeService;
    private final NfeEventPublisher eventPublisher;

    public EmissaoNfeJobScheduler(FilaEmissaoNfeRepository filaRepository, 
                                 NotaFiscalProdutoRepository nfeRepository,
                                 NotaFiscalProdutoService nfeService, 
                                 NfeEventPublisher eventPublisher) {
        this.filaRepository = filaRepository;
        this.nfeRepository = nfeRepository;
        this.nfeService = nfeService;
        this.eventPublisher = eventPublisher;
    }

    @Scheduled(fixedDelay = INTERVALO_MS)
    public void processarFila() {
        recuperarJobsTravados();

        List<FilaEmissaoNfe> pendentes = filaRepository.buscarPendentes(LocalDateTime.now(), MAX_POR_CICLO);

        if (pendentes.isEmpty()) return;

        log.info("[Scheduler NFe] {} job(s) para processar", pendentes.size());

        for (FilaEmissaoNfe job : pendentes) {
            try {
                processarJob(job);
            } catch (Exception e) {
                log.error("[Scheduler NFe] Erro inesperado no job {}: {}", job.getId(), e.getMessage(), e);
            }
        }
    }

    @Transactional
    protected void processarJob(FilaEmissaoNfe job) {
        UUID nfeId = job.getNfeId();
        log.info("[Job NFe {}] Iniciando para nfe={}", job.getId(), nfeId);

        job.marcarProcessando();
        filaRepository.save(job);

        NotaFiscalProduto nota;
        try {
            nota = nfeRepository.findById(nfeId)
                    .orElseThrow(() -> new EntityNotFoundException("NF-e não encontrada: " + nfeId));
        } catch (EntityNotFoundException e) {
            job.falhar("NF-e não encontrada no banco: " + nfeId);
            filaRepository.save(job);
            return;
        }

        // Notifica Angular via SSE
        eventPublisher.publicar(nfeId, "log", "🔄 Iniciando transmissão NF-e #" + (nota.getNumero() != null ? nota.getNumero() : "Auto") + "...");

        try {
            // Chama a lógica de transmissão real que já existe no Service
            // Vamos precisar ajustar o Service para aceitar uma chamada que não seja @Async duplicada aqui, 
            // ou apenas mover a lógica principal para um método privado/interno.
            nfeService.executarTransmissaoSefaz(nota);
            
            job.concluir("NF-e autorizada com sucesso");
            filaRepository.save(job);
            eventPublisher.finalizar(nfeId, true, "✅ NF-e autorizada com sucesso!");
            log.info("[Job NFe {}] CONCLUÍDO", job.getId());

        } catch (Exception e) {
            String msgErro = "Erro na transmissão: " + e.getMessage();
            log.error("[Job NFe {}] {}", job.getId(), msgErro);
            tratarFalha(job, nota, msgErro, nfeId);
        }
    }

    @Transactional
    protected void recuperarJobsTravados() {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(TIMEOUT_PROCESSANDO_MINUTOS);
        List<FilaEmissaoNfe> travados = filaRepository.buscarTravados(limite);

        for (FilaEmissaoNfe job : travados) {
            log.warn("[Recovery NFe] Re-enfileirando job travado: {}", job.getId());
            job.falhar("Timeout de processamento");
            filaRepository.save(job);
        }
    }

    private void tratarFalha(FilaEmissaoNfe job, NotaFiscalProduto nota, String mensagem, UUID nfeId) {
        boolean esgotado = job.falhar(mensagem);
        filaRepository.save(job);

        if (esgotado) {
            nota.setStatus(StatusNFe.REJEITADA);
            nota.setMensagemRetorno(mensagem);
            nfeRepository.save(nota);
            eventPublisher.finalizar(nfeId, false, "❌ Falha definitiva após " + job.getTentativas() + " tentativas: " + mensagem);
        } else {
            eventPublisher.publicar(nfeId, "alerta", "⚠️ Tentativa " + job.getTentativas() + "/" + job.getMaxTentativas() + " falhou. Reagendando...");
        }
    }
}
