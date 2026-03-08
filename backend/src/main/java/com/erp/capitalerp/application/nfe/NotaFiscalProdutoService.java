package com.erp.capitalerp.application.nfe;

import com.erp.capitalerp.domain.nfe.NotaFiscalProduto;
import com.erp.capitalerp.domain.nfe.NotaFiscalProdutoEvento;
import com.erp.capitalerp.domain.nfe.StatusNFe;
import com.erp.capitalerp.infrastructure.persistence.nfe.NotaFiscalProdutoEventoRepository;
import com.erp.capitalerp.infrastructure.persistence.nfe.NotaFiscalProdutoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.scheduling.annotation.Async;

import com.erp.capitalerp.application.nfe.dto.NfeListItemDTO;
import com.erp.capitalerp.config.multitenancy.FilialContext;
import com.erp.capitalerp.config.multitenancy.TenantContext;
import com.erp.capitalerp.domain.nfe.FilaEmissaoNfe;
import com.erp.capitalerp.domain.nfse.StatusFila;
import com.erp.capitalerp.infrastructure.persistence.nfe.FilaEmissaoNfeRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class NotaFiscalProdutoService {

    private final NotaFiscalProdutoRepository repository;
    private final AcbrNFeService acbrService;
    private final NotaFiscalProdutoEventoRepository eventoRepository;
    private final NfeEventPublisher eventPublisher;
    private final NfeCalculoService calculoService;
    private final FilaEmissaoNfeRepository filaRepository;
    private final NfePrintService printService;

    public NotaFiscalProdutoService(NotaFiscalProdutoRepository repository, AcbrNFeService acbrService,
            NotaFiscalProdutoEventoRepository eventoRepository, NfeEventPublisher eventPublisher,
            NfeCalculoService calculoService, FilaEmissaoNfeRepository filaRepository,
            NfePrintService printService) {
        this.repository = repository;
        this.acbrService = acbrService;
        this.eventoRepository = eventoRepository;
        this.eventPublisher = eventPublisher;
        this.calculoService = calculoService;
        this.filaRepository = filaRepository;
        this.printService = printService;
    }

    @Transactional(readOnly = true)
    public Page<NfeListItemDTO> listar(String busca, StatusNFe status, Pageable pageable) {
        String tenant = TenantContext.getCurrentTenant();
        UUID filial = FilialContext.getCurrentFilial();

        String buscaParam = (busca != null && !busca.isBlank()) ? busca.trim() : null;

        return repository.listarDTO(buscaParam, status, tenant, filial, pageable);
    }

    @Transactional
    public void emitir(UUID id) {
        NotaFiscalProduto nota = repository.findById(id).orElseThrow(() -> new RuntimeException("Nota não encontrada"));

        if (nota.getStatus() == StatusNFe.AUTORIZADA) {
            throw new IllegalStateException("Esta nota já está autorizada.");
        }

        // Verifica se já há job ativo
        boolean jobAtivo = filaRepository.existsByNfeIdAndStatusIn(id,
                List.of(StatusFila.PENDENTE, StatusFila.PROCESSANDO));
        if (jobAtivo) {
            throw new IllegalStateException("Já existe uma transmissão em andamento para esta nota.");
        }

        // Marca como processando e enfileira
        nota.setStatus(StatusNFe.PROCESSANDO);
        nota.setMensagemRetorno("Aguardando fila de processamento...");
        repository.save(nota);

        String usuario = obterUsuarioAtual();
        FilaEmissaoNfe job = FilaEmissaoNfe.novoJobEmissao(id, usuario);
        filaRepository.save(job);

        eventPublisher.publicar(id, "status", "Nota enfileirada para transmissão...");
    }

    /**
     * Lógica real de transmissão SEFAZ, executada pelo Scheduler em background.
     */
    @Transactional
    public void executarTransmissaoSefaz(NotaFiscalProduto nota) {
        try {
            eventPublisher.publicar(nota.getId(), "log", "Gerando arquivo INI para o ACBr...");
            AcbrNFeService.EmissaoResult result = acbrService.emitir(nota);

            eventPublisher.publicar(nota.getId(), "log", "Resposta SEFAZ: " + result.mensagem);
            processarResultado(nota, result);

            if (result.status != StatusNFe.AUTORIZADA && result.status != StatusNFe.PROCESSANDO) {
                throw new RuntimeException("Rejeição SEFAZ: " + result.mensagem);
            }
        } catch (Exception e) {
            eventPublisher.publicar(nota.getId(), "error", "Falha na transmissão: " + e.getMessage());
            throw e;
        }
    }

    private String obterUsuarioAtual() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            return auth != null ? auth.getName() : "sistema";
        } catch (Exception e) {
            return "sistema";
        }
    }

    @Transactional
    public void consultar(UUID id) {
        NotaFiscalProduto nota = repository.findById(id).orElseThrow(() -> new RuntimeException("Nota não encontrada"));

        AcbrNFeService.EmissaoResult result = acbrService.consultar(nota);
        processarResultado(nota, result);
    }

    @Transactional
    public void cancelar(UUID id, String justificativa) {
        NotaFiscalProduto nota = repository.findById(id).orElseThrow(() -> new RuntimeException("Nota não encontrada"));

        if (nota.getStatus() != StatusNFe.AUTORIZADA) {
            throw new RuntimeException("Apenas notas autorizadas podem ser canceladas");
        }

        AcbrNFeService.EmissaoResult result = acbrService.cancelar(nota, justificativa);

        if (result.status == StatusNFe.EVENTO || result.status == StatusNFe.CANCELADA) {
            nota.setStatus(StatusNFe.CANCELADA);
            nota.setMensagemRetorno(result.mensagem);
            nota.setCodigoRetorno(result.cStat);
            nota.setDataCancelamento(LocalDateTime.now());
            repository.save(nota);

            // Registrar evento
            saveEvento(nota, result.cStat, "Cancelamento: " + justificativa, 1, result.xml);
        } else {
            throw new RuntimeException("Erro ao cancelar: " + result.mensagem);
        }
    }

    @Transactional
    public void cartaCorrecao(UUID id, String texto) {
        NotaFiscalProduto nota = repository.findById(id).orElseThrow(() -> new RuntimeException("Nota não encontrada"));

        if (nota.getStatus() != StatusNFe.AUTORIZADA) {
            throw new RuntimeException("Apenas notas autorizadas podem ter carta de correção");
        }

        int proximaSequencia = (nota.getSequenciaEvento() != null ? nota.getSequenciaEvento() : 0) + 1;
        AcbrNFeService.EmissaoResult result = acbrService.cartaCorrecao(nota, texto, proximaSequencia);

        if (result.status == StatusNFe.EVENTO) {
            nota.setSequenciaEvento(proximaSequencia);
            repository.save(nota);

            // Registrar evento
            saveEvento(nota, result.cStat, "CC-e: " + texto, proximaSequencia, result.xml);
        } else {
            throw new RuntimeException("Erro ao enviar CC-e: " + result.mensagem);
        }
    }

    private void saveEvento(NotaFiscalProduto nota, String codigo, String nome, Integer sequencia, String xml) {
        NotaFiscalProdutoEvento evento = new NotaFiscalProdutoEvento();
        evento.setNfeId(nota.getId());
        evento.setCodigo(codigo);
        evento.setNome(nome);
        evento.setSequencia(sequencia);
        evento.setXmlEvento(xml);
        evento.setTenantIdentifier(nota.getTenantIdentifier());
        eventoRepository.save(evento);
    }

    private void processarResultado(NotaFiscalProduto nota, AcbrNFeService.EmissaoResult result) {
        nota.setStatus(result.status);
        nota.setMensagemRetorno(result.mensagem);
        nota.setCodigoRetorno(result.cStat);

        if (result.status == StatusNFe.AUTORIZADA) {
            nota.setChaveNfe(result.chave);
            nota.setProtocoloNfe(result.protocolo);
            nota.setXmlProcessado(result.xml);
            nota.setDataAutorizacao(LocalDateTime.now());
        } else if (result.status == StatusNFe.PROCESSANDO) {
            nota.setProtocoloLote(result.protocolo);
        }

        repository.save(nota);
    }
    /*
     * @Transactional(readOnly = true) public Page<NotaFiscalProduto> listar(String
     * busca, StatusNFe status, Pageable pageable) { String tenant =
     * com.erp.capitalerp.config.multitenancy.TenantContext.getCurrentTenant(); UUID
     * filial =
     * com.erp.capitalerp.config.multitenancy.FilialContext.getCurrentFilial();
     * return repository.buscar(busca, status, tenant, filial, pageable); }
     */

    @Transactional(readOnly = true)
    public NotaFiscalProduto buscarPorId(UUID id) {
        // Alterado de findById para findByIdFull para carregar itens e pagamentos (Join
        // Fetch)
        return repository.findByIdFull(id).orElseThrow(() -> new RuntimeException("Nota não encontrada"));
    }

    @Transactional
    public void excluir(UUID id) {
        NotaFiscalProduto nota = buscarPorId(id);
        if (nota.getStatus() != StatusNFe.RASCUNHO && nota.getStatus() != StatusNFe.REJEITADA) {
            throw new RuntimeException("Apenas notas em rascunho ou rejeitadas podem ser excluídas");
        }
        repository.delete(nota);
    }

    @Transactional(readOnly = true)
    public NfeDashboardDTO obterResumo() {
        String tenant = com.erp.capitalerp.config.multitenancy.TenantContext.getCurrentTenant();
        UUID filial = com.erp.capitalerp.config.multitenancy.FilialContext.getCurrentFilial();

        var counts = repository.countByStatus(tenant, filial);
        java.util.Map<String, Long> porStatus = new java.util.HashMap<>();
        long total = 0;
        for (Object[] row : counts) {
            String status = row[0].toString();
            long count = (long) row[1];
            porStatus.put(status, count);
            total += count;
        }

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime inicioMesAtual = agora.with(java.time.temporal.TemporalAdjusters.firstDayOfMonth()).withHour(0)
                .withMinute(0);
        LocalDateTime fimMesAtual = agora.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth()).withHour(23)
                .withMinute(59);

        agora.minusMonths(1);
        LocalDateTime inicioMesAnterior = agora.minusMonths(1)
                .with(java.time.temporal.TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0);
        LocalDateTime fimMesAnterior = agora.minusMonths(1).with(java.time.temporal.TemporalAdjusters.lastDayOfMonth())
                .withHour(23).withMinute(59);

        java.math.BigDecimal valorMesAtual = repository.sumTotalAuthorized(tenant, filial, inicioMesAtual, fimMesAtual);
        java.math.BigDecimal valorMesAnterior = repository.sumTotalAuthorized(tenant, filial, inicioMesAnterior,
                fimMesAnterior);

        return new NfeDashboardDTO(total, porStatus.getOrDefault("AUTORIZADA", 0L),
                porStatus.getOrDefault("PROCESSANDO", 0L), porStatus.getOrDefault("REJEITADA", 0L),
                valorMesAtual != null ? valorMesAtual : java.math.BigDecimal.ZERO,
                valorMesAnterior != null ? valorMesAnterior : java.math.BigDecimal.ZERO, porStatus);
    }

    @Transactional
    public NotaFiscalProduto salvar(NotaFiscalProduto nota) {
        String tenant = com.erp.capitalerp.config.multitenancy.TenantContext.getCurrentTenant();
        UUID filialId = com.erp.capitalerp.config.multitenancy.FilialContext.getCurrentFilial();
        nota.setTenantIdentifier(tenant);
        if (nota.getFilialId() == null) {
            nota.setFilialId(filialId);
        }

        if (nota.getId() == null || nota.getNumero() == null || nota.getNumero() == 0) {
            Integer proximo = repository.findMaxNumero(tenant, nota.getSerie(), nota.getModelo());
            nota.setNumero(proximo + 1);
        }
        if (nota.getDataEmissao() == null) {
            nota.setDataEmissao(LocalDateTime.now());
        }

        // Realizar cálculos automáticos (apportionment, tributação, rateio)
        calculoService.recalcular(nota);

        // Garantir associação bidirecional para JPA persistir corretamente os
        // itens/pagamentos
        if (nota.getItens() != null) {
            nota.getItens().forEach(item -> {
                item.setNota(nota);
            });
        }
        if (nota.getPagamentos() != null) {
            nota.getPagamentos().forEach(pag -> pag.setNota(nota));
        }

        return repository.save(nota);
    }

    @Transactional(readOnly = true)
    public byte[] imprimirDanfe(UUID id) {
        NotaFiscalProduto nota = repository.findById(id).orElseThrow(() -> new RuntimeException("Nota não encontrada"));
        
        String xml = nota.getXmlProcessado();
        if (xml == null || xml.isBlank()) {
            throw new RuntimeException("Nota fiscal não possui XML processado para impressão.");
        }
        
        return printService.generateDanfe(xml);
    }
}
