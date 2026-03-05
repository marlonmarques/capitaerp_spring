package com.erp.capitalerp.infrastructure.persistence.estoque;

import com.erp.capitalerp.domain.estoque.EstoqueSaldo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EstoqueSaldoRepository extends JpaRepository<EstoqueSaldo, UUID> {

    Optional<EstoqueSaldo> findByProdutoIdAndVariacaoIdAndLocalEstoqueId(UUID produtoId, UUID variacaoId,
            UUID localEstoqueId);

    List<EstoqueSaldo> findByProdutoId(UUID produtoId);

    List<EstoqueSaldo> findByLocalEstoqueId(UUID localEstoqueId);

    List<EstoqueSaldo> findByLocalEstoqueIdAndProdutoId(UUID localEstoqueId, UUID produtoId);

    @Query("SELECT e FROM EstoqueSaldo e WHERE e.estoqueMinimo > 0 AND e.quantidade < e.estoqueMinimo")
    List<EstoqueSaldo> findAbaixoMinimo();

    @Query("SELECT sum(e.quantidade) FROM EstoqueSaldo e WHERE e.produto.id = :produtoId AND e.variacao IS NULL")
    Integer sumQuantidadeByProdutoId(UUID produtoId);

    @Query("SELECT sum(e.quantidade) FROM EstoqueSaldo e WHERE e.produto.id = :produtoId")
    Integer sumTotalQuantidadeByProdutoId(UUID produtoId);
}
