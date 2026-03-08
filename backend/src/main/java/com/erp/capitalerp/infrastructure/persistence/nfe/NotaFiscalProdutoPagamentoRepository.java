package com.erp.capitalerp.infrastructure.persistence.nfe;

import com.erp.capitalerp.domain.nfe.NotaFiscalProdutoPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface NotaFiscalProdutoPagamentoRepository extends JpaRepository<NotaFiscalProdutoPagamento, UUID> {
}
