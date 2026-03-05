CREATE TABLE empresas (
    id UUID PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(20) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100)
);

-- Inserindo configuração vazia inicial da empresa pra ser atualizada no frontend
INSERT INTO empresas (id, razao_social, nome_fantasia, cnpj, criado_em)
VALUES ('00000000-0000-0000-0000-000000000001', 'Minha Empresa Ltda', 'Capital ERP Base', '00000000000000', NOW());
