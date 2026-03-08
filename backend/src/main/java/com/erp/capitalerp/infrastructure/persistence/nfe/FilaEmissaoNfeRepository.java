package com.erp.capitalerp.infrastructure.persistence.nfe;

import com.erp.capitalerp.domain.nfe.FilaEmissaoNfe;
import com.erp.capitalerp.domain.nfse.StatusFila;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface FilaEmissaoNfeRepository extends JpaRepository<FilaEmissaoNfe, UUID> {

    @Query(value = "SELECT * FROM fila_emissao_nfe WHERE status = 'PENDENTE' AND (proximo_tentativa_em IS NULL OR proximo_tentativa_em <= :agora) LIMIT :limite", nativeQuery = true)
    List<FilaEmissaoNfe> buscarPendentes(@Param("agora") LocalDateTime agora, @Param("limite") int limite);

    @Query("SELECT j FROM FilaEmissaoNfe j WHERE j.status = 'PROCESSANDO' AND j.iniciadoEm <= :limite")
    List<FilaEmissaoNfe> buscarTravados(@Param("limite") LocalDateTime limite);

    @Modifying
    @Query("UPDATE FilaEmissaoNfe j SET j.status = 'FALHOU', j.erro = 'Cancelado pelo sistema' WHERE j.nfeId = :nfeId AND j.status IN ('PENDENTE', 'PROCESSANDO')")
    void cancelarJobsDaNfe(@Param("nfeId") UUID nfeId);

    boolean existsByNfeIdAndStatusIn(UUID nfeId, Collection<StatusFila> status);

    List<FilaEmissaoNfe> findByNfeIdOrderByCriadoEmDesc(UUID nfeId);
}
