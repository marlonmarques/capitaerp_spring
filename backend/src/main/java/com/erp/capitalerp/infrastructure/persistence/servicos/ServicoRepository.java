package com.erp.capitalerp.infrastructure.persistence.servicos;

import com.erp.capitalerp.domain.servico.Servico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ServicoRepository extends JpaRepository<Servico, UUID> {

    Optional<Servico> findByCodigoInterno(String codigoInterno);

    @Query("""
            SELECT s FROM Servico s
            WHERE (:busca IS NULL OR LOWER(s.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                   OR s.codigoInterno = :busca)
            AND s.status = 'ATIVO'
            """)
    Page<Servico> findComFiltros(@Param("busca") String busca, Pageable pageable);
}
