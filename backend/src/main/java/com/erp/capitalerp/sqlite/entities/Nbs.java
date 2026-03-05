package com.erp.capitalerp.sqlite.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "nbs")
public class Nbs {

    @Id
    @Column(name = "code", length = 50)
    private String code;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
