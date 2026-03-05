package com.erp.capitalerp.infrastructure.persistence.financeiro;

import com.erp.capitalerp.domain.financeiro.ContaBancaria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ContaBancariaRepository extends JpaRepository<ContaBancaria, String> {

    @Modifying
    @Query("UPDATE ContaBancaria c SET c.padrao = false WHERE c.id <> :idAndNotExcluido AND c.padrao = true")
    void removerPadraoAntigo(String idAndNotExcluido);

    @Modifying
    @Query("UPDATE ContaBancaria c SET c.excluido = true, c.ativo = false WHERE c.id = :id")
    void softDelete(String id);
}
