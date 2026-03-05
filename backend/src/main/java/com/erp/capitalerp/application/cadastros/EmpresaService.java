package com.erp.capitalerp.application.cadastros;

import com.erp.capitalerp.application.cadastros.dto.EmpresaDTO;
import com.erp.capitalerp.domain.cadastros.Empresa;
import com.erp.capitalerp.infrastructure.persistence.cadastros.EmpresaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmpresaService {

    private final EmpresaRepository repository;

    public EmpresaService(EmpresaRepository repository) {
        this.repository = repository;
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

        empresa = repository.save(empresa);
        return new EmpresaDTO(empresa);
    }
}
