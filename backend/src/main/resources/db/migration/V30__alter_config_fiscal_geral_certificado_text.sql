-- Alterar coluna certificado para TEXT para suportar base64 longo do certificado digital
ALTER TABLE config_fiscal_geral ALTER COLUMN certificado TYPE TEXT;
