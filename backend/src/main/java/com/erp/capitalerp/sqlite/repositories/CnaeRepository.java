package com.erp.capitalerp.sqlite.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.erp.capitalerp.sqlite.entities.Cnae;

import java.util.List;

public interface CnaeRepository extends JpaRepository<Cnae, String> {

    @Query("SELECT c FROM Cnae c WHERE LOWER(c.mascara) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(c.descricao) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Cnae> searchByKeyword(@Param("search") String search, Pageable pageable);
}
