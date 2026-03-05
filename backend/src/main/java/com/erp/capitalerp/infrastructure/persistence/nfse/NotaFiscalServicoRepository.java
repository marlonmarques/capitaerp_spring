package com.erp.capitalerp.infrastructure.persistence.nfse;

import com.erp.capitalerp.domain.nfse.NotaFiscalServico;
import com.erp.capitalerp.domain.nfse.StatusNFSe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotaFiscalServicoRepository extends JpaRepository<NotaFiscalServico, UUID> {

    Page<NotaFiscalServico> findByStatusOrderByCriadoEmDesc(StatusNFSe status, Pageable pageable);

    @Query("SELECT n FROM NotaFiscalServico n WHERE "
            + "(:busca IS NULL OR LOWER(n.discriminacaoServico) LIKE LOWER(CONCAT('%',:busca,'%')) "
            + "OR CAST(n.numeroRps AS string) LIKE CONCAT('%',:busca,'%') "
            + "OR n.numeroNfse LIKE CONCAT('%',:busca,'%')) " + "AND (:status IS NULL OR n.status = :status) "
            + "ORDER BY n.criadoEm DESC")
    Page<NotaFiscalServico> buscar(@Param("busca") String busca, @Param("status") StatusNFSe status, Pageable pageable);

    Optional<NotaFiscalServico> findByNumeroRps(Integer numeroRps);

    Optional<NotaFiscalServico> findByNumeroNfse(String numeroNfse);

    List<NotaFiscalServico> findByStatusIn(List<StatusNFSe> statuses);

    @Query("SELECT COALESCE(MAX(n.numeroRps), 0) FROM NotaFiscalServico n")
    Integer findMaxNumeroRps();
}
