package com.erp.capitalerp.web.v1.nfse;

import com.erp.capitalerp.application.nfse.ConfiguracaoNfseService;
import com.erp.capitalerp.application.nfse.dto.ConfiguracaoNfseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/configuracao-nfse")
public class ConfiguracaoNfseController {

    private final ConfiguracaoNfseService service;

    public ConfiguracaoNfseController(ConfiguracaoNfseService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<ConfiguracaoNfseDTO> getConfig() {
        return ResponseEntity.ok(service.buscarConfiguracao());
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<ConfiguracaoNfseDTO> updateConfig(@RequestBody ConfiguracaoNfseDTO dto) {
        return ResponseEntity.ok(service.salvarConfiguracao(dto));
    }
}
