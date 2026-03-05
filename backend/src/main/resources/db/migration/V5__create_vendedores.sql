CREATE TABLE vendedores (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(20),
    telefone VARCHAR(20),
    email VARCHAR(255),
    percentual_comissao NUMERIC(5,2) DEFAULT 0.00,
    ativo BOOLEAN NOT NULL DEFAULT true,
    usuario_id BIGINT REFERENCES tb_user(id),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100)
);

-- Inserindo um vendedor genérico padrão ("Venda Direta / Balcão")
INSERT INTO vendedores (id, nome, cpf_cnpj, percentual_comissao, ativo, criado_em)
VALUES ('00000000-0000-0000-0000-000000000001', 'Balcão', '', 0.00, true, NOW());
