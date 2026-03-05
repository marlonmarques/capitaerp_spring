-- V17 — Multiplos Locais de Estoque, Saldos e Transferencias
CREATE TABLE locais_estoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100)
);

-- Inserir um local padrão
INSERT INTO locais_estoque (nome, descricao) VALUES ('Estoque Principal', 'Local de estoque padrão do sistema');

CREATE TABLE estoque_saldos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    variacao_id UUID REFERENCES produto_variacoes(id) ON DELETE CASCADE,
    local_estoque_id UUID NOT NULL REFERENCES locais_estoque(id),
    quantidade INTEGER NOT NULL DEFAULT 0,
    estoque_minimo INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100),
    -- Garante unicidade por produto/variacao/local
    UNIQUE(produto_id, variacao_id, local_estoque_id)
);

-- Inicializar estoque_saldos com o estoque atual global existente (para produtos simples)
INSERT INTO estoque_saldos (produto_id, variacao_id, local_estoque_id, quantidade, estoque_minimo)
SELECT p.id, NULL, (SELECT id FROM locais_estoque LIMIT 1), p.estoque_atual, p.estoque_minimo
FROM produtos p WHERE p.tem_variacoes = false;

-- Inicializar estoque_saldos (para variacoes)
INSERT INTO estoque_saldos (produto_id, variacao_id, local_estoque_id, quantidade, estoque_minimo)
SELECT v.produto_id, v.id, (SELECT id FROM locais_estoque LIMIT 1), v.estoque_atual, v.estoque_minimo
FROM produto_variacoes v;

-- Atualizar Tabela de Movimentações
ALTER TABLE movimentacoes_estoque ADD COLUMN local_estoque_id UUID REFERENCES locais_estoque(id);
ALTER TABLE movimentacoes_estoque ADD COLUMN local_destino_id UUID REFERENCES locais_estoque(id);

UPDATE movimentacoes_estoque SET local_estoque_id = (SELECT id FROM locais_estoque LIMIT 1) WHERE local_estoque_id IS NULL;
-- Dependendo do caso de transferências no futuro, local_estoque_id poderia ser nulo se fosse uma entrada sem origem, mas para manter consistência, todas movimentações têm um local primário (onde a entrada ou saída ocorreu).
ALTER TABLE movimentacoes_estoque ALTER COLUMN local_estoque_id SET NOT NULL;
