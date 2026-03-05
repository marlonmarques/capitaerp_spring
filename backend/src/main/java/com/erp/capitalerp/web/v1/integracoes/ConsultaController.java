package com.erp.capitalerp.web.v1.integracoes;

import com.erp.capitalerp.application.integracoes.ConsultaService;
import com.erp.capitalerp.application.integracoes.dto.CepDTO;
import com.erp.capitalerp.application.integracoes.dto.CnpjDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/consultas")
public class ConsultaController {

    private final ConsultaService consultaService;

    public ConsultaController(ConsultaService consultaService) {
        this.consultaService = consultaService;
    }

    @GetMapping("/cep/{cep}")
    public ResponseEntity<CepDTO> consultarCep(@PathVariable String cep) {
        CepDTO resp = consultaService.consultarCep(cep);
        if (resp != null && Boolean.FALSE.equals(resp.getSucesso())) {
            return ResponseEntity.badRequest().body(resp);
        }
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/cnpj/{cnpj}")
    public ResponseEntity<CnpjDTO> consultarCnpj(@PathVariable String cnpj) {
        CnpjDTO resp = consultaService.consultarCnpj(cnpj);
        if (resp != null && Boolean.FALSE.equals(resp.getSucesso())) {
            return ResponseEntity.badRequest().body(resp);
        }
        return ResponseEntity.ok(resp);
    }
}
