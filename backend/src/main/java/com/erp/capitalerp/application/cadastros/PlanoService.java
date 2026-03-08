package com.erp.capitalerp.application.cadastros;

import com.erp.capitalerp.application.cadastros.dto.PlanoDTO;
import com.erp.capitalerp.infrastructure.persistence.cadastros.PlanoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlanoService {

    private final PlanoRepository repository;

    public PlanoService(PlanoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<PlanoDTO> listarAtivos() {
        return repository.findByAtivoTrue().stream()
                .map(PlanoDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PlanoDTO> listarTodos() {
        return repository.findAll().stream()
                .map(PlanoDTO::new)
                .collect(Collectors.toList());
    }
}
