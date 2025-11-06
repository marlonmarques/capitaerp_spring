package com.erp.capitalerp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.erp.capitalerp.dto.ClienteDTO;
import com.erp.capitalerp.entities.Cliente;
import com.erp.capitalerp.repositories.ClienteRepository;
import com.erp.capitalerp.services.excepitos.DatabaseException;
import com.erp.capitalerp.services.excepitos.ResourceNotFoundExcepiton;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository repository;

    @Transactional(readOnly = true)
    public Page<ClienteDTO> findAllPaged(Pageable pageable) {
        Page<Cliente> result = repository.findAll(pageable);
        return result.map(x -> new ClienteDTO(x));
    }

    @Transactional(readOnly = true)
    public ClienteDTO findById(Long id) {
        Cliente cliente = repository.findById(id).orElseThrow(
                () -> new ResourceNotFoundExcepiton("Recurso não encontrado!")
        );
        return new ClienteDTO(cliente);
    }

    @Transactional
    public ClienteDTO insert(ClienteDTO dto) {
       Cliente entity = new Cliente();
        copyDtoToEntity(dto, entity);
        entity = repository.save(entity);

        return new ClienteDTO(entity);
    }

    @Transactional
    public ClienteDTO update(Long id, ClienteDTO dto) {
        try {
            Cliente entity = repository.getReferenceById(id);
            copyDtoToEntity(dto, entity);
            entity = repository.save(entity);

            return new ClienteDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundExcepiton("Recurso não encontrado!");
        }
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public void delete(Long id) {
        if(!repository.existsById(id)){
            throw new ResourceNotFoundExcepiton("Recurso não encontrado!");
        }
        try {
            repository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException("Falha de integridade referencial");
        }
    }

    private void copyDtoToEntity(ClienteDTO dto, Cliente entity) {
        entity.setName(dto.getName());
        entity.setLastName(dto.getLastName());
        entity.setRazaoSocial(dto.getRazaoSocial());
        entity.setTipoPessoa(dto.getTipoPessoa());
        entity.setCpf(dto.getCpf());
        entity.setTelefone(dto.getTelefone());
        entity.setCelular(dto.getCelular());
        entity.setInscEString(dto.getInscEString());
        entity.setInscMunicipal(dto.getInscMunicipal());
        entity.setIss(dto.getIss());
        entity.setIndIe(dto.getIndIe());
        entity.setPosicaoFiscal(dto.getPosicaoFiscal());
        entity.setCodPagto(dto.getCodPagto());
    }

}
