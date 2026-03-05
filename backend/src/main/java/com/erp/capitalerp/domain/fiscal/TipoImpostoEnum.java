package com.erp.capitalerp.domain.fiscal;

public enum TipoImpostoEnum {

    ICMS("ICMS - Imposto sobre Circulação de Mercadorias"), ICMS_ST("ICMS ST - Substituição Tributária"),
    IPI("IPI - Imposto sobre Produtos Industrializados"), ISS("ISS - Imposto Sobre Serviços"), PIS_COFINS("PIS/COFINS"),
    SIMPLES("Simples Nacional (unificado)"), COMPOSTO("Composto (múltiplos impostos)"),
    // Reforma Tributária (EC 132/2023)
    IBS_CBS("IBS/CBS - Reforma Tributária"), ISENTO("Isento / Não Tributado");

    private final String descricao;

    TipoImpostoEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
