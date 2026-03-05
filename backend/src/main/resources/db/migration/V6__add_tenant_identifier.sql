-- V6: Adicionando suporte a Multi-tenancy na tabela de empresas
-- Cada empresa terá um identificador único amigável (slug) para resolver o schema

ALTER TABLE empresas
    ADD COLUMN IF NOT EXISTS tenant_identifier VARCHAR(50) UNIQUE;

-- Atualizar o registro inicial com o identifier padrão de dev
UPDATE empresas
    SET tenant_identifier = 'capital'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Índice para busca rápida por tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_empresas_tenant_identifier ON empresas(tenant_identifier);
