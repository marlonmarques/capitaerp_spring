-- ============================================================
-- V14 — Produto Robusto + Variações Completas
-- Integração com GrupoTributario | Soft-Delete | Atributos ricos
-- ============================================================

-- 1. Adicionar colunas novas à tabela produtos
ALTER TABLE produtos
    ADD COLUMN IF NOT EXISTS deletado_em       TIMESTAMP,
    ADD COLUMN IF NOT EXISTS grupo_tributario_id UUID REFERENCES grupos_tributarios(id),
    ADD COLUMN IF NOT EXISTS unidade_medida    VARCHAR(20) NOT NULL DEFAULT 'UN',
    ADD COLUMN IF NOT EXISTS peso_bruto        NUMERIC(10, 4),
    ADD COLUMN IF NOT EXISTS peso_liquido      NUMERIC(10, 4),
    ADD COLUMN IF NOT EXISTS largura_cm        NUMERIC(8, 2),
    ADD COLUMN IF NOT EXISTS altura_cm         NUMERIC(8, 2),
    ADD COLUMN IF NOT EXISTS profundidade_cm   NUMERIC(8, 2),
    ADD COLUMN IF NOT EXISTS origem            VARCHAR(30) NOT NULL DEFAULT 'NACIONAL',
    ADD COLUMN IF NOT EXISTS tem_variacoes     BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS imagem_url        VARCHAR(500),
    ADD COLUMN IF NOT EXISTS imagens_urls      TEXT;       -- JSON array de URLs

-- Remover os campos de imposto individuais — agora gerenciados pelo GrupoTributario
-- (mantemos apenas as colunas legado como nullable para não quebrar dados antigos)
-- Os campos aliquota_icms, aliquota_pis, aliquota_cofins, cst_icms, cst_pis, cst_cofins, cfop
-- ficam deprecados mas existem na tabela para compatibilidade de histórico.

-- 2. Recriar a tabela de variações com estrutura completa
DROP TABLE IF EXISTS produto_variacoes CASCADE;

CREATE TABLE produto_variacoes (
    id                  UUID PRIMARY KEY,
    produto_id          UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,

    -- Identificação da variação
    nome_variacao       VARCHAR(255),          -- Ex: "P / Azul Marinho / 110V"
    sku                 VARCHAR(100) UNIQUE,   -- Código interno (SKU)
    codigo_barras       VARCHAR(50) UNIQUE,

    -- Preço e custo (opcional: herda do produto-pai se nulo)
    preco_custo         NUMERIC(10, 2),
    preco_venda         NUMERIC(10, 2),
    margem_lucro        NUMERIC(5, 2),

    -- Estoque
    estoque_minimo      INTEGER NOT NULL DEFAULT 0,
    estoque_atual       INTEGER NOT NULL DEFAULT 0,

    -- Status
    ativo               BOOLEAN NOT NULL DEFAULT TRUE,
    imagem_url          VARCHAR(500),

    -- Auditoria
    criado_em           TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMP,
    criado_por          VARCHAR(100),
    atualizado_por      VARCHAR(100)
);

-- 3. Tabela de atributos da variação (Ex: Cor=Azul, Tamanho=P, Voltagem=110V)
CREATE TABLE produto_variacao_atributos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variacao_id     UUID NOT NULL REFERENCES produto_variacoes(id) ON DELETE CASCADE,
    tipo            VARCHAR(60) NOT NULL,  -- Ex: COR, TAMANHO, VOLTAGEM, MATERIAL, SABOR, etc.
    valor           VARCHAR(120) NOT NULL  -- Ex: Azul Marinho, P, 110V, Couro
);

-- 4. Adicionar variacao_id à movimentação de estoque (se não existia via cascade)
ALTER TABLE movimentacoes_estoque
    ADD COLUMN IF NOT EXISTS variacao_id UUID REFERENCES produto_variacoes(id);

-- 5. Índices de performance
CREATE INDEX IF NOT EXISTS idx_produtos_deletado_em       ON produtos(deletado_em);
CREATE INDEX IF NOT EXISTS idx_produtos_grupo_tributario   ON produtos(grupo_tributario_id);
CREATE INDEX IF NOT EXISTS idx_produto_variacoes_produto   ON produto_variacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_produto_var_atribs_variacao ON produto_variacao_atributos(variacao_id);
