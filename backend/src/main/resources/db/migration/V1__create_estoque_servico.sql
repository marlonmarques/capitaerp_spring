CREATE TABLE categorias (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100)
);

CREATE TABLE fornecedores (
    id UUID PRIMARY KEY,
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100)
);

CREATE TABLE produtos (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    codigo_barras VARCHAR(50) UNIQUE NOT NULL,
    codigo_ncm VARCHAR(8),
    codigo_cest VARCHAR(20),
    preco_venda NUMERIC(10,2) NOT NULL,
    preco_custo NUMERIC(10,2),
    estoque_minimo INTEGER NOT NULL DEFAULT 0,
    estoque_atual INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    aliquota_icms NUMERIC(5,2),
    aliquota_pis NUMERIC(5,2),
    aliquota_cofins NUMERIC(5,2),
    cst_icms VARCHAR(10),
    cst_pis VARCHAR(3),
    cst_cofins VARCHAR(3),
    cfop VARCHAR(6),
    categoria_id UUID REFERENCES categorias(id),
    fornecedor_id UUID REFERENCES fornecedores(id),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100)
);

CREATE INDEX idx_produtos_codigo_barras ON produtos(codigo_barras);
CREATE INDEX idx_produtos_status ON produtos(status);
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);

CREATE TABLE movimentacoes_estoque (
    id UUID PRIMARY KEY,
    produto_id UUID NOT NULL REFERENCES produtos(id),
    tipo VARCHAR(20) NOT NULL,
    quantidade INTEGER NOT NULL,
    saldo_anterior INTEGER NOT NULL,
    saldo_posterior INTEGER NOT NULL,
    motivo TEXT,
    referencia_id UUID,
    referencia_tipo VARCHAR(50),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100)
);

CREATE TABLE servicos (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    codigo_interno VARCHAR(50) UNIQUE NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    codigo_servico_lc116 VARCHAR(20),
    aliquota_iss NUMERIC(5,2),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100)
);
