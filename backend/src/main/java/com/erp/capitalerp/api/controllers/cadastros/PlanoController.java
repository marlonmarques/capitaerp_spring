package com.erp.capitalerp.api.controllers.cadastros;

import com.erp.capitalerp.application.cadastros.PlanoService;
import com.erp.capitalerp.application.cadastros.dto.PlanoDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/planos")
public class PlanoController {

    private final PlanoService service;

    public PlanoController(PlanoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PlanoDTO>> listar() {
        return ResponseEntity.ok(service.listarAtivos());
    }
}
