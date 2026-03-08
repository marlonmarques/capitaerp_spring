package com.erp.capitalerp.infrastructure.persistence.shared;

import com.erp.capitalerp.domain.shared.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditRepository extends JpaRepository<AuditLog, UUID> {
    Page<AuditLog> findByTenantIdentifierOrderByDataHoraDesc(String tenantIdentifier, Pageable pageable);
    Page<AuditLog> findByEntidadeAndTenantIdentifierOrderByDataHoraDesc(String entidade, String tenantIdentifier, Pageable pageable);
}
