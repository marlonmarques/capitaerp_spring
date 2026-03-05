package com.erp.capitalerp.domain.shared;

public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String msg){
        super(msg);
    }
}
