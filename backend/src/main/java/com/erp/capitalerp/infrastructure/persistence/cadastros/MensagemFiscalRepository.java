package com.erp.capitalerp.infrastructure.persistence.cadastros;

import com.erp.capitalerp.domain.fiscal.MensagemFiscal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MensagemFiscalRepository extends JpaRepository<MensagemFiscal, UUID> {
    List<MensagemFiscal> findByTituloContainingIgnoreCase(String titulo);
}
