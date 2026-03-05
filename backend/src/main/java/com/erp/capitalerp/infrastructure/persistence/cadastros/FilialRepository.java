package com.erp.capitalerp.infrastructure.persistence.cadastros;

import com.erp.capitalerp.domain.cadastros.Filial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FilialRepository extends JpaRepository<Filial, UUID> {
    List<Filial> findByTenantIdentifier(String tenantIdentifier);

    Optional<Filial> findByIdAndTenantIdentifier(UUID id, String tenantIdentifier);

    Optional<Filial> findByTenantIdentifierAndIsMatrizTrue(String tenantIdentifier);
}
