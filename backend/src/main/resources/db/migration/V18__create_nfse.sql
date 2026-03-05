-- V18 — Nota Fiscal de Serviço Eletrônica (NFS-e)
CREATE TABLE nfse (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificação
    numero_rps      INTEGER NOT NULL,                     -- Número do RPS/Nota interna
    serie_rps       VARCHAR(10)  NOT NULL DEFAULT '1',
    numero_nfse     VARCHAR(20),                          -- Número gerado pela prefeitura
    codigo_verificacao VARCHAR(50),

    -- Status / Estado
    status          VARCHAR(30)  NOT NULL DEFAULT 'RASCUNHO',
    -- RASCUNHO, PROCESSANDO, AUTORIZADA, REJEITADA, CANCELADA

    -- Tomador (Cliente)
    cliente_id      BIGINT NOT NULL REFERENCES tb_cliente(id),
    emails_envio    TEXT,                                  -- JSON array de e-mails extras

    -- Dados do serviço
    natureza_operacao   VARCHAR(5) DEFAULT '1',
    discriminacao_servico TEXT NOT NULL,
    informacoes_complementares TEXT,
    codigo_cnae         VARCHAR(20),
    item_lc116          VARCHAR(10),                       -- Item LC 116/03 ex: "01.01"
    codigo_nbs          VARCHAR(20),                       -- Código NBS Padrão Nacional
    municipio_ibge      VARCHAR(10),                       -- IBGE da cidade prestação
    uf_prestacao        VARCHAR(2)  DEFAULT 'DF',
    exigibilidade_iss   SMALLINT DEFAULT 1,
    iss_retido          BOOLEAN NOT NULL DEFAULT FALSE,

    -- Datas
    data_emissao        DATE NOT NULL DEFAULT CURRENT_DATE,
    data_competencia    DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento     DATE,
    data_autorizacao    TIMESTAMP,
    data_cancelamento   TIMESTAMP,

    -- Valores (em centavos para evitar ponto flutuante) — armazenamos em NUMERIC mesmo
    valor_servicos      NUMERIC(15,2) NOT NULL DEFAULT 0,
    valor_desconto      NUMERIC(15,2) NOT NULL DEFAULT 0,
    aliquota_iss        NUMERIC(5,2)  NOT NULL DEFAULT 2.00,
    valor_iss           NUMERIC(15,2) NOT NULL DEFAULT 0,
    valor_iss_retido    NUMERIC(15,2) NOT NULL DEFAULT 0,
    valor_liquido       NUMERIC(15,2) NOT NULL DEFAULT 0,

    -- Protocolo / XML
    protocolo_lote      VARCHAR(100),
    xml_nfse            TEXT,            -- XML da NFS-e autorizada
    mensagem_retorno    TEXT,            -- Última mensagem da prefeitura

    -- Auditoria
    criado_em           TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMP,
    criado_por          VARCHAR(100),
    atualizado_por      VARCHAR(100)
);

-- Índices de busca
CREATE INDEX idx_nfse_status     ON nfse(status);
CREATE INDEX idx_nfse_cliente    ON nfse(cliente_id);
CREATE INDEX idx_nfse_data       ON nfse(data_emissao);
CREATE INDEX idx_nfse_numero_rps ON nfse(numero_rps);

-- Sequência para RPS (por empresa poderíamos ter por tenantId, mas usamos global aqui)
CREATE SEQUENCE nfse_rps_seq START WITH 1 INCREMENT BY 1;
