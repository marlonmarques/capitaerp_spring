package com.erp.capitalerp.infrastructure.persistence.estoque;

import com.erp.capitalerp.domain.estoque.MovimentacaoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, UUID> {

    List<MovimentacaoEstoque> findByProdutoIdOrderByCriadoEmDesc(UUID produtoId);

    List<MovimentacaoEstoque> findByLocalEstoqueIdOrLocalDestinoIdOrderByCriadoEmDesc(UUID localId,
            UUID localDestinoId);

    @Query("SELECT m FROM MovimentacaoEstoque m ORDER BY m.criadoEm DESC")
    List<MovimentacaoEstoque> findAllOrderByCriadoEmDesc(Pageable pageable);

    @Query("SELECT m FROM MovimentacaoEstoque m WHERE m.produto.id = :produtoId AND (:localId IS NULL OR m.localEstoque.id = :localId) ORDER BY m.criadoEm DESC")
    List<MovimentacaoEstoque> findByProdutoAndLocal(@Param("produtoId") UUID produtoId, @Param("localId") UUID localId);
}
