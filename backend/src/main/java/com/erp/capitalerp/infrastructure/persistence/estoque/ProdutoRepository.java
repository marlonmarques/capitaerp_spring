package com.erp.capitalerp.infrastructure.persistence.estoque;

import com.erp.capitalerp.domain.estoque.Produto;
import com.erp.capitalerp.domain.estoque.ProdutoStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProdutoRepository extends JpaRepository<Produto, UUID> {

        Optional<Produto> findByCodigoBarrasAndDeletadoEmIsNull(String codigoBarras);

        /** Busca com filtros — exclui soft-deleted */
        @Query("""
                        SELECT p FROM Produto p
                        LEFT JOIN FETCH p.categoria
                        LEFT JOIN FETCH p.fornecedorPrincipal
                        LEFT JOIN FETCH p.grupoTributario
                        WHERE p.deletadoEm IS NULL
                          AND (:busca IS NULL
                               OR LOWER(p.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                               OR LOWER(p.codigoBarras) LIKE LOWER(CONCAT('%', :busca, '%'))
                               OR LOWER(p.codigoNcm) LIKE LOWER(CONCAT('%', :busca, '%')))
                          AND (:status IS NULL OR p.status = :status)
                        """)
        Page<Produto> findComFiltros(@Param("busca") String busca, @Param("status") ProdutoStatus status,
                        Pageable pageable);

        /** Produtos abaixo do estoque mínimo (ativos, sem variações). */
        @Query("""
                        SELECT p FROM Produto p
                        WHERE p.deletadoEm IS NULL
                          AND p.status = 'ATIVO'
                          AND p.temVariacoes = false
                          AND p.estoqueAtual < p.estoqueMinimo
                        """)
        List<Produto> findAbaixoEstoqueMinimo();

        /**
         * Busca produto por ID incluindo variações (sem JOIN FETCH de atributos —
         * usa @BatchSize).
         */
        @Query("""
                        SELECT DISTINCT p FROM Produto p
                        LEFT JOIN FETCH p.categoria
                        LEFT JOIN FETCH p.fornecedorPrincipal
                        LEFT JOIN FETCH p.grupoTributario
                        LEFT JOIN FETCH p.variacoes
                        WHERE p.id = :id AND p.deletadoEm IS NULL
                        """)
        Optional<Produto> findByIdComVariacoes(@Param("id") UUID id);

        /** Lista simples para comboboxes (id + nome). */
        @Query("SELECT p FROM Produto p WHERE p.deletadoEm IS NULL AND p.status = 'ATIVO' ORDER BY p.nome")
        List<Produto> findAllAtivos();

        @Query("SELECT p FROM Produto p LEFT JOIN FETCH p.grupoTributario WHERE p.id IN :ids")
        List<Produto> findAllByIdInWithTributacao(@Param("ids") java.util.Collection<UUID> ids);
}
