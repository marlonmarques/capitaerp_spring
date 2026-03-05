CREATE TABLE filiais (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    version BIGINT NOT NULL,
    tenant_identifier VARCHAR(20) NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(20) NOT NULL,
    inscricao_estadual VARCHAR(50),
    inscricao_municipal VARCHAR(50),
    crt VARCHAR(2), -- 1=Simples, 2=Simples excesso, 3=Normal
    cep VARCHAR(10),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    ibge VARCHAR(10),
    is_matriz BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE pdvs (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    version BIGINT NOT NULL,
    tenant_identifier VARCHAR(20) NOT NULL,
    filial_id UUID NOT NULL,
    nome VARCHAR(100) NOT NULL,
    serie_nfce INT NOT NULL,
    numero_atual_nfce INT NOT NULL DEFAULT 1,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (filial_id) REFERENCES filiais(id)
);

ALTER TABLE config_fiscal_geral ADD COLUMN filial_id UUID;
ALTER TABLE config_fiscal_geral ADD CONSTRAINT fk_config_geral_filial FOREIGN KEY (filial_id) REFERENCES filiais(id);

ALTER TABLE config_nfe ADD COLUMN filial_id UUID;
ALTER TABLE config_nfe ADD CONSTRAINT fk_config_nfe_filial FOREIGN KEY (filial_id) REFERENCES filiais(id);

ALTER TABLE config_nfce ADD COLUMN filial_id UUID;
ALTER TABLE config_nfce ADD CONSTRAINT fk_config_nfce_filial FOREIGN KEY (filial_id) REFERENCES filiais(id);

ALTER TABLE config_nfse ADD COLUMN filial_id UUID;
ALTER TABLE config_nfse ADD CONSTRAINT fk_config_nfse_filial FOREIGN KEY (filial_id) REFERENCES filiais(id);
