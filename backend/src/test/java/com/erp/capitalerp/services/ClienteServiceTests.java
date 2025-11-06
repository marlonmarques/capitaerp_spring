package com.erp.capitalerp.services;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.erp.capitalerp.dto.ClienteDTO;
import com.erp.capitalerp.entities.Cliente;
import com.erp.capitalerp.repositories.ClienteRepository;
import com.erp.capitalerp.services.excepitos.DatabaseException;
import com.erp.capitalerp.services.excepitos.ResourceNotFoundExcepiton;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(SpringExtension.class)
public class ClienteServiceTests {

    @InjectMocks
    private ClienteService service;

    @Mock
    private ClienteRepository repository;

    private Long existingId;
    private Long nonExistingId;
    private Long dependentId;
    private Cliente cliente;
    private ClienteDTO clienteDTO;
    private PageImpl<Cliente> page;

    @BeforeEach
    void setUp() throws Exception {
        existingId = 1L;
        nonExistingId = 2L;
        dependentId = 3L;

        cliente = new Cliente(existingId, "John", "Doe", null, 1L, "12345678901", null, null, null, null, null, null, null, null);
        clienteDTO = new ClienteDTO(cliente);
        page = new PageImpl<>(List.of(cliente));

        when(repository.findAll(ArgumentMatchers.any(Pageable.class))).thenReturn(page);

        when(repository.findById(existingId)).thenReturn(Optional.of(cliente));
        when(repository.findById(nonExistingId)).thenReturn(Optional.empty());

        when(repository.save(any(Cliente.class))).thenReturn(cliente);

        when(repository.getReferenceById(existingId)).thenReturn(cliente);
        when(repository.getReferenceById(nonExistingId)).thenThrow(EntityNotFoundException.class);

        when(repository.existsById(existingId)).thenReturn(true);
        when(repository.existsById(nonExistingId)).thenReturn(false);
        when(repository.existsById(dependentId)).thenReturn(true);
        doNothing().when(repository).deleteById(existingId);
        doThrow(DataIntegrityViolationException.class).when(repository).deleteById(dependentId);
    }

    @Test
    public void findAllPagedShouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<ClienteDTO> result = service.findAllPaged(pageable);

        Assertions.assertNotNull(result);
        verify(repository, times(1)).findAll(pageable);
    }

    @Test
    public void findByIdShouldReturnClienteDTOWhenIdExists() {
        ClienteDTO result = service.findById(existingId);

        Assertions.assertNotNull(result);
        Assertions.assertEquals(existingId, result.getId());
        verify(repository, times(1)).findById(existingId);
    }

    @Test
    public void findByIdShouldThrowResourceNotFoundExceptionWhenIdDoesNotExist() {
        Assertions.assertThrows(ResourceNotFoundExcepiton.class, () -> {
            service.findById(nonExistingId);
        });

        verify(repository, times(1)).findById(nonExistingId);
    }

    @Test
    public void insertShouldReturnClienteDTO() {
        ClienteDTO result = service.insert(clienteDTO);

        Assertions.assertNotNull(result);
        Assertions.assertEquals(existingId, result.getId());
    }

    @Test
    public void updateShouldReturnClienteDTOWhenIdExists() {
        ClienteDTO result = service.update(existingId, clienteDTO);

        Assertions.assertNotNull(result);
        Assertions.assertEquals(existingId, result.getId());
        verify(repository, times(1)).save(cliente);
    }

    @Test
    public void updateShouldThrowResourceNotFoundExceptionWhenIdDoesNotExist() {
        Assertions.assertThrows(ResourceNotFoundExcepiton.class, () -> {
            service.update(nonExistingId, clienteDTO);
        });

        verify(repository, times(1)).getReferenceById(nonExistingId);
    }

    @Test
    public void deleteShouldDoNothingWhenIdExists() {
        Assertions.assertDoesNotThrow(() -> {
            service.delete(existingId);
        });

        verify(repository, times(1)).deleteById(existingId);
    }

    @Test
    public void deleteShouldThrowResourceNotFoundExceptionWhenIdDoesNotExist() {
        Assertions.assertThrows(ResourceNotFoundExcepiton.class, () -> {
            service.delete(nonExistingId);
        });

        verify(repository, times(0)).deleteById(nonExistingId);
    }

    @Test
    public void deleteShouldThrowDatabaseExceptionWhenDependentId() {
        Assertions.assertThrows(DatabaseException.class, () -> {
            service.delete(dependentId);
        });

        verify(repository, times(1)).deleteById(dependentId);
    }
}


