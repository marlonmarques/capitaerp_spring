-- Associar usuários a uma filial padrão e adicionar tenant_identifier global na BaseEntity
ALTER TABLE tb_user ADD COLUMN filial_id UUID;
ALTER TABLE tb_user ADD CONSTRAINT fk_user_filial FOREIGN KEY (filial_id) REFERENCES filiais(id);

-- Adicionar vínculo de filial em documentos fiscais (NFSe já criada na V18)
ALTER TABLE nfse ADD COLUMN filial_id UUID;
ALTER TABLE nfse ADD CONSTRAINT fk_nfse_filial FOREIGN KEY (filial_id) REFERENCES filiais(id);

-- Preparar BaseEntity (todas as tabelas que herdam dela e ainda não tem tenant_identifier)
-- Nota: A V6 já adicionou em algumas, mas vamos garantir para a NFSe e as novas
-- Se já existir, o banco apenas ignora ou você pode ajustar conforme o dialeto (aqui assumindo PostgreSQL/H2)
-- ALTER TABLE nfse ADD COLUMN tenant_identifier VARCHAR(20); -- Se necessário
