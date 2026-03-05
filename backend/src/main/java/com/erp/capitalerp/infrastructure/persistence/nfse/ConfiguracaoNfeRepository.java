package com.erp.capitalerp.infrastructure.persistence.nfse;

import com.erp.capitalerp.domain.nfse.ConfiguracaoNfe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConfiguracaoNfeRepository extends JpaRepository<ConfiguracaoNfe, UUID> {
    Optional<ConfiguracaoNfe> findTopByTenantIdentifierOrderByIdAsc(String tenantIdentifier);
}
