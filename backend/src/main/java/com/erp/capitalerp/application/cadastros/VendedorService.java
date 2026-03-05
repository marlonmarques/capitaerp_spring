package com.erp.capitalerp.application.cadastros;

import com.erp.capitalerp.application.cadastros.dto.VendedorDTO;
import com.erp.capitalerp.domain.cadastros.Vendedor;
import com.erp.capitalerp.domain.usuarios.User;
import com.erp.capitalerp.infrastructure.persistence.cadastros.VendedorRepository;
import com.erp.capitalerp.infrastructure.persistence.usuarios.UserRepository;
import com.erp.capitalerp.domain.shared.ResourceNotFoundExcepiton;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class VendedorService {

    private final VendedorRepository repository;
    private final UserRepository userRepository;

    public VendedorService(VendedorRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<VendedorDTO> pesquisar(String nome, Boolean ativo, Pageable pageable) {
        return repository.findComFiltros(nome, ativo, pageable).map(VendedorDTO::new);
    }

    @Transactional(readOnly = true)
    public VendedorDTO buscarPorId(UUID id) {
        return new VendedorDTO(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundExcepiton("Vendedor não encontrado com ID: " + id)));
    }

    public VendedorDTO salvar(VendedorDTO dto) {
        Vendedor entity = new Vendedor();
        copiarParaEntidade(dto, entity);
        return new VendedorDTO(repository.save(entity));
    }

    public VendedorDTO atualizar(UUID id, VendedorDTO dto) {
        Vendedor entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundExcepiton("Vendedor não encontrado com ID: " + id));
        copiarParaEntidade(dto, entity);
        return new VendedorDTO(repository.save(entity));
    }

    public void excluir(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundExcepiton("Vendedor não encontrado com ID: " + id);
        }
        repository.deleteById(id);
    }

    private void copiarParaEntidade(VendedorDTO dto, Vendedor entity) {
        entity.setNome(dto.nome());
        entity.setCpfCnpj(dto.cpfCnpj());
        entity.setTelefone(dto.telefone());
        entity.setEmail(dto.email());
        entity.setPercentualComissao(dto.percentualComissao());
        entity.setAtivo(dto.ativo() != null ? dto.ativo() : true);

        if (dto.usuarioId() != null) {
            // Usar getReferenceById via UserRepository em vez de EntityManager diretamente
            // evita o problema de ambiguidade de EntityManager com múltiplos datasources
            User userRef = userRepository.getReferenceById(dto.usuarioId());
            entity.setUsuario(userRef);
        } else {
            entity.setUsuario(null);
        }
    }
}
