package com.erp.capitalerp.services;

import com.erp.capitalerp.entities.User;

public class Factory {

    public static User createUser() {
        User user = new User(1L, "Maria", "Brown", "maria@gmail.com", "123456");
        return user;
    }

}