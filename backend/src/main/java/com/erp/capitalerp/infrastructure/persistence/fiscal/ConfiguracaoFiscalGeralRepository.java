package com.erp.capitalerp.infrastructure.persistence.fiscal;

import com.erp.capitalerp.domain.fiscal.ConfiguracaoFiscalGeral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConfiguracaoFiscalGeralRepository extends JpaRepository<ConfiguracaoFiscalGeral, UUID> {
    Optional<ConfiguracaoFiscalGeral> findByTenantIdentifier(String tenantIdentifier);
}
