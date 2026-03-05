package com.erp.capitalerp.sqlite.repositories;

import com.erp.capitalerp.sqlite.entities.Ncm;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NcmRepository extends JpaRepository<Ncm, Long> {

    @Query("SELECT n FROM Ncm n WHERE " + "LOWER(n.codigo) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(n.descricao) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Ncm> searchByKeyword(@Param("search") String search, Pageable pageable);

    @Query("SELECT n FROM Ncm n")
    List<Ncm> findAllLimited(Pageable pageable);
}
