package com.erp.capitalerp.web.v1.nfse;

import com.erp.capitalerp.application.nfse.ConfiguracaoNfceService;
import com.erp.capitalerp.application.nfse.dto.ConfiguracaoNfceDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/configuracao-nfce")
public class ConfiguracaoNfceController {

    private final ConfiguracaoNfceService service;

    public ConfiguracaoNfceController(ConfiguracaoNfceService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<ConfiguracaoNfceDTO> getConfig(@RequestParam(required = false) java.util.UUID filialId) {
        return ResponseEntity.ok(service.buscarConfiguracao(filialId));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<ConfiguracaoNfceDTO> updateConfig(@RequestBody ConfiguracaoNfceDTO dto) {
        return ResponseEntity.ok(service.salvarConfiguracao(dto));
    }
}
