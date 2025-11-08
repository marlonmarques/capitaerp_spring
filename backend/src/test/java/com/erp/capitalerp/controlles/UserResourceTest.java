package com.erp.capitalerp.controlles;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.erp.capitalerp.config.SecurityConfig;
import com.erp.capitalerp.dto.UserDTO;
import com.erp.capitalerp.dto.UserInsertDTO;
import com.erp.capitalerp.dto.UserUpdateDTO;
import com.erp.capitalerp.repositories.UserRepository;
import com.erp.capitalerp.services.Factory;
import com.erp.capitalerp.services.UserService;
import com.erp.capitalerp.services.excepitos.DatabaseException;
import com.erp.capitalerp.services.excepitos.ResourceNotFoundExcepiton;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(UserResource.class)
@Import(SecurityConfig.class)
public class UserResourceTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService service;

    @MockitoBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Long existingId;
    private Long nonExistingId;
    private Long dependentId;
    private UserDTO userDTO;
    private PageImpl<UserDTO> page;

    @BeforeEach
    void setUp() throws Exception {
        existingId = 1L;
        nonExistingId = 2L;
        dependentId = 3L;

        userDTO = new UserDTO(Factory.createUser());
        page = new PageImpl<>(List.of(userDTO));

        when(service.findAllPaged(any())).thenReturn(page);

        when(service.findById(existingId)).thenReturn(userDTO);
        when(service.findById(nonExistingId)).thenThrow(ResourceNotFoundExcepiton.class);

        when(service.insert(any())).thenReturn(userDTO);

        when(service.update(eq(existingId), any())).thenReturn(userDTO);
        when(service.update(eq(nonExistingId), any())).thenThrow(ResourceNotFoundExcepiton.class);

        doNothing().when(service).delete(existingId);
        doThrow(ResourceNotFoundExcepiton.class).when(service).delete(nonExistingId);
        doThrow(DatabaseException.class).when(service).delete(dependentId);
    }

    @Test
    public void findAllShouldReturnPage() throws Exception {
        mockMvc.perform(get("/users"))
                .andExpect(status().isOk());
    }

    @Test
    public void findByIdShouldReturnUserDTOWhenIdExists() throws Exception {
        mockMvc.perform(get("/users/{id}", existingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.firstName").exists());
    }

    @Test
    public void findByIdShouldReturnNotFoundWhenIdDoesNotExist() throws Exception {
        mockMvc.perform(get("/users/{id}", nonExistingId))
                .andExpect(status().isNotFound());
    }

    @Test
    public void insertShouldReturnUserDTOCreated() throws Exception {
        UserInsertDTO userInsertDTO = new UserInsertDTO();
        userInsertDTO.setFirstName("John");
        userInsertDTO.setLastName("Doe");
        userInsertDTO.setEmail("john.doe@example.com");
        userInsertDTO.setPassword("123456");

        String jsonBody = objectMapper.writeValueAsString(userInsertDTO);

        mockMvc.perform(post("/users")
                .content(jsonBody)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    public void updateShouldReturnUserDTOWhenIdExists() throws Exception {
        UserUpdateDTO userUpdateDTO = new UserUpdateDTO();
        userUpdateDTO.setFirstName("Updated Name");
        String jsonBody = objectMapper.writeValueAsString(userUpdateDTO);

        mockMvc.perform(put("/users/{id}", existingId)
                .content(jsonBody)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(existingId));
    }

    @Test
    public void updateShouldReturnNotFoundWhenIdDoesNotExist() throws Exception {
        UserUpdateDTO userUpdateDTO = new UserUpdateDTO();
        userUpdateDTO.setFirstName("John");
        userUpdateDTO.setLastName("Doe");
        userUpdateDTO.setEmail("john.doe@example.com");
        
        String jsonBody = objectMapper.writeValueAsString(userUpdateDTO);

        mockMvc.perform(put("/users/{id}", nonExistingId)
                .content(jsonBody)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    public void deleteShouldReturnNoContentWhenIdExists() throws Exception {
        mockMvc.perform(delete("/users/{id}", existingId))
                .andExpect(status().isNoContent());
    }

    @Test
    public void deleteShouldReturnNotFoundWhenIdDoesNotExist() throws Exception {
        mockMvc.perform(delete("/users/{id}", nonExistingId))
                .andExpect(status().isNotFound());
    }
}