-- V22__create_configuracao_nfce.sql
CREATE TABLE config_nfce (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    created_em TIMESTAMP NOT NULL,
    updated_em TIMESTAMP,
    criado_por VARCHAR(100),
    deleted BOOLEAN DEFAULT FALSE,
    
    ativar_nfce BOOLEAN DEFAULT FALSE,
    serie INTEGER DEFAULT 1,
    numero_nfce INTEGER DEFAULT 1,
    categoria_id UUID,
    info_complementar_padrao VARCHAR(500),
    cfop_padrao VARCHAR(10),
    conta_bancaria_id UUID,
    ambiente VARCHAR(20) DEFAULT 'HOMOLOGACAO',
    enviar_email BOOLEAN DEFAULT FALSE,
    assunto_email VARCHAR(150),
    mensagem_email VARCHAR(1000),
    id_csc VARCHAR(10),
    csc VARCHAR(50)
);

CREATE INDEX idx_config_nfce_tenant ON config_nfce(tenant_id);
