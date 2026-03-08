package com.erp.capitalerp.application.usuarios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

import com.erp.capitalerp.domain.shared.ResourceNotFoundExcepiton;
import com.erp.capitalerp.application.usuarios.dto.RoleDTO;
import com.erp.capitalerp.application.usuarios.dto.UserDTO;
import com.erp.capitalerp.application.usuarios.dto.UserInsertDTO;
import com.erp.capitalerp.application.usuarios.dto.UserUpdateDTO;
import com.erp.capitalerp.domain.usuarios.Role;
import com.erp.capitalerp.domain.usuarios.User;
import com.erp.capitalerp.projetion.UserDetailsProjection;
import com.erp.capitalerp.infrastructure.persistence.usuarios.RoleRepository;
import com.erp.capitalerp.infrastructure.persistence.usuarios.UserRepository;
import com.erp.capitalerp.application.cadastros.dto.FilialDTO;
import com.erp.capitalerp.domain.cadastros.Filial;
import com.erp.capitalerp.infrastructure.persistence.cadastros.FilialRepository;
import com.erp.capitalerp.domain.shared.DatabaseException;

import jakarta.persistence.EntityNotFoundException;


@Service
public class UserService implements UserDetailsService{

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository repository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private FilialRepository filialRepository;


    @Transactional(readOnly = true)
    public Page<UserDTO> findAllPaged(Pageable pageable) {
        Page<User> list = repository.findAll(pageable);
        return list.map(x -> new UserDTO(x));
    }

    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        Optional<User> obj = repository.findById(id);
        User entity = obj.orElseThrow(() -> new ResourceNotFoundExcepiton("Entity not found"));
        return new UserDTO(entity);
  
    }

    @Transactional
    public UserDTO insert(UserInsertDTO dto) {
        User entity = new User();
        copyDtoToEntity(dto, entity);
        entity.setPassword(passwordEncoder.encode(dto.getPassword()));
        entity = repository.save(entity);
        return new UserDTO(entity);
    }

    @Transactional
    public UserDTO update(Long id, UserUpdateDTO dto) {
        try {
            User entity = repository.getReferenceById(id);
            copyDtoToEntity(dto, entity);
            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                entity.setPassword(passwordEncoder.encode(dto.getPassword()));
            }
            entity = repository.save(entity);
            return new UserDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundExcepiton("Id not found " + id);
        }
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
		throw new ResourceNotFoundExcepiton("Recurso não encontrado");
        }
        try {
            repository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
                throw new DatabaseException("Falha de integridade referencial");
        }

    }

    private void copyDtoToEntity(UserDTO dto, User entity) {
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
        entity.setEmail(dto.getEmail());
        entity.setFilialId(dto.getFilialId());

        entity.getRoles().clear();
        for (RoleDTO roleDto : dto.getRoles()) {
            Role role = roleRepository.getReferenceById(roleDto.getId());
            entity.getRoles().add(role);
        }

        entity.getFiliais().clear();
        for (FilialDTO fDto : dto.getFiliais()) {
            Filial filial = filialRepository.getReferenceById(fDto.getId());
            entity.getFiliais().add(filial);
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        List<UserDetailsProjection> result = repository.searchUserAndRolesByEmail(username);
        if (result.isEmpty()) {
            throw new UsernameNotFoundException("Email not found");
        }
        User user = new User();
        user.setEmail(username);
        user.setPassword(result.get(0).getPassword());
        user.setFilialId(result.get(0).getFilialId());
        for (UserDetailsProjection projection : result) {
            user.addRole(new Role(projection.getRoleId(), projection.getAuthority()));
        }
        return user;
    }

    @Transactional(readOnly = true)
    public UserDTO getMe() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("DEBUG: Buscando dados do usuário logado (getMe) para o email: " + email);
        User user = repository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundExcepiton("User not found");
        }
        return new UserDTO(user);
    }

    @Transactional(readOnly = true)
    public void validarAcessoFilial(UUID filialId) {
        if (filialId == null) return;
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = repository.findByEmail(email);
        
        if (user == null) {
            throw new RuntimeException("Usuário não autenticado");
        }

        // Se for ADMIN do tenant, tem acesso total
        if (user.hasRole("ROLE_ADMIN")) {
            return;
        }

        // Se for operador, verifica se a filial está na sua lista de permissões
        boolean temAcesso = user.getFiliais().stream()
                .anyMatch(f -> f.getId().equals(filialId));
        
        // Também permite se for a sua filial padrão
        if (!temAcesso && user.getFilialId() != null && user.getFilialId().equals(filialId)) {
            temAcesso = true;
        }

        if (!temAcesso) {
            throw new RuntimeException("Acesso negado à filial " + filialId);
        }
    }
}
