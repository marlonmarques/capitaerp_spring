CREATE TABLE planos (
    id UUID PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    modulo_nfse BOOLEAN DEFAULT FALSE,
    modulo_nfe BOOLEAN DEFAULT FALSE,
    modulo_nfce BOOLEAN DEFAULT FALSE,
    modulo_estoque BOOLEAN DEFAULT FALSE,
    modulo_financeiro BOOLEAN DEFAULT FALSE,
    limite_usuarios INTEGER DEFAULT 1,
    limite_filiais INTEGER DEFAULT 1,
    valor_mensal DECIMAL(15,2) DEFAULT 0.00,
    ativo BOOLEAN DEFAULT TRUE
);

-- Adicionar plano na empresa
ALTER TABLE empresas ADD COLUMN plano_id UUID;
ALTER TABLE empresas ADD CONSTRAINT fk_empresa_plano FOREIGN KEY (plano_id) REFERENCES planos(id);

-- Inserir um plano básico padrão
INSERT INTO planos (id, nome, modulo_nfse, modulo_nfe, modulo_estoque, limite_usuarios, limite_filiais, valor_mensal)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Plano Básico', TRUE, FALSE, TRUE, 5, 2, 99.90);

-- Atribuir o plano básico a todas as empresas existentes (ajustar ID se necessário)
UPDATE empresas SET plano_id = '550e8400-e29b-41d4-a716-446655440000' WHERE plano_id IS NULL;
