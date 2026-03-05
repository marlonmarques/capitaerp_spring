package com.erp.capitalerp.web.v1.cadastros;

import com.erp.capitalerp.application.cadastros.EmpresaService;
import com.erp.capitalerp.application.cadastros.dto.EmpresaDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/v1/empresas")
public class EmpresaController {

    private final EmpresaService service;

    public EmpresaController(EmpresaService service) {
        this.service = service;
    }

    @GetMapping("/configuracao")
    public ResponseEntity<EmpresaDTO> obterConfiguracaoAtual() {
        EmpresaDTO dto = service.obterConfiguracao();
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PutMapping("/configuracao")
    public ResponseEntity<EmpresaDTO> atualizarConfiguracao(@RequestBody EmpresaDTO dto) {
        EmpresaDTO salvo = service.salvarOuAtualizar(dto);
        return ResponseEntity.ok(salvo);
    }
}
