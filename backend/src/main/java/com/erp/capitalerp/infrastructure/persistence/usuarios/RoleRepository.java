package com.erp.capitalerp.infrastructure.persistence.usuarios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.erp.capitalerp.domain.usuarios.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

}
