package com.erp.capitalerp.infrastructure.persistence.cadastros;

import com.erp.capitalerp.domain.cadastros.Fornecedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FornecedorRepository extends JpaRepository<Fornecedor, UUID> {
}
