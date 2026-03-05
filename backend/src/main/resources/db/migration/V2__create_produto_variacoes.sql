CREATE TABLE produto_variacoes (
    id UUID PRIMARY KEY,
    produto_id UUID NOT NULL REFERENCES produtos(id),
    cor VARCHAR(100),
    tamanho VARCHAR(100),
    outro_detalhe VARCHAR(255),
    codigo_barras VARCHAR(50) UNIQUE,
    preco_venda NUMERIC(10,2),
    estoque_minimo INTEGER NOT NULL DEFAULT 0,
    estoque_atual INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100)
);

ALTER TABLE movimentacoes_estoque
ADD COLUMN variacao_id UUID REFERENCES produto_variacoes(id);
