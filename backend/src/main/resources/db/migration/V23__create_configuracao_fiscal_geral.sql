CREATE TABLE config_fiscal_geral (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    deleted_at TIMESTAMP WITHOUT TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    tenant_identifier VARCHAR(20) NOT NULL,

    certificado TEXT, -- base64 do certificado
    senha_certificado VARCHAR(255),
    ambiente_servicos VARCHAR(20) DEFAULT 'HOMOLOGACAO',
    ambiente_produtos VARCHAR(20) DEFAULT 'HOMOLOGACAO',
    regime_tributario INTEGER DEFAULT 6,
    faturamento_anual NUMERIC(19, 2),
    cnae_principal VARCHAR(20)
);
