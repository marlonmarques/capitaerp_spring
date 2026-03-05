package com.erp.capitalerp.application.financeiro;

import com.erp.capitalerp.domain.financeiro.ContaBancaria;
import com.erp.capitalerp.infrastructure.persistence.financeiro.ContaBancariaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContaBancariaService {

    private final ContaBancariaRepository repository;

    public ContaBancariaService(ContaBancariaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ContaBancariaDTO> findAll() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContaBancariaDTO findById(String id) {
        return repository.findById(id).map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Conta Bancária não encontrada"));
    }

    @Transactional
    public ContaBancariaDTO insert(ContaBancariaDTO dto) {
        ContaBancaria entity = new ContaBancaria();
        updateEntityFromDTO(entity, dto);

        if (Boolean.TRUE.equals(entity.getPadrao())) {
            repository.removerPadraoAntigo("");
        }

        return toDTO(repository.save(entity));
    }

    @Transactional
    public ContaBancariaDTO update(String id, ContaBancariaDTO dto) {
        ContaBancaria entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Conta Bancária não encontrada"));

        updateEntityFromDTO(entity, dto);

        if (Boolean.TRUE.equals(entity.getPadrao())) {
            repository.removerPadraoAntigo(id);
        }

        return toDTO(repository.save(entity));
    }

    @Transactional
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Conta Bancária não encontrada para deleção");
        }
        repository.softDelete(id);
    }

    private void updateEntityFromDTO(ContaBancaria entity, ContaBancariaDTO dto) {
        entity.setNome(dto.nome());
        entity.setCodigoBanco(dto.codigoBanco());
        entity.setAgencia(dto.agencia());
        entity.setNumeroConta(dto.numeroConta());
        entity.setCarteira(dto.carteira());
        entity.setConvenio(dto.convenio());
        entity.setContrato(dto.contrato());
        entity.setTipoCarteira(dto.tipoCarteira());
        entity.setInstrucoesBoleto1(dto.instrucoesBoleto1());
        entity.setInstrucoesBoleto2(dto.instrucoesBoleto2());
        entity.setInstrucoesBoleto3(dto.instrucoesBoleto3());
        entity.setTaxaMora(dto.taxaMora());
        entity.setTaxaMulta(dto.taxaMulta());
        entity.setSaldoInicial(dto.saldoInicial());
        entity.setViaApi(dto.viaApi() != null ? dto.viaApi() : false);
        entity.setTokenApi(dto.tokenApi());
        entity.setTelefone(dto.telefone());
        entity.setPadrao(dto.padrao() != null ? dto.padrao() : false);
        entity.setAtivo(dto.ativo() != null ? dto.ativo() : true);
    }

    private ContaBancariaDTO toDTO(ContaBancaria entity) {
        return new ContaBancariaDTO(entity.getId(), entity.getNome(), entity.getCodigoBanco(), entity.getAgencia(),
                entity.getNumeroConta(), entity.getCarteira(), entity.getConvenio(), entity.getContrato(),
                entity.getTipoCarteira(), entity.getInstrucoesBoleto1(), entity.getInstrucoesBoleto2(),
                entity.getInstrucoesBoleto3(), entity.getTaxaMora(), entity.getTaxaMulta(), entity.getSaldoInicial(),
                entity.getViaApi(), entity.getTokenApi(), entity.getTelefone(), entity.getPadrao(), entity.getAtivo(),
                entity.getCriadoEm(), entity.getAtualizadoEm());
    }
}
