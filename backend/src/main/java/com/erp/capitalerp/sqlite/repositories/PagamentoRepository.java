package com.erp.capitalerp.sqlite.repositories;

import com.erp.capitalerp.sqlite.entities.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
}
