-- V29 — Nota Fiscal de Produto (NFe 55 e NFCe 65)
CREATE TABLE tb_nfe (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_identifier VARCHAR(100),
    filial_id       UUID,
    modelo          VARCHAR(10) NOT NULL DEFAULT 'NFE',
    numero          INTEGER NOT NULL,
    serie           VARCHAR(10) NOT NULL DEFAULT '1',
    codigo_aleatorio VARCHAR(8),
    natureza_operacao VARCHAR(60) DEFAULT 'VENDA DE MERCADORIA',
    status          VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO',
    cliente_id      BIGINT REFERENCES tb_cliente(id),
    chave_nfe       VARCHAR(44),
    protocolo_nfe   VARCHAR(100),
    protocolo_lote  VARCHAR(100),
    xml_processado  TEXT,
    mensagem_retorno TEXT,
    codigo_retorno  VARCHAR(10),
    data_emissao    TIMESTAMP NOT NULL DEFAULT NOW(),
    data_saida_entrada TIMESTAMP,
    data_autorizacao   TIMESTAMP,
    data_cancelamento  TIMESTAMP,
    tipo_nota       VARCHAR(10) DEFAULT 'SAIDA',
    ambiente        VARCHAR(20) DEFAULT 'HOMOLOGACAO',
    finalidade      VARCHAR(20) DEFAULT 'NORMAL',
    indicador_presenca INTEGER DEFAULT 9,
    indicador_final INTEGER DEFAULT 1,
    informacoes_fisco TEXT,
    informacoes_complementares TEXT,
    
    -- Totais
    valor_total_nota     NUMERIC(15,2) DEFAULT 0,
    valor_total_produtos NUMERIC(15,2) DEFAULT 0,
    valor_frete          NUMERIC(15,2) DEFAULT 0,
    valor_seguro         NUMERIC(15,2) DEFAULT 0,
    valor_desconto       NUMERIC(15,2) DEFAULT 0,
    valor_outros         NUMERIC(15,2) DEFAULT 0,
    valor_base_calculo_icms NUMERIC(15,2) DEFAULT 0,
    valor_icms           NUMERIC(15,2) DEFAULT 0,
    
    -- Auditoria
    criado_em       TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP,
    criado_por      VARCHAR(100),
    atualizado_por  VARCHAR(100)
);

CREATE TABLE tb_nfe_item (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nota_id         UUID NOT NULL REFERENCES tb_nfe(id),
    produto_id      UUID REFERENCES tb_produto(id),
    codigo_produto  VARCHAR(60) NOT NULL,
    descricao       VARCHAR(120) NOT NULL,
    ncm             VARCHAR(8) NOT NULL,
    cfop            VARCHAR(4) NOT NULL,
    unidade_comercial VARCHAR(6) DEFAULT 'UN',
    quantidade_comercial NUMERIC(15,4) NOT NULL,
    valor_unitario_comercial NUMERIC(15,10) NOT NULL,
    valor_bruto     NUMERIC(15,2) NOT NULL,
    valor_desconto  NUMERIC(15,2) DEFAULT 0,
    valor_frete     NUMERIC(15,2) DEFAULT 0,
    valor_seguro    NUMERIC(15,2) DEFAULT 0,
    valor_outras_despesas NUMERIC(15,2) DEFAULT 0,
    valor_liquido   NUMERIC(15,2),
    
    -- Tributos
    origem          INTEGER DEFAULT 0,
    icms_cst        VARCHAR(3),
    icms_base_calculo NUMERIC(15,2) DEFAULT 0,
    icms_aliquota   NUMERIC(5,2) DEFAULT 0,
    icms_valor      NUMERIC(15,2) DEFAULT 0,
    
    pis_cst         VARCHAR(2) DEFAULT '01',
    pis_base_calculo NUMERIC(15,2) DEFAULT 0,
    pis_aliquota    NUMERIC(5,2) DEFAULT 0,
    pis_valor       NUMERIC(15,2) DEFAULT 0,
    
    cofins_cst      VARCHAR(2) DEFAULT '01',
    cofins_base_calculo NUMERIC(15,2) DEFAULT 0,
    cofins_aliquota NUMERIC(5,2) DEFAULT 0,
    cofins_valor    NUMERIC(15,2) DEFAULT 0,
    
    ipi_cst         VARCHAR(2) DEFAULT '99',
    ipi_enquadramento VARCHAR(3) DEFAULT '999',
    ipi_base_calculo NUMERIC(15,2) DEFAULT 0,
    ipi_aliquota    NUMERIC(5,2) DEFAULT 0,
    ipi_valor       NUMERIC(15,2) DEFAULT 0
);

CREATE TABLE tb_nfe_pagamento (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nota_id         UUID NOT NULL REFERENCES tb_nfe(id),
    tipo_pagamento  VARCHAR(2) NOT NULL,
    valor_pagamento NUMERIC(15,2) NOT NULL,
    indicador_pagamento INTEGER DEFAULT 0,
    bandeira_cartao VARCHAR(2),
    cnpj_credenciadora VARCHAR(14),
    codigo_autorizacao VARCHAR(60)
);

CREATE INDEX idx_nfe_tenant ON tb_nfe(tenant_identifier);
CREATE INDEX idx_nfe_status ON tb_nfe(status);
CREATE INDEX idx_nfe_cliente ON tb_nfe(cliente_id);
CREATE INDEX idx_nfe_data ON tb_nfe(data_emissao);
