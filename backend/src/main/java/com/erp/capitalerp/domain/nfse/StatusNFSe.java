package com.erp.capitalerp.domain.nfse;

/**
 * Status do ciclo de vida de uma NFS-e.
 */
public enum StatusNFSe {
    /** Rascunho — ainda não enviado à prefeitura */
    RASCUNHO,
    /** Aguardando retorno da prefeitura (assíncrono) */
    PROCESSANDO,
    /** NFS-e autorizada pela prefeitura */
    AUTORIZADA,
    /** Rejeitada pela prefeitura — verificar mensagem */
    REJEITADA,
    /** Cancelada com sucesso */
    CANCELADA
}
