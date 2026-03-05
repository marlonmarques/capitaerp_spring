-- =======================================================
-- DADOS DE EXEMPLO PARA DESENVOLVIMENTO - Capital ERP
-- Executado pelo H2Config (ApplicationRunner) no perfil dev
-- Senha padrão de todos os usuários: 123456
-- Hash bcrypt: $2a$10$eACCYoNOHEqXve8aIWT8Nu3PkMXWBaOxJ9aORUYzfMQCbVBIhZ8tG
-- =======================================================

-- ROLES
INSERT INTO tb_role (authority) VALUES ('ROLE_OPERATOR');
INSERT INTO tb_role (authority) VALUES ('ROLE_ADMIN');

-- USUÁRIOS
-- Admin: admin@capital.com / 123456
INSERT INTO tb_user (first_name, last_name, email, password) VALUES ('Admin', 'Capital', 'admin@capital.com', '$2a$10$eACCYoNOHEqXve8aIWT8Nu3PkMXWBaOxJ9aORUYzfMQCbVBIhZ8tG');
-- Operador: maria@capital.com / 123456
INSERT INTO tb_user (first_name, last_name, email, password) VALUES ('Maria', 'Operadora', 'maria@capital.com', '$2a$10$eACCYoNOHEqXve8aIWT8Nu3PkMXWBaOxJ9aORUYzfMQCbVBIhZ8tG');

-- ROLES DOS USUÁRIOS (user_id 1 = Admin, user_id 2 = Maria)
INSERT INTO tb_user_role (user_id, role_id) VALUES (1, 1);
INSERT INTO tb_user_role (user_id, role_id) VALUES (1, 2);
INSERT INTO tb_user_role (user_id, role_id) VALUES (2, 1);

-- EMPRESA
INSERT INTO empresas (id, razao_social, nome_fantasia, cnpj, telefone, email, logo_url, tenant_identifier, criado_em) VALUES ('00000000-0000-0000-0000-000000000001', 'Capital ERP Desenvolvimento Ltda', 'Capital ERP Dev', '00.000.000/0001-00', '(11) 99999-0000', 'contato@capitalerp.dev', NULL, 'capital', NOW());

-- CATEGORIAS
INSERT INTO categorias (id, nome, criado_em) VALUES ('10000000-0000-0000-0000-000000000001', 'Eletrônicos', NOW());
INSERT INTO categorias (id, nome, criado_em) VALUES ('10000000-0000-0000-0000-000000000002', 'Informática', NOW());
INSERT INTO categorias (id, nome, criado_em) VALUES ('10000000-0000-0000-0000-000000000003', 'Periféricos', NOW());
INSERT INTO categorias (id, nome, criado_em) VALUES ('10000000-0000-0000-0000-000000000004', 'Acessórios', NOW());
INSERT INTO categorias (id, nome, criado_em) VALUES ('10000000-0000-0000-0000-000000000005', 'Componentes', NOW());

-- FORNECEDORES
INSERT INTO fornecedores (id, nome_fantasia, razao_social, cnpj, criado_em) VALUES ('20000000-0000-0000-0000-000000000001', 'TechSupply', 'Tech Supply Distribuidora Ltda', '11.222.333/0001-44', NOW());
INSERT INTO fornecedores (id, nome_fantasia, razao_social, cnpj, criado_em) VALUES ('20000000-0000-0000-0000-000000000002', 'InfoParts', 'InfoParts Comércio de Peças SA', '55.666.777/0001-88', NOW());
INSERT INTO fornecedores (id, nome_fantasia, razao_social, cnpj, criado_em) VALUES ('20000000-0000-0000-0000-000000000003', 'GlobalTech', 'GlobalTech Importadora Ltda', '99.000.111/0001-22', NOW());

-- PRODUTOS (incluindo novas colunas: tem_variacoes, unidade_medida, origem, favorito)
INSERT INTO produtos (id, nome, descricao, codigo_barras, codigo_ncm, preco_venda, preco_custo, estoque_minimo, estoque_atual, status, unidade_medida, origem, tem_variacoes, favorito, aliquota_icms, aliquota_pis, aliquota_cofins, cst_icms, cst_pis, cst_cofins, cfop, categoria_id, fornecedor_id, criado_em) VALUES ('30000000-0000-0000-0000-000000000001', 'Notebook Dell Inspiron 15', 'Notebook Dell Inspiron 15 3000, Intel Core i5, 8GB RAM, 256GB SSD', '7891234567890', '8471300', 3499.90, 2800.00, 3, 15, 'ATIVO', 'UN', 'NACIONAL', FALSE, FALSE, 12.00, 0.65, 3.00, '00', '01', '01', '5102', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', NOW());
INSERT INTO produtos (id, nome, descricao, codigo_barras, codigo_ncm, preco_venda, preco_custo, estoque_minimo, estoque_atual, status, unidade_medida, origem, tem_variacoes, favorito, aliquota_icms, aliquota_pis, aliquota_cofins, cst_icms, cst_pis, cst_cofins, cfop, categoria_id, fornecedor_id, criado_em) VALUES ('30000000-0000-0000-0000-000000000002', 'Monitor LG 24" Full HD', 'Monitor LG 24MK430H, IPS, 75Hz, HDMI/VGA', '7891234567891', '8528490', 1199.90, 890.00, 2, 8, 'ATIVO', 'UN', 'NACIONAL', FALSE, TRUE, 12.00, 0.65, 3.00, '00', '01', '01', '5102', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', NOW());
INSERT INTO produtos (id, nome, descricao, codigo_barras, codigo_ncm, preco_venda, preco_custo, estoque_minimo, estoque_atual, status, unidade_medida, origem, tem_variacoes, favorito, aliquota_icms, aliquota_pis, aliquota_cofins, cst_icms, cst_pis, cst_cofins, cfop, categoria_id, fornecedor_id, criado_em) VALUES ('30000000-0000-0000-0000-000000000003', 'Teclado Mecânico Redragon Kumara', 'Teclado mecânico gamer RGB, switch Red, layout ABNT2', '7891234567892', '8471600', 289.90, 180.00, 5, 22, 'ATIVO', 'UN', 'NACIONAL', FALSE, TRUE, 12.00, 0.65, 3.00, '00', '01', '01', '5102', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', NOW());
INSERT INTO produtos (id, nome, descricao, codigo_barras, codigo_ncm, preco_venda, preco_custo, estoque_minimo, estoque_atual, status, unidade_medida, origem, tem_variacoes, favorito, aliquota_icms, aliquota_pis, aliquota_cofins, cst_icms, cst_pis, cst_cofins, cfop, categoria_id, fornecedor_id, criado_em) VALUES ('30000000-0000-0000-0000-000000000004', 'Mouse Logitech MX Master 3', 'Mouse sem fio, 4000 DPI, ergonômico, recarga USB-C', '7891234567893', '8471600', 449.90, 320.00, 5, 3, 'ATIVO', 'UN', 'NACIONAL', FALSE, FALSE, 12.00, 0.65, 3.00, '00', '01', '01', '5102', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', NOW());
INSERT INTO produtos (id, nome, descricao, codigo_barras, codigo_ncm, preco_venda, preco_custo, estoque_minimo, estoque_atual, status, unidade_medida, origem, tem_variacoes, favorito, aliquota_icms, aliquota_pis, aliquota_cofins, cst_icms, cst_pis, cst_cofins, cfop, categoria_id, fornecedor_id, criado_em) VALUES ('30000000-0000-0000-0000-000000000005', 'Webcam Logitech C920 HD Pro', 'Webcam Full HD 1080p, microfone estéreo embutido, USB', '7891234567894', '8525800', 599.90, 420.00, 3, 12, 'ATIVO', 'UN', 'NACIONAL', FALSE, FALSE, 12.00, 0.65, 3.00, '00', '01', '01', '5102', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', NOW());
INSERT INTO produtos (id, nome, descricao, codigo_barras, codigo_ncm, preco_venda, preco_custo, estoque_minimo, estoque_atual, status, unidade_medida, origem, tem_variacoes, favorito, aliquota_icms, aliquota_pis, aliquota_cofins, cst_icms, cst_pis, cst_cofins, cfop, categoria_id, fornecedor_id, criado_em) VALUES ('30000000-0000-0000-0000-000000000006', 'SSD Kingston 480GB SATA', 'SSD Kingston A400, 480GB, SATA III, 500MB/s leitura', '7891234567895', '8471700', 229.90, 150.00, 5, 0, 'INATIVO', 'UN', 'NACIONAL', FALSE, FALSE, 12.00, 0.65, 3.00, '00', '01', '01', '5102', '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', NOW());
INSERT INTO produtos (id, nome, descricao, codigo_barras, codigo_ncm, preco_venda, preco_custo, estoque_minimo, estoque_atual, status, unidade_medida, origem, tem_variacoes, favorito, aliquota_icms, aliquota_pis, aliquota_cofins, cst_icms, cst_pis, cst_cofins, cfop, categoria_id, fornecedor_id, criado_em) VALUES ('30000000-0000-0000-0000-000000000007', 'Headset Corsair HS50 Pro', 'Headset gamer stereo, drivers 50mm, microfone removível', '7891234567896', '8518300', 349.90, 240.00, 3, 7, 'ATIVO', 'UN', 'NACIONAL', FALSE, FALSE, 12.00, 0.65, 3.00, '00', '01', '01', '5102', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', NOW());
INSERT INTO produtos (id, nome, descricao, codigo_barras, codigo_ncm, preco_venda, preco_custo, estoque_minimo, estoque_atual, status, unidade_medida, origem, tem_variacoes, favorito, aliquota_icms, aliquota_pis, aliquota_cofins, cst_icms, cst_pis, cst_cofins, cfop, categoria_id, fornecedor_id, criado_em) VALUES ('30000000-0000-0000-0000-000000000008', 'Cabo HDMI 2.0 2m Gold', 'Cabo HDMI 2.0 2 metros, suporte 4K 60Hz, conector banhado a ouro', '7891234567897', '8544428', 49.90, 18.00, 10, 45, 'ATIVO', 'UN', 'NACIONAL', FALSE, FALSE, 12.00, 0.65, 3.00, '00', '01', '01', '5102', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', NOW());

-- SERVIÇOS
INSERT INTO servicos (id, nome, descricao, codigo_interno, preco, status, aliquota_iss, criado_em) VALUES ('40000000-0000-0000-0000-000000000001', 'Formatação e Reinstalação', 'Formatação completa e reinstalação do sistema operacional', 'SERV-001', 180.00, 'ATIVO', 3.00, NOW());
INSERT INTO servicos (id, nome, descricao, codigo_interno, preco, status, aliquota_iss, criado_em) VALUES ('40000000-0000-0000-0000-000000000002', 'Suporte Remoto Mensal', 'Plano mensal de suporte técnico remoto ilimitado', 'SERV-002', 250.00, 'ATIVO', 3.00, NOW());
INSERT INTO servicos (id, nome, descricao, codigo_interno, preco, status, aliquota_iss, criado_em) VALUES ('40000000-0000-0000-0000-000000000003', 'Manutenção Preventiva', 'Limpeza interna, troca de pasta térmica e testes de hardware', 'SERV-003', 120.00, 'ATIVO', 3.00, NOW());
INSERT INTO servicos (id, nome, descricao, codigo_interno, preco, status, aliquota_iss, criado_em) VALUES ('40000000-0000-0000-0000-000000000004', 'Consultoria em TI - hora', 'Consultoria técnica especializada cobrada por hora', 'SERV-004', 150.00, 'ATIVO', 3.00, NOW());