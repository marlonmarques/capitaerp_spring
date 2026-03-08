package com.erp.capitalerp.application.shared;

import com.erp.capitalerp.application.shared.dto.AuditLogDTO;
import com.erp.capitalerp.config.multitenancy.TenantContext;
import com.erp.capitalerp.domain.shared.AuditLog;
import com.erp.capitalerp.infrastructure.persistence.shared.AuditRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditRepository auditRepository;
    private final ObjectMapper objectMapper;

    public AuditService(AuditRepository auditRepository, ObjectMapper objectMapper) {
        this.auditRepository = auditRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDTO> findAllPaged(String entidade, Pageable pageable) {
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) tenantId = "SISTEMA";
        
        Page<AuditLog> list;
        if (entidade != null && !entidade.isEmpty() && !entidade.equalsIgnoreCase("null")) {
            list = auditRepository.findByEntidadeAndTenantIdentifierOrderByDataHoraDesc(entidade, tenantId, pageable);
        } else {
            list = auditRepository.findByTenantIdentifierOrderByDataHoraDesc(tenantId, pageable);
        }
        
        return list.map(AuditLogDTO::new);
    }

    /**
     * Registra uma ação de auditoria no sistema.
     * @param acao Ação realizada (CREATE, UPDATE, DELETE, etc.)
     * @param entidade Nome da entidade/módulo (ex: Cliente)
     * @param objeto O objeto que foi alterado para rastreio do estado "COMO FOI"
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(String acao, String entidade, Object objeto) {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            String autor = (auth != null) ? auth.getName() : "SISTEMA";
            
            String detalhes = objeto != null ? objectMapper.writeValueAsString(objeto) : "Sem detalhes";
            
            // Captura do Tenant ID do contexto atual para isolamento
            String tenantId = com.erp.capitalerp.config.multitenancy.TenantContext.getCurrentTenant();
            if (tenantId == null) tenantId = "SISTEMA"; 
            
            AuditLog log = new AuditLog(autor, acao, entidade, detalhes, tenantId);
            auditRepository.save(log);
            
        } catch (Exception e) {
            // Em auditoria, não queremos estourar erro se a gravação do log falhar
            System.err.println("Falha ao gravar log de auditoria: " + e.getMessage());
        }
    }
}
