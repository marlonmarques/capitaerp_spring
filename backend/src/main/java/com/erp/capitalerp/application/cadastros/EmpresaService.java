package com.erp.capitalerp.application.cadastros;

import com.erp.capitalerp.application.cadastros.dto.EmpresaDTO;
import com.erp.capitalerp.domain.cadastros.Empresa;
import com.erp.capitalerp.infrastructure.persistence.cadastros.EmpresaRepository;
import com.erp.capitalerp.infrastructure.persistence.cadastros.PlanoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmpresaService {

    private final EmpresaRepository repository;
    private final PlanoRepository planoRepository;

    public EmpresaService(EmpresaRepository repository, PlanoRepository planoRepository) {
        this.repository = repository;
        this.planoRepository = planoRepository;
    }

    @Transactional(readOnly = true)
    public EmpresaDTO obterConfiguracao() {
        Empresa empresa = repository.buscarConfiguracaoAtiva();
        return empresa != null ? new EmpresaDTO(empresa) : null;
    }

    public EmpresaDTO salvarOuAtualizar(EmpresaDTO dto) {
        Empresa empresa = repository.buscarConfiguracaoAtiva();

        if (empresa == null) {
            empresa = new Empresa();
        }

        empresa.setRazaoSocial(dto.razaoSocial());
        empresa.setNomeFantasia(dto.nomeFantasia());
        empresa.setCnpj(dto.cnpj());
        empresa.setEmail(dto.email());
        empresa.setTelefone(dto.telefone());

        // A logo pode ser alterada via URL, ou você pode ter um endpoint separado de
        // Upload de Arquivo
        empresa.setLogoUrl(dto.logoUrl());

        if (dto.planoId() != null) {
            empresa.setPlano(planoRepository.findById(dto.planoId())
                    .orElseThrow(() -> new RuntimeException("Plano não encontrado")));
        }

        empresa = repository.save(empresa);
        return new EmpresaDTO(empresa);
    }
}
