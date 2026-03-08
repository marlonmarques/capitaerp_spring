package com.erp.capitalerp.domain.nfe;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "nfe_eventos")
public class NotaFiscalProdutoEvento {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "nfe_id", nullable = false)
    private UUID nfeId;

    @Column(length = 10)
    private String codigo;

    @Column(length = 2000)
    private String nome;

    private Integer sequencia;

    @Column(name = "data_evento")
    private LocalDateTime dataEvento;

    @Column(columnDefinition = "TEXT")
    private String xmlEvento;

    @Column(name = "tenant_identifier")
    private String tenantIdentifier;

    @PrePersist
    public void prePersist() {
        if (dataEvento == null) {
            dataEvento = LocalDateTime.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getNfeId() {
        return nfeId;
    }

    public void setNfeId(UUID nfeId) {
        this.nfeId = nfeId;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Integer getSequencia() {
        return sequencia;
    }

    public void setSequencia(Integer sequencia) {
        this.sequencia = sequencia;
    }

    public LocalDateTime getDataEvento() {
        return dataEvento;
    }

    public void setDataEvento(LocalDateTime dataEvento) {
        this.dataEvento = dataEvento;
    }

    public String getXmlEvento() {
        return xmlEvento;
    }

    public void setXmlEvento(String xmlEvento) {
        this.xmlEvento = xmlEvento;
    }

    public String getTenantIdentifier() {
        return tenantIdentifier;
    }

    public void setTenantIdentifier(String tenantIdentifier) {
        this.tenantIdentifier = tenantIdentifier;
    }
}
