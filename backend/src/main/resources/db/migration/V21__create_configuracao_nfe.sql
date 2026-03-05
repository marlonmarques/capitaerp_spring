-- V21__create_configuracao_nfe.sql
CREATE TABLE config_nfe (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    created_em TIMESTAMP NOT NULL,
    updated_em TIMESTAMP,
    criado_por VARCHAR(100),
    deleted BOOLEAN DEFAULT FALSE,
    
    ativar_nfe BOOLEAN DEFAULT FALSE,
    serie INTEGER DEFAULT 1,
    numero_nfe INTEGER DEFAULT 1,
    categoria_id UUID,
    info_complementar_padrao VARCHAR(500),
    cfop_padrao VARCHAR(10),
    natureza_operacao_padrao VARCHAR(100),
    conta_bancaria_id UUID,
    ambiente VARCHAR(20) DEFAULT 'HOMOLOGACAO',
    enviar_email BOOLEAN DEFAULT FALSE,
    assunto_email VARCHAR(150),
    mensagem_email VARCHAR(1000)
);

CREATE INDEX idx_config_nfe_tenant ON config_nfe(tenant_id);
