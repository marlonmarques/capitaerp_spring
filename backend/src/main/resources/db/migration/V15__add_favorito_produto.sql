-- V15: adicionar campo favorito em produtos
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS favorito BOOLEAN NOT NULL DEFAULT FALSE;

-- Índice para busca rápida de favoritos (útil no PDV)
CREATE INDEX IF NOT EXISTS idx_produtos_favorito ON produtos (favorito) WHERE favorito = TRUE;
