package com.erp.capitalerp.infrastructure.persistence.cadastros;

import com.erp.capitalerp.domain.cadastros.Pdv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface PdvRepository extends JpaRepository<Pdv, UUID> {
    List<Pdv> findByTenantIdentifier(String tenantIdentifier);

    List<Pdv> findByFilialIdAndTenantIdentifier(UUID filialId, String tenantIdentifier);

    Optional<Pdv> findByIdAndTenantIdentifier(UUID id, String tenantIdentifier);
}
