package com.erp.capitalerp.web.v1.shared;

import com.erp.capitalerp.application.shared.AuditService;
import com.erp.capitalerp.application.shared.dto.AuditLogDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/audit")
public class AuditResource {

    private final AuditService service;

    public AuditResource(AuditService service) {
        this.service = service;
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_OPERATOR')")
    @GetMapping
    public ResponseEntity<Page<AuditLogDTO>> findAll(
            @RequestParam(value = "entidade", required = false) String entidade,
            Pageable pageable) {
        Page<AuditLogDTO> list = service.findAllPaged(entidade, pageable);
        return ResponseEntity.ok().body(list);
    }
}
