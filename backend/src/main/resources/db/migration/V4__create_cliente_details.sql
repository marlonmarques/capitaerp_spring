CREATE TABLE tb_cliente_endereco (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES tb_cliente(id),
    logradouro VARCHAR(255),
    numero VARCHAR(50),
    complemento VARCHAR(255),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    cep VARCHAR(20),
    principal BOOLEAN DEFAULT false
);

CREATE TABLE tb_cliente_email (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES tb_cliente(id),
    email VARCHAR(255) NOT NULL,
    principal BOOLEAN DEFAULT false
);

-- Mantendo os e-mails/endereço que já existiam como principais (se os campos existissem em cliente)
-- Caso o sistema ainda seja em early-stage, essa migration inicializa as tabelas de um pra muitos do cliente.
