package com.erp.capitalerp.infrastructure.persistence.nfse;

import com.erp.capitalerp.domain.nfse.ConfiguracaoNfse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConfiguracaoNfseRepository extends JpaRepository<ConfiguracaoNfse, UUID> {
    Optional<ConfiguracaoNfse> findByTenantIdentifierAndFilialId(String tenantIdentifier, UUID filialId);
    Optional<ConfiguracaoNfse> findTopByTenantIdentifierOrderByIdAsc(String tenantIdentifier);
}
