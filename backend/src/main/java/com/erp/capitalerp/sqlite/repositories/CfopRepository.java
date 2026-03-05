package com.erp.capitalerp.sqlite.repositories;

import com.erp.capitalerp.sqlite.entities.Cfop;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CfopRepository extends JpaRepository<Cfop, Long> {

    @Query("SELECT c FROM Cfop c WHERE c.code IS NOT NULL AND c.code != '' AND ("
            + "LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Cfop> searchByKeyword(@Param("search") String search, Pageable pageable);

    @Query("SELECT c FROM Cfop c WHERE c.code IS NOT NULL AND c.code != ''")
    List<Cfop> findAllWithCode(Pageable pageable);
}
