package com.erp.capitalerp.infrastructure.persistence.cadastros;

import com.erp.capitalerp.domain.fiscal.PosicaoFiscal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PosicaoFiscalRepository extends JpaRepository<PosicaoFiscal, UUID> {
    List<PosicaoFiscal> findByNomeContainingIgnoreCase(String nome);
}
