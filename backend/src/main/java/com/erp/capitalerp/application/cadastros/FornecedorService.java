package com.erp.capitalerp.application.cadastros;

import com.erp.capitalerp.application.cadastros.dto.FornecedorDTO;
import com.erp.capitalerp.domain.cadastros.Fornecedor;
import com.erp.capitalerp.infrastructure.persistence.cadastros.FornecedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class FornecedorService {

    @Autowired
    private FornecedorRepository repository;

    @Transactional(readOnly = true)
    public Page<FornecedorDTO> findAllPaged(Pageable pageable) {
        Page<Fornecedor> list = repository.findAll(pageable);
        return list.map(x -> new FornecedorDTO(x));
    }

    @Transactional(readOnly = true)
    public FornecedorDTO findById(UUID id) {
        Optional<Fornecedor> obj = repository.findById(id);
        Fornecedor entity = obj.orElseThrow(() -> new RuntimeException("Entity not found"));
        return new FornecedorDTO(entity);
    }

    @Transactional
    public FornecedorDTO insert(FornecedorDTO dto) {
        Fornecedor entity = new Fornecedor();
        entity.setNomeFantasia(dto.getNomeFantasia());
        entity.setRazaoSocial(dto.getRazaoSocial());
        entity.setCnpj(dto.getCnpj());
        entity.setInscricaoEstadual(dto.getInscricaoEstadual());
        entity.setTelefone(dto.getTelefone());
        entity.setEmail(dto.getEmail());
        entity.setCep(dto.getCep());
        entity.setEndereco(dto.getEndereco());
        entity.setNumero(dto.getNumero());
        entity.setComplemento(dto.getComplemento());
        entity.setBairro(dto.getBairro());
        entity.setCidade(dto.getCidade());
        entity.setUf(dto.getUf());
        entity.setCodigoIbgeUf(dto.getCodigoIbgeUf());
        entity.setCodigoIbgeCidade(dto.getCodigoIbgeCidade());
        entity = repository.save(entity);
        return new FornecedorDTO(entity);
    }

    @Transactional
    public FornecedorDTO update(UUID id, FornecedorDTO dto) {
        Fornecedor entity = repository.getReferenceById(id);
        entity.setNomeFantasia(dto.getNomeFantasia());
        entity.setRazaoSocial(dto.getRazaoSocial());
        entity.setCnpj(dto.getCnpj());
        entity.setInscricaoEstadual(dto.getInscricaoEstadual());
        entity.setTelefone(dto.getTelefone());
        entity.setEmail(dto.getEmail());
        entity.setCep(dto.getCep());
        entity.setEndereco(dto.getEndereco());
        entity.setNumero(dto.getNumero());
        entity.setComplemento(dto.getComplemento());
        entity.setBairro(dto.getBairro());
        entity.setCidade(dto.getCidade());
        entity.setUf(dto.getUf());
        entity.setCodigoIbgeUf(dto.getCodigoIbgeUf());
        entity.setCodigoIbgeCidade(dto.getCodigoIbgeCidade());
        entity = repository.save(entity);
        return new FornecedorDTO(entity);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}
