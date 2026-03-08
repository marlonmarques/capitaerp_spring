package com.erp.capitalerp.config.multitenancy;

import java.util.UUID;

/**
 * Armazena a filial ativa da requisição atual thread-local.
 * Permite que serviços e repositórios saibam em qual unidade o usuário está operando.
 */
public class FilialContext {

    private static final ThreadLocal<UUID> currentFilial = new ThreadLocal<>();

    public static void setCurrentFilial(UUID filialId) {
        currentFilial.set(filialId);
    }

    public static UUID getCurrentFilial() {
        return currentFilial.get();
    }

    public static void clear() {
        currentFilial.remove();
    }
}
