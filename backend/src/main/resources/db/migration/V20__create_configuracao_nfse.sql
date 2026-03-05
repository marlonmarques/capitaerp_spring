-- V20__create_configuracao_nfse.sql
CREATE TABLE config_nfse (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    created_em TIMESTAMP NOT NULL,
    updated_em TIMESTAMP,
    criado_por VARCHAR(100),
    deleted BOOLEAN DEFAULT FALSE,
    
    ativar_nfse BOOLEAN DEFAULT FALSE,
    serie INTEGER DEFAULT 1,
    numero_rps INTEGER DEFAULT 1,
    categoria_id UUID,
    info_complementar_padrao VARCHAR(500),
    cnae_padrao VARCHAR(20),
    item_lc116_padrao VARCHAR(20),
    aliquota_padrao DECIMAL(5,2),
    conta_bancaria_id UUID,
    ambiente VARCHAR(20) DEFAULT 'HOMOLOGACAO',
    enviar_email BOOLEAN DEFAULT FALSE,
    assunto_email VARCHAR(150),
    mensagem_email VARCHAR(1000)
);

CREATE INDEX idx_config_nfse_tenant ON config_nfse(tenant_id);
