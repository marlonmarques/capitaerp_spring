package com.erp.capitalerp.web.v1.nfse;

import com.erp.capitalerp.application.nfse.ConfiguracaoNfeService;
import com.erp.capitalerp.application.nfse.dto.ConfiguracaoNfeDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/configuracao-nfe")
public class ConfiguracaoNfeController {

    private final ConfiguracaoNfeService service;

    public ConfiguracaoNfeController(ConfiguracaoNfeService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<ConfiguracaoNfeDTO> getConfig(@RequestParam(required = false) java.util.UUID filialId) {
        return ResponseEntity.ok(service.buscarConfiguracao(filialId));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<ConfiguracaoNfeDTO> updateConfig(@RequestBody ConfiguracaoNfeDTO dto) {
        return ResponseEntity.ok(service.salvarConfiguracao(dto));
    }
}
