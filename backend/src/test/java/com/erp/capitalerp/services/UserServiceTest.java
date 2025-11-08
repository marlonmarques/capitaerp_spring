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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.erp.capitalerp.dto.UserDTO;
import com.erp.capitalerp.dto.UserInsertDTO;
import com.erp.capitalerp.dto.UserUpdateDTO;
import com.erp.capitalerp.entities.User;
import com.erp.capitalerp.repositories.RoleRepository;
import com.erp.capitalerp.repositories.UserRepository;
import com.erp.capitalerp.services.excepitos.DatabaseException;
import com.erp.capitalerp.services.excepitos.ResourceNotFoundExcepiton;
import jakarta.persistence.EntityNotFoundException;

@ExtendWith(SpringExtension.class)
public class UserServiceTest {

	@InjectMocks
    private UserService service;

    @Mock
    private UserRepository repository;

    private Long existingId;
    private Long nonExistingId;
    private Long dependentId;
    private User user;
    private UserInsertDTO userInsertDTO;
    private UserUpdateDTO userUpdateDTO;
    private Page<User> page;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() throws Exception {
        existingId = 1L;
        nonExistingId = 2L;
        dependentId = 3L;

        user = Factory.createUser();
        page = new PageImpl<>(List.of(user));
        userInsertDTO = new UserInsertDTO();
        userUpdateDTO = new UserUpdateDTO();

        when(repository.findAll(ArgumentMatchers.any(Pageable.class))).thenReturn(page);

        when(repository.findById(existingId)).thenReturn(Optional.of(user));
        when(repository.findById(nonExistingId)).thenReturn(Optional.empty());

        when(repository.save(any(User.class))).thenReturn(user);

        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");

        when(repository.getReferenceById(existingId)).thenReturn(user);
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
        Page<UserDTO> result = service.findAllPaged(pageable);

        Assertions.assertNotNull(result);
        verify(repository, times(1)).findAll(pageable);
    }

    @Test
    public void findByIdShouldReturnClienteDTOWhenIdExists() {
        UserDTO result = service.findById(existingId);

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
    public void insertShouldReturnUserDTO() {
        UserDTO result = service.insert(userInsertDTO);

        Assertions.assertNotNull(result);
        Assertions.assertEquals(existingId, result.getId());
        verify(repository, times(1)).save(any(User.class));
        verify(passwordEncoder, times(1)).encode(userInsertDTO.getPassword());
    }

    @Test
    public void updateShouldReturnUserDTOWhenIdExists() {
        UserDTO result = service.update(existingId, userUpdateDTO);

        Assertions.assertNotNull(result);
        Assertions.assertEquals(existingId, result.getId());
        verify(repository, times(1)).save(user);
    }

    @Test
    public void updateShouldThrowResourceNotFoundExceptionWhenIdDoesNotExist() {
        Assertions.assertThrows(ResourceNotFoundExcepiton.class, () -> {
            service.update(nonExistingId, userUpdateDTO);
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
