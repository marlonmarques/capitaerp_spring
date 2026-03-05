package com.erp.capitalerp.application.usuarios;

import com.erp.capitalerp.domain.usuarios.User;

public class Factory {

    public static User createUser() {
        User user = new User(1L, "Maria", "Brown", "maria@gmail.com", "123456");
        return user;
    }

}