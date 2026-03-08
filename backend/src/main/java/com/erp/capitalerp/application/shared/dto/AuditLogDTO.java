package com.erp.capitalerp.application.shared.dto;

import com.erp.capitalerp.domain.shared.AuditLog;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

public class AuditLogDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private UUID id;
    private String autor;
    private String acao;
    private String entidade;
    private String detalhes;
    private LocalDateTime dataHora;
    private String ipOrigem;

    public AuditLogDTO() {}

    public AuditLogDTO(AuditLog entity) {
        this.id = entity.getId();
        this.autor = entity.getAutor();
        this.acao = entity.getAcao();
        this.entidade = entity.getEntidade();
        this.detalhes = entity.getDetalhes();
        this.dataHora = entity.getDataHora();
        this.ipOrigem = entity.getIpOrigem();
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

    public String getIpOrigem() { return ipOrigem; }
    public void setIpOrigem(String ipOrigem) { this.ipOrigem = ipOrigem; }
}
