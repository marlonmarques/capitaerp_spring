package com.erp.capitalerp.application.nfse;

import com.erp.capitalerp.application.nfse.dto.NotaFiscalServicoDTO;
import com.erp.capitalerp.domain.clientes.Cliente;
import com.erp.capitalerp.config.multitenancy.FilialContext;
import com.erp.capitalerp.config.multitenancy.TenantContext;
import com.erp.capitalerp.domain.cadastros.Filial;
import com.erp.capitalerp.domain.nfse.FilaEmissaoNfse;
import com.erp.capitalerp.domain.nfse.NotaFiscalServico;
import com.erp.capitalerp.domain.nfse.StatusFila;
import com.erp.capitalerp.domain.nfse.StatusNFSe;
import com.erp.capitalerp.domain.usuarios.User;
import com.erp.capitalerp.infrastructure.persistence.cadastros.FilialRepository;
import com.erp.capitalerp.infrastructure.persistence.clientes.ClienteRepository;
import com.erp.capitalerp.infrastructure.persistence.nfse.FilaEmissaoRepository;
import com.erp.capitalerp.infrastructure.persistence.nfse.NotaFiscalServicoRepository;
import com.erp.capitalerp.infrastructure.persistence.usuarios.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Orquestrador principal do módulo NFS-e. Delegaciona INI ao
 * {@link NfseIniGeneratorService} e comunicação ACBr ao
 * {@link AcbrNFSeService}.
 */
@Service
@Transactional
public class NotaFiscalServicoService {

    private static final Logger log = LoggerFactory.getLogger(NotaFiscalServicoService.class);

    private final NotaFiscalServicoRepository repository;
    private final ClienteRepository clienteRepository;
    private final AcbrNFSeService acbrService;
    private final FilaEmissaoRepository filaRepository;
    private final UserRepository userRepository;
    private final FilialRepository filialRepository;
    private final com.erp.capitalerp.application.usuarios.UserService userService;

    public NotaFiscalServicoService(NotaFiscalServicoRepository repository, ClienteRepository clienteRepository,
            AcbrNFSeService acbrService, FilaEmissaoRepository filaRepository, UserRepository userRepository,
            FilialRepository filialRepository, com.erp.capitalerp.application.usuarios.UserService userService) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
        this.acbrService = acbrService;
        this.filaRepository = filaRepository;
        this.userRepository = userRepository;
        this.filialRepository = filialRepository;
        this.userService = userService;
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<NotaFiscalServicoDTO> listar(String busca, String status, Pageable pageable) {
        String tenant = TenantContext.getCurrentTenant();
        java.util.UUID filialAtiva = FilialContext.getCurrentFilial();

        // Blindagem: valida se o usuário pode acessar a filial solicitada no context
        userService.validarAcessoFilial(filialAtiva);

        StatusNFSe statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = StatusNFSe.valueOf(status.toUpperCase());
            } catch (Exception ignored) {
            }
        }
        return repository.buscar(busca, statusEnum, tenant, filialAtiva, pageable).map(NotaFiscalServicoDTO::new);
    }

    @Transactional(readOnly = true)
    public NotaFiscalServicoDTO buscarPorId(UUID id) {
        return new NotaFiscalServicoDTO(findOrThrow(id));
    }

    public NotaFiscalServicoDTO salvar(NotaFiscalServicoDTO dto) {
        String tenant = TenantContext.getCurrentTenant();
        NotaFiscalServico nota = new NotaFiscalServico();
        preencherDados(nota, dto);
        nota.setNumeroRps(gerarProximoRps(tenant));
        nota.setStatus(StatusNFSe.RASCUNHO);
        nota.recalcularValores();
        return new NotaFiscalServicoDTO(repository.save(nota));
    }

    public NotaFiscalServicoDTO atualizar(UUID id, NotaFiscalServicoDTO dto) {
        NotaFiscalServico nota = findOrThrow(id);
        if (nota.getStatus() == StatusNFSe.AUTORIZADA || nota.getStatus() == StatusNFSe.CANCELADA) {
            throw new IllegalStateException("Nota no status " + nota.getStatus() + " não pode ser editada.");
        }
        preencherDados(nota, dto);
        nota.recalcularValores();
        return new NotaFiscalServicoDTO(repository.save(nota));
    }

    public void excluir(UUID id) {
        NotaFiscalServico nota = findOrThrow(id);

        // Notas com valor fiscal imutável não podem ser excluídas
        if (nota.getStatus() == StatusNFSe.AUTORIZADA) {
            throw new IllegalStateException(
                    "🔒 Nota AUTORIZADA não pode ser excluída. Para eliminá-la do sistema, cancele-a primeiro via prefeitura.");
        }
        if (nota.getStatus() == StatusNFSe.PROCESSANDO) {
            throw new IllegalStateException(
                    "⏳ Nota em PROCESSANDO não pode ser excluída. Aguarde o retorno da prefeitura.");
        }
        if (nota.getStatus() == StatusNFSe.CANCELADA) {
            throw new IllegalStateException(
                    "🔒 Nota CANCELADA não pode ser excluída. Ela deve ser mantida para fins fiscais e de auditoria.");
        }

        // Cancela qualquer job pendente na fila antes de excluir
        filaRepository.cancelarJobsDaNfse(id);

        log.info("Excluindo NFS-e RPS #{} (status: {}, id: {})", nota.getNumeroRps(), nota.getStatus(), id);
        repository.delete(nota);
    }

    // ─── EMISSÃO ──────────────────────────────────────────────────────────────

    /**
     * Enfileira a emissão da NFS-e de forma assíncrona.
     *
     * <p>
     * O método retorna imediatamente com status PROCESSANDO. O
     * {@link EmissaoJobScheduler} processa o job em background e envia eventos SSE
     * em tempo real via {@link NfseEventPublisher}.
     *
     * @throws IllegalStateException se já houver um job ativo para esta nota
     */
    public NotaFiscalServicoDTO emitir(UUID id) {
        NotaFiscalServico nota = findOrThrow(id);

        if (!nota.podeEmitir()) {
            throw new IllegalStateException("NFS-e no status " + nota.getStatus() + " não pode ser emitida.");
        }

        // Evita duplicidade: não cria job se já há um PENDENTE ou PROCESSANDO
        boolean jobAtivo = filaRepository.existsByNfseIdAndStatusIn(id,
                List.of(StatusFila.PENDENTE, StatusFila.PROCESSANDO));
        if (jobAtivo) {
            throw new IllegalStateException("Já existe uma emissão em andamento para esta nota. Aguarde.");
        }

        log.info("Enfileirando emissão NFS-e RPS #{} (ID: {})", nota.getNumeroRps(), id);

        // Marca a nota como PROCESSANDO para feedback imediato no Angular
        nota.setStatus(StatusNFSe.PROCESSANDO);
        nota.setMensagemRetorno("Na fila de emissão...");
        repository.save(nota);

        // Persiste o job na fila — o scheduler irá pegar em até 5 segundos
        String usuario = obterUsuarioAtual();
        FilaEmissaoNfse job = FilaEmissaoNfse.novoJobEmissao(nota.getId(), usuario);
        filaRepository.save(job);

        log.info("Job {} criado para nfse={}", job.getId(), id);
        return new NotaFiscalServicoDTO(repository.save(nota));
    }

    public NotaFiscalServicoDTO consultar(UUID id) {
        NotaFiscalServico nota = findOrThrow(id);
        AcbrNFSeService.EmissaoResult result = acbrService.consultar(nota);
        aplicarResultado(nota, result);
        return new NotaFiscalServicoDTO(repository.save(nota));
    }

    public NotaFiscalServicoDTO cancelar(UUID id, String motivo, String codigoCancelamento) {
        NotaFiscalServico nota = findOrThrow(id);
        acbrService.cancelar(nota, motivo, codigoCancelamento);
        nota.setStatus(StatusNFSe.CANCELADA);
        nota.setDataCancelamento(LocalDateTime.now());
        nota.setMensagemRetorno("Cancelada: " + motivo);
        return new NotaFiscalServicoDTO(repository.save(nota));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

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

    private void preencherDados(NotaFiscalServico nota, NotaFiscalServicoDTO dto) {
        String tenant = TenantContext.getCurrentTenant();
        nota.setTenantIdentifier(tenant);

        // Se a nota é nova e não tem filial vinculada
        if (nota.getFilialId() == null) {
            // 1. Tenta pegar a filial ativa do contexto (troca rápida no frontend)
            java.util.UUID activeFilial = FilialContext.getCurrentFilial();
            if (activeFilial != null) {
                // Blindagem: valida se o usuário pode operar nesta filial
                userService.validarAcessoFilial(activeFilial);
                nota.setFilialId(activeFilial);
            } else {
                // 2. Fallback: herdar da filial padrão do usuário logado
                String email = obterUsuarioAtual();
                User user = userRepository.findByEmail(email);
                if (user != null && user.getFilialId() != null) {
                    nota.setFilialId(user.getFilialId());
                }
            }
        }

        // Se temos uma filial vinculada, buscamos dados dela para preencher UF e IBGE
        // se nulos
        if (nota.getFilialId() != null) {
            filialRepository.findByIdAndTenantIdentifier(nota.getFilialId(), tenant).ifPresent(filial -> {
                if (dto.ufPrestacao() == null) {
                    nota.setUfPrestacao(filial.getEstado());
                } else {
                    nota.setUfPrestacao(dto.ufPrestacao());
                }

                if (dto.municipioIbge() == null) {
                    nota.setMunicipioIbge(filial.getIbge());
                } else {
                    nota.setMunicipioIbge(dto.municipioIbge());
                }
            });
        }

        // Fallback para valores do DTO ou padrão caso não haja filial/dados
        if (nota.getUfPrestacao() == null) {
            nota.setUfPrestacao(dto.ufPrestacao() != null ? dto.ufPrestacao() : "DF");
        }
        if (nota.getMunicipioIbge() == null) {
            nota.setMunicipioIbge(dto.municipioIbge());
        }

        // Tomador
        if (dto.clienteId() != null) {
            Cliente cliente = clienteRepository.findById(dto.clienteId())
                    .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado: " + dto.clienteId()));
            nota.setCliente(cliente);
        }
        nota.setEmailsEnvio(dto.emailsEnvio());

        // Serviço
        nota.setNaturezaOperacao(dto.naturezaOperacao() != null ? dto.naturezaOperacao() : "1");
        nota.setDiscriminacaoServico(dto.discriminacaoServico());
        nota.setInformacoesComplementares(dto.informacoesComplementares());
        nota.setCodigoCnae(dto.codigoCnae());
        nota.setItemLc116(dto.itemLc116());
        nota.setCodigoNbs(dto.codigoNbs());

        nota.setExigibilidadeIss(dto.exigibilidadeIss() != null ? dto.exigibilidadeIss() : 1);
        nota.setIssRetido(Boolean.TRUE.equals(dto.issRetido()));

        // Datas
        nota.setDataEmissao(dto.dataEmissao() != null ? dto.dataEmissao() : LocalDate.now());
        nota.setDataCompetencia(dto.dataCompetencia() != null ? dto.dataCompetencia() : LocalDate.now());
        nota.setDataVencimento(dto.dataVencimento());

        // Valores
        nota.setValorServicos(dto.valorServicos() != null ? dto.valorServicos() : BigDecimal.ZERO);
        nota.setValorDesconto(dto.valorDesconto() != null ? dto.valorDesconto() : BigDecimal.ZERO);
        nota.setAliquotaIss(dto.aliquotaIss() != null ? dto.aliquotaIss() : new BigDecimal("2.00"));
    }

    private Integer gerarProximoRps(String tenant) {
        Integer max = repository.findMaxNumeroRps(tenant);
        return (max != null ? max : 0) + 1;
    }

    private NotaFiscalServico findOrThrow(UUID id) {
        String tenant = TenantContext.getCurrentTenant();
        return repository.findByIdFull(id, tenant)
                .orElseThrow(() -> new EntityNotFoundException("NFS-e não encontrada: " + id));
    }

    private String obterUsuarioAtual() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            return auth != null ? auth.getName() : "sistema";
        } catch (Exception e) {
            return "sistema";
        }
    }
}
