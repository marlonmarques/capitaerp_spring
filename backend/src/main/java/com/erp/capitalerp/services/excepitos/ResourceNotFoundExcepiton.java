package com.erp.capitalerp.services.excepitos;

public class ResourceNotFoundExcepiton extends RuntimeException {

    public ResourceNotFoundExcepiton(String msg){
        super(msg);
    }
}
