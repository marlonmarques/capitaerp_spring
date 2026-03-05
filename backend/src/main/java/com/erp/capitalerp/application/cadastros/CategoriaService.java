package com.erp.capitalerp.application.cadastros;

import com.erp.capitalerp.application.cadastros.dto.CategoriaDTO;
import com.erp.capitalerp.domain.cadastros.Categoria;
import com.erp.capitalerp.domain.cadastros.TipoCategoria;
import com.erp.capitalerp.infrastructure.persistence.cadastros.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository repository;

    @Transactional(readOnly = true)
    public Page<CategoriaDTO> findAllPaged(String tipo, Pageable pageable) {
        if (tipo == null || tipo.trim().isEmpty()) {
            return repository.findAll(pageable).map(CategoriaDTO::new);
        }
        try {
            TipoCategoria tipoEnum = TipoCategoria.valueOf(tipo.trim().toUpperCase());
            return repository.findByTipo(tipoEnum, pageable).map(CategoriaDTO::new);
        } catch (IllegalArgumentException e) {
            return repository.findAll(pageable).map(CategoriaDTO::new);
        }
    }

    @Transactional(readOnly = true)
    public CategoriaDTO findById(UUID id) {
        Optional<Categoria> obj = repository.findById(id);
        Categoria entity = obj.orElseThrow(() -> new RuntimeException("Entity not found"));
        return new CategoriaDTO(entity);
    }

    @Transactional
    public CategoriaDTO insert(CategoriaDTO dto) {
        Categoria entity = new Categoria();
        entity.setNome(dto.getNome());
        entity.setDescricao(dto.getDescricao());
        entity.setTipo(dto.getTipo());
        entity.setPorcentagemLucroPadrao(dto.getPorcentagemLucroPadrao());
        if (dto.getCategoriaPaiId() != null) {
            entity.setCategoriaPai(repository.getReferenceById(dto.getCategoriaPaiId()));
        }
        entity = repository.save(entity);
        return new CategoriaDTO(entity);
    }

    @Transactional
    public CategoriaDTO update(UUID id, CategoriaDTO dto) {
        Categoria entity = repository.getReferenceById(id);
        entity.setNome(dto.getNome());
        entity.setDescricao(dto.getDescricao());
        entity.setTipo(dto.getTipo());
        entity.setPorcentagemLucroPadrao(dto.getPorcentagemLucroPadrao());
        if (dto.getCategoriaPaiId() != null) {
            entity.setCategoriaPai(repository.getReferenceById(dto.getCategoriaPaiId()));
        } else {
            entity.setCategoriaPai(null);
        }
        entity = repository.save(entity);
        return new CategoriaDTO(entity);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}
