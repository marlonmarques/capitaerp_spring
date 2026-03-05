package com.erp.capitalerp.domain.nfse;

/**
 * Status do job na fila de emissão assíncrona.
 *
 * <p>
 * Ciclo:
 * 
 * <pre>
 *   PENDENTE → PROCESSANDO → CONCLUIDO
 *                          ↘ FALHOU (tentativas esgotadas)
 * </pre>
 */
public enum StatusFila {

    /** Aguardando o scheduler pegar o job. */
    PENDENTE,

    /** Sendo processado agora (lock para evitar processamento duplo). */
    PROCESSANDO,

    /** Processado com sucesso (NFS-e AUTORIZADA na prefeitura). */
    CONCLUIDO,

    /** Todas as tentativas esgotadas. Exige intervenção manual. */
    FALHOU
}
