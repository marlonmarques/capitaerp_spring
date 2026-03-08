CREATE TABLE tb_audit_log (
    id UUID PRIMARY KEY,
    autor VARCHAR(255) NOT NULL,
    acao VARCHAR(20) NOT NULL,
    entidade VARCHAR(255) NOT NULL,
    detalhes TEXT,
    data_hora TIMESTAMP NOT NULL,
    tenant_identifier VARCHAR(20),
    ip_origem VARCHAR(20)
);

CREATE INDEX idx_audit_tenant ON tb_audit_log(tenant_identifier);
CREATE INDEX idx_audit_entidade ON tb_audit_log(entidade, tenant_identifier);
