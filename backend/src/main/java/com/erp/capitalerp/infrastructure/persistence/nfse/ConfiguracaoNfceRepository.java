package com.erp.capitalerp.infrastructure.persistence.nfse;

import com.erp.capitalerp.domain.nfse.ConfiguracaoNfce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConfiguracaoNfceRepository extends JpaRepository<ConfiguracaoNfce, UUID> {
    Optional<ConfiguracaoNfce> findByTenantIdentifierAndFilialId(String tenantIdentifier, UUID filialId);
    Optional<ConfiguracaoNfce> findByTenantIdentifier(String tenantIdentifier);
}
