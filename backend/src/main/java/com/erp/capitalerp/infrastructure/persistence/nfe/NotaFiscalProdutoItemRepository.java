package com.erp.capitalerp.infrastructure.persistence.nfe;

import com.erp.capitalerp.domain.nfe.NotaFiscalProdutoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface NotaFiscalProdutoItemRepository extends JpaRepository<NotaFiscalProdutoItem, UUID> {
}
