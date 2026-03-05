package com.erp.capitalerp.application.clientes;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.erp.capitalerp.application.clientes.dto.ClienteDTO;
import com.erp.capitalerp.domain.clientes.Cliente;
import com.erp.capitalerp.infrastructure.persistence.clientes.ClienteRepository;
import com.erp.capitalerp.domain.shared.DatabaseException;
import com.erp.capitalerp.domain.shared.ResourceNotFoundExcepiton;

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
        Cliente cliente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundExcepiton("Recurso não encontrado!"));
        return new ClienteDTO(cliente);
    }

    @Transactional
    public ClienteDTO insert(ClienteDTO dto) {
        if (dto.getCpf() != null && !dto.getCpf().trim().isEmpty()) {
            if (repository.existsByCpf(dto.getCpf())) {
                throw new DatabaseException("O CPF/CNPJ informado já está cadastrado em outro cliente.");
            }
        }

        Cliente entity = new Cliente();
        copyDtoToEntity(dto, entity);
        entity = repository.save(entity);

        return new ClienteDTO(entity);
    }

    @Transactional
    public ClienteDTO update(Long id, ClienteDTO dto) {
        if (dto.getCpf() != null && !dto.getCpf().trim().isEmpty()) {
            if (repository.existsByCpfAndIdNot(dto.getCpf(), id)) {
                throw new DatabaseException("O CPF/CNPJ informado já está cadastrado em outro cliente.");
            }
        }

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
        if (!repository.existsById(id)) {
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
        entity.setPosicaoFiscalId(dto.getPosicaoFiscalId());
        entity.setCodPagto(dto.getCodPagto());
        entity.setRg(dto.getRg());
        entity.setReterIss(dto.getReterIss());
        entity.setNotaInterna(dto.getNotaInterna());

        entity.getEnderecos().clear();
        if (dto.getEnderecos() != null) {
            for (com.erp.capitalerp.application.clientes.dto.EnderecoClienteDTO endDto : dto.getEnderecos()) {
                com.erp.capitalerp.domain.clientes.EnderecoCliente end = new com.erp.capitalerp.domain.clientes.EnderecoCliente();
                end.setLogradouro(endDto.getLogradouro());
                end.setNumero(endDto.getNumero());
                end.setComplemento(endDto.getComplemento());
                end.setBairro(endDto.getBairro());
                end.setCidade(endDto.getCidade());
                end.setEstado(endDto.getEstado());
                end.setCep(endDto.getCep());
                end.setPrincipal(endDto.getPrincipal() != null ? endDto.getPrincipal() : false);
                end.setCliente(entity);
                entity.getEnderecos().add(end);
            }
        }

        entity.getEmails().clear();
        if (dto.getEmails() != null) {
            for (com.erp.capitalerp.application.clientes.dto.EmailClienteDTO emailDto : dto.getEmails()) {
                com.erp.capitalerp.domain.clientes.EmailCliente email = new com.erp.capitalerp.domain.clientes.EmailCliente();
                email.setEmail(emailDto.getEmail());
                email.setPrincipal(emailDto.getPrincipal() != null ? emailDto.getPrincipal() : false);
                email.setCliente(entity);
                entity.getEmails().add(email);
            }
        }
    }

}
