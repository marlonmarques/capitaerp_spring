package com.erp.capitalerp.sqlite.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.erp.capitalerp.sqlite.entities.CondPayment;

@Repository
public interface CondPaymentRepository extends JpaRepository<CondPayment, Long> {

}
