package com.erp.capitalerp.infrastructure.persistence.cadastros;

import com.erp.capitalerp.domain.cadastros.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmpresaRepository extends JpaRepository<Empresa, UUID> {

    Optional<Empresa> findByTenantIdentifier(String tenantIdentifier);

    boolean existsByTenantIdentifier(String tenantIdentifier);

    // Como geralmente um ERP no contexto atual pode ter uma única empresa base (ou
    // tenant),
    // pegaremos a primeira em uso no backend
    default Empresa buscarConfiguracaoAtiva() {
        return findAll().stream().findFirst().orElse(null);
    }
}
