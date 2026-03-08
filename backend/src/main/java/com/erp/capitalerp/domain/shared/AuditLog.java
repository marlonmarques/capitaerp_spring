package com.erp.capitalerp.domain.shared;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tb_audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String autor; // Quem fez

    @Column(nullable = false, length = 20)
    private String acao; // CREATE, UPDATE, DELETE, LOGIN, DOWNLOAD, etc.

    @Column(nullable = false)
    private String entidade; // Tabela ou Classe (ex: Cliente)

    @Column(columnDefinition = "TEXT")
    private String detalhes; // Como foi (JSON ou descrição das mudanças)

    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Column(length = 20)
    private String tenantIdentifier;

    @Column
    private String ipOrigem;

    public AuditLog() {
        this.dataHora = LocalDateTime.now();
    }

    public AuditLog(String autor, String acao, String entidade, String detalhes, String tenantIdentifier) {
        this();
        this.autor = autor;
        this.acao = acao;
        this.entidade = entidade;
        this.detalhes = detalhes;
        this.tenantIdentifier = tenantIdentifier;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }

    public String getAcao() { return acao; }
    public void setAcao(String acao) { this.acao = acao; }

    public String getEntidade() { return entidade; }
    public void setEntidade(String entidade) { this.entidade = entidade; }

    public String getDetalhes() { return detalhes; }
    public void setDetalhes(String detalhes) { this.detalhes = detalhes; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

    public String getTenantIdentifier() { return tenantIdentifier; }
    public void setTenantIdentifier(String tenantIdentifier) { this.tenantIdentifier = tenantIdentifier; }

    public String getIpOrigem() { return ipOrigem; }
    public void setIpOrigem(String ipOrigem) { this.ipOrigem = ipOrigem; }
}
