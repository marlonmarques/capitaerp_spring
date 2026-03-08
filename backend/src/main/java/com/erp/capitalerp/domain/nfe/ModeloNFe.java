package com.erp.capitalerp.domain.nfe;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ModeloNFe {
    NFE("55"),
    NFCE("65");

    private final String value;

    ModeloNFe(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static ModeloNFe fromValue(String value) {
        for (ModeloNFe m : ModeloNFe.values()) {
            if (m.value.equals(value)) {
                return m;
            }
        }
        return null;
    }
}
