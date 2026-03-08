package com.erp.capitalerp.infrastructure.persistence.nfse;

import com.erp.capitalerp.domain.nfse.NotaFiscalServico;
import com.erp.capitalerp.domain.nfse.StatusNFSe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface NotaFiscalServicoRepository extends JpaRepository<NotaFiscalServico, UUID> {

        /**
         * NOVO: Carrega a NFS-e com seus relacionamentos em uma única sessão. Evita
         * erro 500 no carregamento do formulário de serviço.
         */
        @Query("SELECT n FROM NotaFiscalServico n " + "LEFT JOIN FETCH n.cliente "
        // + "LEFT JOIN FETCH n.pagamentos "
                        + "WHERE n.id = :id AND n.tenantIdentifier = :tenant")
        Optional<NotaFiscalServico> findByIdFull(@Param("id") UUID id, @Param("tenant") String tenant);

        Page<NotaFiscalServico> findByStatusOrderByCriadoEmDesc(StatusNFSe status, Pageable pageable);

        @Query("SELECT n FROM NotaFiscalServico n WHERE " + "n.tenantIdentifier = :tenant AND "
                        + "(:filial IS NULL OR n.filialId = :filial) AND "
                        + "(:busca IS NULL OR LOWER(n.discriminacaoServico) LIKE LOWER(CONCAT('%',:busca,'%')) "
                        + "OR CAST(n.numeroRps AS string) LIKE CONCAT('%',:busca,'%') "
                        + "OR n.numeroNfse LIKE CONCAT('%',:busca,'%')) "
                        + "AND (:status IS NULL OR n.status = :status) " + "ORDER BY n.criadoEm DESC")
        Page<NotaFiscalServico> buscar(@Param("busca") String busca, @Param("status") StatusNFSe status,
                        @Param("tenant") String tenant, @Param("filial") UUID filial, Pageable pageable);

        Optional<NotaFiscalServico> findByNumeroRpsAndTenantIdentifier(Integer numeroRps, String tenant);

        Optional<NotaFiscalServico> findByNumeroNfseAndTenantIdentifier(String numeroNfse, String tenant);

        Optional<NotaFiscalServico> findByIdAndTenantIdentifier(UUID id, String tenant);

        @Query("SELECT COALESCE(MAX(n.numeroRps), 0) FROM NotaFiscalServico n WHERE n.tenantIdentifier = :tenant")
        Integer findMaxNumeroRps(@Param("tenant") String tenant);
}