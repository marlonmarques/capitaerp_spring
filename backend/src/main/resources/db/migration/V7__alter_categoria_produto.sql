ALTER TABLE categorias ADD COLUMN descricao VARCHAR(1000);
ALTER TABLE categorias ADD COLUMN tipo VARCHAR(50);
ALTER TABLE categorias ADD COLUMN categoria_pai_id UUID;
ALTER TABLE categorias ADD CONSTRAINT fk_categoria_pai FOREIGN KEY (categoria_pai_id) REFERENCES categorias(id);

ALTER TABLE produtos ADD COLUMN margem_lucro NUMERIC(5,2);
