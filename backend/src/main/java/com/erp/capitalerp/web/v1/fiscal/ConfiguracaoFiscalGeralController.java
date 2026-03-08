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
    public ResponseEntity<ConfiguracaoFiscalGeralDTO> buscar(@RequestParam(required = false) java.util.UUID filialId) {
        return ResponseEntity.ok(service.buscarConfiguracao(filialId));
    }

    @PostMapping
    public ResponseEntity<ConfiguracaoFiscalGeralDTO> salvar(@RequestBody ConfiguracaoFiscalGeralDTO dto) {
        return ResponseEntity.ok(service.salvarConfiguracao(dto));
    }

    @GetMapping("/certificado-info")
    public ResponseEntity<Map<String, Object>> getCertificadoInfo(@RequestParam(required = false) java.util.UUID filialId) {
        return ResponseEntity.ok(service.getCertificadoInfo(filialId));
    }

    @PostMapping("/download-certificado/{filialId}")
    public ResponseEntity<byte[]> downloadCertificado(@PathVariable java.util.UUID filialId, @RequestBody Map<String, String> body) {
        String senha = body.get("senha");
        byte[] certData = service.downloadCertificado(filialId, senha);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificado.pfx\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                .body(certData);
    }
}
