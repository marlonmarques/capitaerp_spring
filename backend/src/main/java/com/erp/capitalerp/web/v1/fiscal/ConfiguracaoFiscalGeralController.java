package com.erp.capitalerp.web.v1.fiscal;

import com.erp.capitalerp.application.fiscal.ConfiguracaoFiscalGeralService;
import com.erp.capitalerp.application.fiscal.dto.ConfiguracaoFiscalGeralDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/fiscal/config-geral")
public class ConfiguracaoFiscalGeralController {

    private final ConfiguracaoFiscalGeralService service;

    public ConfiguracaoFiscalGeralController(ConfiguracaoFiscalGeralService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ConfiguracaoFiscalGeralDTO> buscar() {
        return ResponseEntity.ok(service.buscarConfiguracao());
    }

    @PostMapping
    public ResponseEntity<ConfiguracaoFiscalGeralDTO> salvar(@RequestBody ConfiguracaoFiscalGeralDTO dto) {
        return ResponseEntity.ok(service.salvarConfiguracao(dto));
    }

    @GetMapping("/certificado-info")
    public ResponseEntity<Map<String, Object>> getCertificadoInfo() {
        return ResponseEntity.ok(service.getCertificadoInfo());
    }
}
