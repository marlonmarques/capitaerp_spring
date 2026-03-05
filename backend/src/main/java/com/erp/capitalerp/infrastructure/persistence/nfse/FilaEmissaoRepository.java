package com.erp.capitalerp.infrastructure.persistence.nfse;

import com.erp.capitalerp.domain.nfse.FilaEmissaoNfse;
import com.erp.capitalerp.domain.nfse.StatusFila;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface FilaEmissaoRepository extends JpaRepository<FilaEmissaoNfse, UUID> {

    /**
     * Busca jobs prontos para processar: - Status PENDENTE - Sem agendamento futuro
     * OU data passou Limitado a {@code limit} para evitar sobrecarga em um único
     * ciclo.
     */
    @Query("""
            SELECT f FROM FilaEmissaoNfse f
            WHERE f.status = 'PENDENTE'
              AND (f.proximoTentativaEm IS NULL OR f.proximoTentativaEm <= :agora)
            ORDER BY f.criadoEm ASC
            LIMIT :limite
            """)
    List<FilaEmissaoNfse> buscarPendentes(@Param("agora") LocalDateTime agora, @Param("limite") int limite);

    /**
     * Jobs travados em PROCESSANDO por mais de {@code minutos} minutos (indica
     * crash do servidor — devem ser re-enfileirados).
     */
    @Query("""
            SELECT f FROM FilaEmissaoNfse f
            WHERE f.status = 'PROCESSANDO'
              AND f.iniciadoEm < :limite
            """)
    List<FilaEmissaoNfse> buscarTravados(@Param("limite") LocalDateTime limite);

    /** Cancela jobs PENDENTE/PROCESSANDO de uma NFS-e (ex: nota excluída). */
    @Modifying
    @Query("""
            UPDATE FilaEmissaoNfse f SET f.status = 'FALHOU', f.erro = 'Cancelado pelo sistema'
            WHERE f.nfseId = :nfseId AND f.status IN ('PENDENTE', 'PROCESSANDO')
            """)
    void cancelarJobsDaNfse(@Param("nfseId") UUID nfseId);

    /** Verifica se já existe job ativo (evita duplicidade). */
    boolean existsByNfseIdAndStatusIn(UUID nfseId, List<StatusFila> statuses);

    List<FilaEmissaoNfse> findByNfseIdOrderByCriadoEmDesc(UUID nfseId);
}
