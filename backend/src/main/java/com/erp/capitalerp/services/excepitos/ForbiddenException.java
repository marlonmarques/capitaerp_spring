package com.erp.capitalerp.services.excepitos;

public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String msg){
        super(msg);
    }
}
