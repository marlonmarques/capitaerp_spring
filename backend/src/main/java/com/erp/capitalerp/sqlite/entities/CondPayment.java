package com.erp.capitalerp.sqlite.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_cond_payment")
public class CondPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String codString;

    public CondPayment() {
    }

    public CondPayment(Long id, String name, String codString) {
        this.id = id;
        this.name = name;
        this.codString = codString;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCodString() {
        return codString;
    }

    public void setCodString(String codString) {
        this.codString = codString;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((codString == null) ? 0 : codString.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        CondPayment other = (CondPayment) obj;
        if (codString == null) {
            if (other.codString != null)
                return false;
        } else if (!codString.equals(other.codString))
            return false;
        return true;
    }

    
}
