package com.erp.capitalerp.domain.nfse;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Job persistente na fila de emissão assíncrona de NFS-e.
 *
 * <p>
 * Equivalente ao model de Job do Laravel Queue (driver database). Cada linha
 * representa uma operação pendente/em andamento/concluída para uma nota fiscal.
 *
 * <p>
 * O scheduler {@code EmissaoJobScheduler} processa os registros com status
 * {@link StatusFila#PENDENTE} periodicamente.
 */
@Entity
@Table(name = "fila_emissao_nfse")
public class FilaEmissaoNfse {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ─── Referência ───────────────────────────────────────────────────────────

    /** ID da NFS-e que será processada (FK). */
    @Column(name = "nfse_id", nullable = false)
    private UUID nfseId;

    // ─── Estado do Job ────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusFila status = StatusFila.PENDENTE;

    @Column(name = "tipo_operacao", nullable = false, length = 30)
    private String tipoOperacao = "EMISSAO";

    // ─── Controle de Retentativas ─────────────────────────────────────────────

    @Column(nullable = false)
    private Integer tentativas = 0;

    @Column(name = "max_tentativas", nullable = false)
    private Integer maxTentativas = 3;

    /** Quando pode tentar novamente (backoff). Null = imediatamente. */
    @Column(name = "proximo_tentativa_em")
    private LocalDateTime proximoTentativaEm;

    // ─── Resultado ────────────────────────────────────────────────────────────

    @Column(columnDefinition = "TEXT")
    private String erro;

    @Column(columnDefinition = "TEXT")
    private String resultado;

    // ─── Auditoria ────────────────────────────────────────────────────────────

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    @Column(name = "iniciado_em")
    private LocalDateTime iniciadoEm;

    @Column(name = "concluido_em")
    private LocalDateTime concluidoEm;

    @Column(name = "criado_por", length = 100)
    private String criadoPor;

    // ─── Factory Methods ──────────────────────────────────────────────────────

    /** Cria um novo job de emissão PENDENTE para a NFS-e informada. */
    public static FilaEmissaoNfse novoJobEmissao(UUID nfseId, String criadoPor) {
        FilaEmissaoNfse job = new FilaEmissaoNfse();
        job.nfseId = nfseId;
        job.tipoOperacao = "EMISSAO";
        job.status = StatusFila.PENDENTE;
        job.criadoPor = criadoPor;
        return job;
    }

    // ─── Comportamento de Domínio ─────────────────────────────────────────────

    /** Marca o job como em processamento (lock). */
    public void marcarProcessando() {
        this.status = StatusFila.PROCESSANDO;
        this.iniciadoEm = LocalDateTime.now();
    }

    /** Finaliza com sucesso. */
    public void concluir(String resultado) {
        this.status = StatusFila.CONCLUIDO;
        this.resultado = resultado;
        this.concluidoEm = LocalDateTime.now();
        this.erro = null;
    }

    /**
     * Trata falha: incrementa tentativas e decide se re-agenda ou encerra.
     *
     * @param mensagemErro mensagem do erro ocorrido
     * @return {@code true} se atingiu o máximo de tentativas (FALHOU)
     */
    public boolean falhar(String mensagemErro) {
        this.tentativas++;
        this.erro = mensagemErro;

        if (this.tentativas >= this.maxTentativas) {
            this.status = StatusFila.FALHOU;
            this.concluidoEm = LocalDateTime.now();
            return true;
        }

        // Backoff exponencial: 30s, 2min, 10min
        long[] backoffMinutos = { 0, 2, 10, 30 };
        long backoff = backoffMinutos[Math.min(this.tentativas, backoffMinutos.length - 1)];
        this.proximoTentativaEm = LocalDateTime.now().plusMinutes(backoff);
        this.status = StatusFila.PENDENTE;
        return false;
    }

    public boolean podeProcessar() {
        return status == StatusFila.PENDENTE
                && (proximoTentativaEm == null || proximoTentativaEm.isBefore(LocalDateTime.now()));
    }

    // ─── Getters & Setters ────────────────────────────────────────────────────

    public UUID getId() {
        return id;
    }

    public UUID getNfseId() {
        return nfseId;
    }

    public StatusFila getStatus() {
        return status;
    }

    public void setStatus(StatusFila status) {
        this.status = status;
    }

    public String getTipoOperacao() {
        return tipoOperacao;
    }

    public Integer getTentativas() {
        return tentativas;
    }

    public Integer getMaxTentativas() {
        return maxTentativas;
    }

    public void setMaxTentativas(Integer maxTentativas) {
        this.maxTentativas = maxTentativas;
    }

    public LocalDateTime getProximoTentativaEm() {
        return proximoTentativaEm;
    }

    public String getErro() {
        return erro;
    }

    public String getResultado() {
        return resultado;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public LocalDateTime getIniciadoEm() {
        return iniciadoEm;
    }

    public LocalDateTime getConcluidoEm() {
        return concluidoEm;
    }

    public String getCriadoPor() {
        return criadoPor;
    }
}
