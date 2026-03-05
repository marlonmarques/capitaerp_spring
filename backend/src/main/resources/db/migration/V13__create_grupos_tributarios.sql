-- ============================================================
-- V13 — Grupos Tributários (Impostos)
-- Inclui campos para legislação atual e Reforma Tributária (EC 132/2023)
-- IBS = Imposto sobre Bens e Serviços (substituirá ICMS+ISS a partir de 2026)
-- CBS = Contribuição sobre Bens e Serviços (substituirá PIS+COFINS a partir de 2026)
-- IS  = Imposto Seletivo (extrafiscal — cigarros, bebidas, veículos de luxo)
-- ============================================================

CREATE TABLE grupos_tributarios (
    -- Identificação
    id                      UUID PRIMARY KEY,
    nome                    VARCHAR(120) NOT NULL,
    descricao               TEXT,
    regime                  VARCHAR(30) NOT NULL,
    tipo_imposto            VARCHAR(30) NOT NULL,
    ativo                   BOOLEAN NOT NULL DEFAULT TRUE,

    -- ICMS
    cst_csosn               VARCHAR(4),
    aliquota_icms           NUMERIC(7, 4),
    reducao_base_icms       NUMERIC(7, 4),
    aliquota_difal          NUMERIC(7, 4),

    -- ICMS Substituição Tributária
    aliquota_st             NUMERIC(7, 4),
    mva                     NUMERIC(7, 4),
    reducao_base_st         NUMERIC(7, 4),

    -- IPI
    cst_ipi                 VARCHAR(3),
    aliquota_ipi            NUMERIC(7, 4),

    -- PIS
    cst_pis                 VARCHAR(3),
    aliquota_pis            NUMERIC(7, 4),

    -- COFINS
    cst_cofins              VARCHAR(3),
    aliquota_cofins         NUMERIC(7, 4),

    -- ISS
    aliquota_iss            NUMERIC(7, 4),
    reter_iss               BOOLEAN DEFAULT FALSE,

    -- CFOP padrão
    cfop_saida              VARCHAR(6),
    cfop_entrada            VARCHAR(6),

    -- REFORMA TRIBUTÁRIA (EC 132/2023) — campos prontos para quando entrar em vigor
    aliquota_ibs            NUMERIC(7, 4),   -- substitui ICMS + ISS (estadual+municipal)
    aliquota_cbs            NUMERIC(7, 4),   -- substitui PIS + COFINS (federal)
    aliquota_is             NUMERIC(7, 4),   -- Imposto Seletivo (extrafiscal)
    codigo_is               VARCHAR(10),     -- Código do bem para IS
    regime_especial_reforma VARCHAR(50),     -- Ex: monofásico, diferenciado

    -- Auditoria
    criado_em               TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em           TIMESTAMP,
    criado_por              VARCHAR(100),
    atualizado_por          VARCHAR(100)
);

CREATE INDEX idx_grupos_tributarios_regime    ON grupos_tributarios(regime);
CREATE INDEX idx_grupos_tributarios_tipo      ON grupos_tributarios(tipo_imposto);
CREATE INDEX idx_grupos_tributarios_ativo     ON grupos_tributarios(ativo);

-- ============================================================
-- DADOS INICIAIS — equivalentes ao sistema PHP (screenshot)
-- Simples Nacional
-- ============================================================

INSERT INTO grupos_tributarios (
    id, nome, descricao, regime, tipo_imposto, ativo,
    cst_csosn, aliquota_icms, cst_pis, aliquota_pis, cst_cofins, aliquota_cofins,
    cfop_saida, cfop_entrada, criado_em
) VALUES
(gen_random_uuid(), 'SN 18% — Saída', 'Simples Nacional — saída interna tributada 18%', 'SIMPLES_NACIONAL', 'SIMPLES', true,
 '400', 18.0000, '07', 0.0000, '07', 0.0000, '5102', '1102', NOW()),

(gen_random_uuid(), 'SN Isento — Saída', 'Simples Nacional — operação não tributada', 'SIMPLES_NACIONAL', 'SIMPLES', true,
 '400', 0.0000, '07', 0.0000, '07', 0.0000, '5102', '1102', NOW()),

(gen_random_uuid(), 'SN 12% — Interestadual', 'Simples Nacional — saída interestadual 12%', 'SIMPLES_NACIONAL', 'SIMPLES', true,
 '400', 12.0000, '07', 0.0000, '07', 0.0000, '6102', '2102', NOW()),

-- ============================================================
-- Lucro Presumido / Lucro Real — ICMS
-- ============================================================

(gen_random_uuid(), 'ICMS Saída Interno 17%', 'ICMS saída operação interna 17%', 'LUCRO_PRESUMIDO', 'ICMS', true,
 '00', 17.0000, '01', 0.6500, '01', 3.0000, '5102', '1102', NOW()),

(gen_random_uuid(), 'ICMS Saída Interno 18%', 'ICMS saída operação interna 18%', 'LUCRO_PRESUMIDO', 'ICMS', true,
 '00', 18.0000, '01', 0.6500, '01', 3.0000, '5102', '1102', NOW()),

(gen_random_uuid(), 'ICMS Interestadual 7%', 'ICMS saída interestadual — estados menos desenvolvidos', 'LUCRO_PRESUMIDO', 'ICMS', true,
 '00', 7.0000, '01', 0.6500, '01', 3.0000, '6102', '2102', NOW()),

(gen_random_uuid(), 'ICMS Interestadual 12%', 'ICMS saída interestadual — estados mais desenvolvidos', 'LUCRO_PRESUMIDO', 'ICMS', true,
 '00', 12.0000, '01', 0.6500, '01', 3.0000, '6102', '2102', NOW()),

(gen_random_uuid(), 'ICMS Entrada Externo 7%', 'ICMS entrada interestadual 7%', 'LUCRO_PRESUMIDO', 'ICMS', true,
 '00', 7.0000, '50', 0.0000, '50', 0.0000, NULL, '2102', NOW()),

(gen_random_uuid(), 'ICMS Entrada Externo 12%', 'ICMS entrada interestadual 12%', 'LUCRO_PRESUMIDO', 'ICMS', true,
 '00', 12.0000, '50', 0.0000, '50', 0.0000, NULL, '2102', NOW()),

(gen_random_uuid(), 'ICMS Entrada Interno 19%', 'ICMS entrada interna 19%', 'LUCRO_PRESUMIDO', 'ICMS', true,
 '00', 19.0000, '50', 0.0000, '50', 0.0000, NULL, '1102', NOW()),

(gen_random_uuid(), 'ICMS Isento', 'Operação isenta de ICMS (CST 40)', 'LUCRO_PRESUMIDO', 'ICMS', true,
 '40', 0.0000, '01', 0.6500, '01', 3.0000, '5102', '1102', NOW()),

-- ============================================================
-- ICMS Substituição Tributária
-- ============================================================

(gen_random_uuid(), 'ICMS ST Saída 18%', 'ICMS com Substituição Tributária — alíquota interna 18%', 'LUCRO_PRESUMIDO', 'ICMS_ST', true,
 '10', 18.0000, '01', 0.6500, '01', 3.0000, '5401', '1401', NOW()),

(gen_random_uuid(), 'ICMS ST Saída 12%', 'ICMS com Substituição Tributária — alíquota interestadual 12%', 'LUCRO_PRESUMIDO', 'ICMS_ST', true,
 '10', 12.0000, '01', 0.6500, '01', 3.0000, '6401', '2401', NOW()),

-- ============================================================
-- IPI
-- ============================================================

(gen_random_uuid(), 'IPI Saída 3%', 'IPI — produto industrializado saída 3%', 'LUCRO_PRESUMIDO', 'IPI', true,
 '00', 0.0000, '01', 0.6500, '01', 3.0000, '5101', '1101', NOW()),

(gen_random_uuid(), 'IPI Saída 5%', 'IPI — produto industrializado saída 5%', 'LUCRO_PRESUMIDO', 'IPI', true,
 '00', 0.0000, '01', 0.6500, '01', 3.0000, '5101', '1101', NOW()),

(gen_random_uuid(), 'IPI Entrada 5%', 'IPI — produto industrializado entrada 5%', 'LUCRO_PRESUMIDO', 'IPI', true,
 '00', 0.0000, '50', 0.0000, '50', 0.0000, NULL, '1101', NOW()),

(gen_random_uuid(), 'IPI Isento', 'IPI — produto isento (CST 53)', 'LUCRO_PRESUMIDO', 'IPI', true,
 '00', 0.0000, '01', 0.6500, '01', 3.0000, '5102', '1102', NOW()),

-- ============================================================
-- ISS (Serviços)
-- ============================================================

(gen_random_uuid(), 'ISS 2%', 'ISS — Imposto Sobre Serviços 2%', 'SIMPLES_NACIONAL', 'ISS', true,
 NULL, NULL, '07', 0.0000, '07', 0.0000, NULL, NULL, NOW()),

(gen_random_uuid(), 'ISS 5%', 'ISS — Imposto Sobre Serviços 5%', 'LUCRO_PRESUMIDO', 'ISS', true,
 NULL, NULL, '01', 0.6500, '01', 3.0000, NULL, NULL, NOW()),

(gen_random_uuid(), 'ISS Retido 5%', 'ISS 5% com retenção na fonte', 'LUCRO_PRESUMIDO', 'ISS', true,
 NULL, NULL, '01', 0.6500, '01', 3.0000, NULL, NULL, NOW()),

-- ============================================================
-- REGIME TRIBUTÁRIO — PIS/COFINS autônomos
-- ============================================================

(gen_random_uuid(), 'PIS/COFINS Não Cumulativo', 'PIS 1,65% + COFINS 7,60% — regime não cumulativo', 'LUCRO_REAL', 'PIS_COFINS', true,
 NULL, NULL, '01', 1.6500, '01', 7.6000, NULL, NULL, NOW()),

(gen_random_uuid(), 'PIS/COFINS Cumulativo', 'PIS 0,65% + COFINS 3,00% — regime cumulativo', 'LUCRO_PRESUMIDO', 'PIS_COFINS', true,
 NULL, NULL, '01', 0.6500, '01', 3.0000, NULL, NULL, NOW()),

(gen_random_uuid(), 'Isento / Não Tributado', 'Operações isentas de impostos (ex: exportação)', 'LUCRO_PRESUMIDO', 'ISENTO', true,
 '40', 0.0000, '06', 0.0000, '06', 0.0000, '7101', '1101', NOW());
