-- Ajusta o campo posicao_fiscal para armazenar o UUID da entidade PosicaoFiscal
-- O campo posicao_fiscal era Long (numérico legado), agora referencia UUID da tabela posicoes_fiscais
-- Renomeamos o antigo e criamos o novo campo VARCHAR(36)
ALTER TABLE tb_cliente RENAME COLUMN posicao_fiscal TO posicao_fiscal_legado;
ALTER TABLE tb_cliente ADD COLUMN posicao_fiscal_id VARCHAR(36);

-- Ajusta cod_pagto para ser BIGINT (já é, mas garantimos o nome correto no H2)
-- Sem alteração necessária pois cod_pagto já é Long compatível com o id de pagamento do SQLite
