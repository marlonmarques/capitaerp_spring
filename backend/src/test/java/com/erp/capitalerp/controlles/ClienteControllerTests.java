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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.erp.capitalerp.dto.ClienteDTO;
import com.erp.capitalerp.services.ClienteService;
import com.erp.capitalerp.services.excepitos.DatabaseException;
import com.erp.capitalerp.services.excepitos.ResourceNotFoundExcepiton;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(ClienteController.class)
//@Import(SecurityConfig.class)
public class ClienteControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClienteService service;

    @Autowired
    private ObjectMapper objectMapper;

    private Long existingId;
    private Long nonExistingId;
    private Long dependentId;
    private ClienteDTO clienteDTO;
    private PageImpl<ClienteDTO> page;

    @BeforeEach
    void setUp() throws Exception {
        existingId = 1L;
        nonExistingId = 2L;
        dependentId = 3L;

        clienteDTO = new ClienteDTO(existingId, "John", "Doe", null, 1L, "12345678901", null, null, null, null, null, null, null, null);
        page = new PageImpl<>(List.of(clienteDTO));

        when(service.findAllPaged(any())).thenReturn(page);

        when(service.findById(existingId)).thenReturn(clienteDTO);
        when(service.findById(nonExistingId)).thenThrow(ResourceNotFoundExcepiton.class);

        when(service.insert(any())).thenReturn(clienteDTO);

        when(service.update(eq(existingId), any())).thenReturn(clienteDTO);
        when(service.update(eq(nonExistingId), any())).thenThrow(ResourceNotFoundExcepiton.class);

        doNothing().when(service).delete(existingId);
        doThrow(ResourceNotFoundExcepiton.class).when(service).delete(nonExistingId);
        doThrow(DatabaseException.class).when(service).delete(dependentId);
    }

    @Test
    @WithMockUser
    public void findAllShouldReturnPage() throws Exception {
        mockMvc.perform(get("/clientes")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    public void findByIdShouldReturnClienteDTOWhenIdExists() throws Exception {
        mockMvc.perform(get("/clientes/{id}", existingId)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").exists());
    }

    @Test
    @WithMockUser
    public void findByIdShouldReturnNotFoundWhenIdDoesNotExist() throws Exception {
        mockMvc.perform(get("/clientes/{id}", nonExistingId)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    public void insertShouldReturnClienteDTOCreated() throws Exception {
        String jsonBody = objectMapper.writeValueAsString(clienteDTO);
        mockMvc.perform(post("/clientes")
                .content(jsonBody)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").exists());
    }

    @Test
    public void updateShouldReturnClienteDTOWhenIdExists() throws Exception {
        String jsonBody = objectMapper.writeValueAsString(clienteDTO);

        mockMvc.perform(put("/clientes/{id}", existingId)
                .content(jsonBody)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").exists());
    }

    @Test
    public void updateShouldReturnNotFoundWhenIdDoesNotExist() throws Exception {
        String jsonBody = objectMapper.writeValueAsString(clienteDTO);

        mockMvc.perform(put("/clientes/{id}", nonExistingId)
                .content(jsonBody)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    public void deleteShouldReturnNoContentWhenIdExists() throws Exception {
        mockMvc.perform(delete("/clientes/{id}", existingId)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }

    @Test
    public void deleteShouldReturnNotFoundWhenIdDoesNotExist() throws Exception {
        mockMvc.perform(delete("/clientes/{id}", nonExistingId)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}