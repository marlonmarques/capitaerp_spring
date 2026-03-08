package com.erp.capitalerp.infrastructure.persistence.nfe;

import com.erp.capitalerp.application.nfe.dto.NfeListItemDTO;
import com.erp.capitalerp.domain.nfe.NotaFiscalProduto;
import com.erp.capitalerp.domain.nfe.StatusNFe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface NotaFiscalProdutoRepository extends JpaRepository<NotaFiscalProduto, UUID> {

    /**
     * Busca a nota completa com todas as suas coleções carregadas.
     * Resolve o erro 500: "failed to lazily initialize a collection"
     */
    @Query("SELECT n FROM NotaFiscalProduto n " +
           "LEFT JOIN FETCH n.itens i " +
           "LEFT JOIN FETCH i.produto " +
           "LEFT JOIN FETCH n.pagamentos " +
           "LEFT JOIN FETCH n.cliente " +
           "WHERE n.id = :id")
    Optional<NotaFiscalProduto> findByIdFull(@Param("id") UUID id);

    @Query("SELECT n FROM NotaFiscalProduto n LEFT JOIN FETCH n.cliente c WHERE "
            + "n.tenantIdentifier = :tenant AND "
            + "(:filial IS NULL OR n.filialId = :filial) AND "
            + "(:busca IS NULL OR CAST(n.numero AS string) LIKE CONCAT('%',:busca,'%') "
            + "OR n.chaveNfe LIKE CONCAT('%',:busca,'%') "
            + "OR c.razaoSocial LIKE CONCAT('%',:busca,'%') "
            + "OR c.name LIKE CONCAT('%',:busca,'%')) "
            + "AND (:status IS NULL OR n.status = :status) "
            + "ORDER BY n.criadoEm DESC")
    Page<NotaFiscalProduto> buscar(@Param("busca") String busca, @Param("status") StatusNFe status,
                                   @Param("tenant") String tenant, @Param("filial") UUID filial, Pageable pageable);

    @Query("""
        SELECT new com.erp.capitalerp.application.nfe.dto.NfeListItemDTO(
                n.id, n.numero, n.serie, CAST(n.modelo AS string), n.naturezaOperacao, 
                CAST(n.status AS string), n.dataEmissao,
                n.chaveNfe, n.mensagemRetorno, n.valorTotalNota,
                COALESCE(NULLIF(TRIM(c.razaoSocial), ''), NULLIF(TRIM(CONCAT(c.name, ' ', COALESCE(c.lastName, ''))), ''), 'Não informado'), 
                c.cpf
        )
        FROM NotaFiscalProduto n
        LEFT JOIN n.cliente c
        WHERE n.tenantIdentifier = :tenant
        AND (:filial IS NULL OR n.filialId = :filial)
        AND (:status IS NULL OR n.status = :status)
        AND (:busca IS NULL OR 
                CAST(n.numero AS string) LIKE CONCAT('%', :busca, '%') OR 
                n.chaveNfe LIKE CONCAT('%', :busca, '%') OR
                c.razaoSocial LIKE CONCAT('%', :busca, '%') OR
                c.name LIKE CONCAT('%', :busca, '%') OR
                c.cpf LIKE CONCAT('%', :busca, '%'))
        ORDER BY n.criadoEm DESC
        """)
    Page<NfeListItemDTO> listarDTO(@Param("busca") String busca, @Param("status") StatusNFe status,
                                   @Param("tenant") String tenant, @Param("filial") UUID filial, Pageable pageable);

    @Query("SELECT n.status, COUNT(n) FROM NotaFiscalProduto n WHERE n.tenantIdentifier = :tenant AND (:filial IS NULL OR n.filialId = :filial) GROUP BY n.status")
    List<Object[]> countByStatus(@Param("tenant") String tenant, @Param("filial") UUID filial);

    @Query("SELECT SUM(n.valorTotalNota) FROM NotaFiscalProduto n WHERE "
            + "n.tenantIdentifier = :tenant AND (:filial IS NULL OR n.filialId = :filial) AND "
            + "n.status = 'AUTORIZADA' AND "
            + "n.dataEmissao >= :inicio AND n.dataEmissao <= :fim")
    BigDecimal sumTotalAuthorized(@Param("tenant") String tenant, @Param("filial") UUID filial,
                                           @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    Optional<NotaFiscalProduto> findByNumeroAndSerieAndTenantIdentifier(Integer numero, String serie, String tenant);

    @Query("SELECT COALESCE(MAX(n.numero), 0) FROM NotaFiscalProduto n WHERE n.tenantIdentifier = :tenant AND n.serie = :serie AND n.modelo = :modelo")
    Integer findMaxNumero(@Param("tenant") String tenant, @Param("serie") String serie, @Param("modelo") com.erp.capitalerp.domain.nfe.ModeloNFe modelo);
}