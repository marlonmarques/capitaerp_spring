-- V19 — Fila de emissão assíncrona de NFS-e (equivalente ao Laravel Queue)
-- Persiste jobs de emissão para processamento assíncrono com retentativas e rastreabilidade.

CREATE TABLE fila_emissao_nfse (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Referência à NFS-e que será processada
    nfse_id         UUID NOT NULL REFERENCES nfse(id) ON DELETE CASCADE,

    -- Estado do job na fila
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    -- PENDENTE | PROCESSANDO | CONCLUIDO | FALHOU

    -- Controle de retentativas
    tentativas          INT NOT NULL DEFAULT 0,
    max_tentativas      INT NOT NULL DEFAULT 3,
    proximo_tentativa_em TIMESTAMP,

    -- Tipo de operação (extensível para NFe, CT-e, cancelamento etc)
    tipo_operacao   VARCHAR(30) NOT NULL DEFAULT 'EMISSAO',
    -- EMISSAO | CANCELAMENTO | CONSULTA

    -- Resultado / mensagem de erro da última tentativa
    erro            TEXT,
    resultado       TEXT,

    -- Auditoria
    criado_em       TIMESTAMP NOT NULL DEFAULT NOW(),
    iniciado_em     TIMESTAMP,
    concluido_em    TIMESTAMP,
    criado_por      VARCHAR(100)
);

-- Índices essenciais para o scheduler
CREATE INDEX idx_fila_nfse_status   ON fila_emissao_nfse(status);
CREATE INDEX idx_fila_nfse_nfse_id  ON fila_emissao_nfse(nfse_id);
CREATE INDEX idx_fila_nfse_prox     ON fila_emissao_nfse(proximo_tentativa_em) WHERE status = 'PENDENTE';
