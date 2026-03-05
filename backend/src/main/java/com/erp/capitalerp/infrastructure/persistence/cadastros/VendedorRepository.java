package com.erp.capitalerp.infrastructure.persistence.cadastros;

import com.erp.capitalerp.domain.cadastros.Vendedor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.UUID;

public interface VendedorRepository extends JpaRepository<Vendedor, UUID> {

    @Query("SELECT obj FROM Vendedor obj WHERE "
            + "(:nome IS NULL OR LOWER(obj.nome) LIKE LOWER(CONCAT('%', :nome, '%'))) AND "
            + "(:ativo IS NULL OR obj.ativo = :ativo)")
    Page<Vendedor> findComFiltros(String nome, Boolean ativo, Pageable pageable);

}
