-- Adicionar coluna de porcentagem de lucro padrão na tabela de categorias
ALTER TABLE categorias
ADD COLUMN porcentagem_lucro_padrao NUMERIC(10,2);
