package com.erp.capitalerp.sqlite.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.erp.capitalerp.sqlite.entities.Nbs;

import java.util.List;

public interface NbsRepository extends JpaRepository<Nbs, String> {

    @Query("SELECT n FROM Nbs n WHERE LOWER(n.code) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(n.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Nbs> searchByKeyword(@Param("search") String search, Pageable pageable);

    @Query(value = "SELECT n.* FROM nbs n JOIN nbs_correlacao nc ON n.code = nc.nbs_codigo WHERE nc.item_lc116 = (SELECT servico FROM cnae WHERE mascara = :cnaeMascara LIMIT 1)", nativeQuery = true)
    List<Nbs> findNbsByCnaeMascara(@Param("cnaeMascara") String cnaeMascara);

    @Query(value = "SELECT DISTINCT nc.item_lc116 FROM nbs_correlacao nc WHERE nc.nbs_codigo = :nbsCodigo", nativeQuery = true)
    List<String> findItemLc116ByNbsCodigo(@Param("nbsCodigo") String nbsCodigo);
}
