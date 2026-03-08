package com.erp.capitalerp.infrastructure.persistence.nfe;

import com.erp.capitalerp.domain.nfe.NotaFiscalProdutoEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotaFiscalProdutoEventoRepository extends JpaRepository<NotaFiscalProdutoEvento, UUID> {
    List<NotaFiscalProdutoEvento> findByNfeId(UUID nfeId);
}
