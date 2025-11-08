package com.erp.capitalerp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.erp.capitalerp.entities.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

}
