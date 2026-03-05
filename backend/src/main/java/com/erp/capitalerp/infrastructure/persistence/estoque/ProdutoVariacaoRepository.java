package com.erp.capitalerp.infrastructure.persistence.estoque;

import com.erp.capitalerp.domain.estoque.ProdutoVariacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProdutoVariacaoRepository extends JpaRepository<ProdutoVariacao, UUID> {

    @Query("""
            SELECT v FROM ProdutoVariacao v
            LEFT JOIN FETCH v.atributos
            WHERE v.produto.id = :produtoId
            ORDER BY v.nomeVariacao
            """)
    List<ProdutoVariacao> findByProdutoId(@Param("produtoId") UUID produtoId);

    /** Variações abaixo do estoque mínimo. */
    @Query("""
            SELECT v FROM ProdutoVariacao v
            JOIN FETCH v.produto p
            WHERE v.ativo = true
              AND p.deletadoEm IS NULL
              AND v.estoqueAtual < v.estoqueMinimo
            """)
    List<ProdutoVariacao> findVariacoesAbaixoEstoqueMinimo();

    Optional<ProdutoVariacao> findByCodigoBarras(String codigoBarras);

    Optional<ProdutoVariacao> findBySku(String sku);
}
