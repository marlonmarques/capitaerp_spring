CREATE TABLE IF NOT EXISTS contas_bancarias (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo_banco VARCHAR(50) NOT NULL,
    agencia VARCHAR(20),
    numero_conta VARCHAR(30),
    carteira VARCHAR(20),
    convenio VARCHAR(50),
    contrato VARCHAR(50),
    tipo_carteira VARCHAR(20),
    instrucoes_boleto1 VARCHAR(150),
    instrucoes_boleto2 VARCHAR(150),
    instrucoes_boleto3 VARCHAR(150),
    taxa_mora DECIMAL(10,4),
    taxa_multa DECIMAL(10,4),
    saldo_inicial DECIMAL(19,4) DEFAULT 0.00,
    via_api BOOLEAN DEFAULT FALSE,
    token_api VARCHAR(255),
    telefone VARCHAR(20),
    padrao BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    excluido BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default 'Caixinha' as starting point
INSERT INTO contas_bancarias (id, nome, codigo_banco, padrao, ativo, excluido, criado_em, atualizado_em)
VALUES ('cb000000-0000-0000-0000-000000000001', 'Caixa Interno (Dinheiro)', 'CAIXA_INTERNO', TRUE, TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
