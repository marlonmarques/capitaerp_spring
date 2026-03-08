package com.erp.capitalerp.infrastructure.persistence.clientes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.erp.capitalerp.domain.clientes.Cliente;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    java.util.List<Cliente> findByTenantIdentifier(String tenantIdentifier);

    java.util.Optional<Cliente> findByIdAndTenantIdentifier(Long id, String tenantIdentifier);

    boolean existsByCpfAndTenantIdentifier(String cpf, String tenantIdentifier);

    boolean existsByCpfAndIdNotAndTenantIdentifier(String cpf, Long id, String tenantIdentifier);
}