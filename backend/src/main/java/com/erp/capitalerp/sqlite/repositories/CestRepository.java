package com.erp.capitalerp.sqlite.repositories;

import com.erp.capitalerp.sqlite.entities.Cest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CestRepository extends JpaRepository<Cest, String> {

    /**
     * Busca todos os CESTs relacionados a um NCM específico pelo código exato.
     * Realiza busca também por prefixo de código NCM (pois NCM pode ser 8 dígitos
     * mas o CEST pode mapear para posições/capítulos do NCM).
     */
    @Query("""
            SELECT c FROM Cest c
            JOIN Ncm n ON c.ncmId = n.id
            WHERE n.codigo = :ncmCodigo
               OR n.codigo LIKE :ncmPrefixo
            ORDER BY c.id
            """)
    List<Cest> findByNcmCodigo(@Param("ncmCodigo") String ncmCodigo, @Param("ncmPrefixo") String ncmPrefixo);

    @Query("""
            SELECT c FROM Cest c
            WHERE LOWER(c.descricao) LIKE LOWER(CONCAT('%', :search, '%'))
               OR c.id LIKE CONCAT(:search, '%')
            ORDER BY c.id
            """)
    List<Cest> searchByDescricao(@Param("search") String search);
}
