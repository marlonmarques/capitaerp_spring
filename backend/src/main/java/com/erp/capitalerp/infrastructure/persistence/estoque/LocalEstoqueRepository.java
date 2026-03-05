package com.erp.capitalerp.infrastructure.persistence.estoque;

import com.erp.capitalerp.domain.estoque.LocalEstoque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LocalEstoqueRepository extends JpaRepository<LocalEstoque, UUID> {
    List<LocalEstoque> findByAtivoTrue();
}
