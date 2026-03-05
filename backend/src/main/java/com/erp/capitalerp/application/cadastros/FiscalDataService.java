package com.erp.capitalerp.application.cadastros;

import com.erp.capitalerp.application.cadastros.dto.BuscaFiscalResultDTO;
import com.erp.capitalerp.application.cadastros.dto.CestResultDTO;
import com.erp.capitalerp.application.cadastros.dto.NcmResultDTO;
import com.erp.capitalerp.sqlite.repositories.CestRepository;
import com.erp.capitalerp.sqlite.repositories.CfopRepository;
import com.erp.capitalerp.sqlite.repositories.CnaeRepository;
import com.erp.capitalerp.sqlite.repositories.NbsRepository;
import com.erp.capitalerp.sqlite.repositories.NcmRepository;
import com.erp.capitalerp.sqlite.repositories.PagamentoRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true, transactionManager = "sqliteTransactionManager")
public class FiscalDataService {

    private final CnaeRepository cnaeRepository;
    private final NbsRepository nbsRepository;
    private final CfopRepository cfopRepository;
    private final PagamentoRepository pagamentoRepository;
    private final NcmRepository ncmRepository;
    private final CestRepository cestRepository;

    public FiscalDataService(CnaeRepository cnaeRepository, NbsRepository nbsRepository, CfopRepository cfopRepository,
            PagamentoRepository pagamentoRepository, NcmRepository ncmRepository, CestRepository cestRepository) {
        this.cnaeRepository = cnaeRepository;
        this.nbsRepository = nbsRepository;
        this.cfopRepository = cfopRepository;
        this.pagamentoRepository = pagamentoRepository;
        this.ncmRepository = ncmRepository;
        this.cestRepository = cestRepository;
    }

    public List<BuscaFiscalResultDTO> searchCnae(String search) {
        if (search == null || search.trim().isEmpty()) {
            // Em caso de busca vazia traz os primeiros 20
            return cnaeRepository.findAll(PageRequest.of(0, 20)).stream()
                    .map(c -> new BuscaFiscalResultDTO(c.getMascara(), c.getMascara() + " - " + c.getDescricao()))
                    .collect(Collectors.toList());
        }

        return cnaeRepository.searchByKeyword(search, PageRequest.of(0, 20)).stream()
                .map(c -> new BuscaFiscalResultDTO(c.getMascara(), c.getMascara() + " - " + c.getDescricao()))
                .collect(Collectors.toList());
    }

    public List<BuscaFiscalResultDTO> searchNbs(String search) {
        if (search == null || search.trim().isEmpty()) {
            return nbsRepository.findAll(PageRequest.of(0, 20)).stream()
                    .map(n -> new BuscaFiscalResultDTO(n.getCode(), n.getCode() + " - " + n.getDescription()))
                    .collect(Collectors.toList());
        }

        return nbsRepository.searchByKeyword(search, PageRequest.of(0, 20)).stream()
                .map(n -> new BuscaFiscalResultDTO(n.getCode(), n.getCode() + " - " + n.getDescription()))
                .collect(Collectors.toList());
    }

    public List<BuscaFiscalResultDTO> getNbsByCnae(String cnaeMascara) {
        if (cnaeMascara == null || cnaeMascara.trim().isEmpty()) {
            return List.of();
        }
        return nbsRepository.findNbsByCnaeMascara(cnaeMascara).stream()
                .map(n -> new BuscaFiscalResultDTO(n.getCode(), n.getCode() + " - " + n.getDescription()))
                .collect(Collectors.toList());
    }

    public List<BuscaFiscalResultDTO> getLc116ByNbs(String nbsCodigo) {
        if (nbsCodigo == null || nbsCodigo.trim().isEmpty()) {
            return List.of();
        }
        return nbsRepository.findItemLc116ByNbsCodigo(nbsCodigo).stream()
                .map(item -> new BuscaFiscalResultDTO(item, item + " - LC 116")).collect(Collectors.toList());
    }

    public List<BuscaFiscalResultDTO> searchCfop(String search) {
        if (search == null || search.trim().isEmpty()) {
            return cfopRepository.findAllWithCode(PageRequest.of(0, 30)).stream()
                    .map(c -> new BuscaFiscalResultDTO(c.getCode(), c.getCode() + " - " + c.getName()))
                    .collect(Collectors.toList());
        }
        return cfopRepository.searchByKeyword(search, PageRequest.of(0, 30)).stream()
                .map(c -> new BuscaFiscalResultDTO(c.getCode(), c.getCode() + " - " + c.getName()))
                .collect(Collectors.toList());
    }

    public List<BuscaFiscalResultDTO> listPagamentos() {
        return pagamentoRepository.findAll().stream()
                .map(p -> new BuscaFiscalResultDTO(String.valueOf(p.getId()), p.getNome()))
                .collect(Collectors.toList());
    }

    public List<NcmResultDTO> searchNcm(String search) {
        List<?> results;
        if (search == null || search.trim().isEmpty()) {
            results = ncmRepository.findAllLimited(PageRequest.of(0, 30));
        } else {
            results = ncmRepository.searchByKeyword(search, PageRequest.of(0, 30));
        }
        return results.stream().map(obj -> {
            var n = (com.erp.capitalerp.sqlite.entities.Ncm) obj;
            return new NcmResultDTO(n.getCodigo(), n.getDescricao(), n.getNacionalFederal(), n.getImportadoFederal(),
                    n.getEstadual(), n.getMunicipal());
        }).collect(Collectors.toList());
    }

    /** Retorna CESTOs vinculados ao NCM informado (código de 8 dígitos). */
    public List<CestResultDTO> getCestByNcm(String ncmCodigo) {
        if (ncmCodigo == null || ncmCodigo.trim().isEmpty())
            return List.of(cestPadrao());
        String prefix = ncmCodigo.length() >= 4 ? ncmCodigo.substring(0, 4) + "%" : ncmCodigo + "%";
        List<CestResultDTO> resultado = cestRepository.findByNcmCodigo(ncmCodigo, prefix).stream()
                .map(c -> new CestResultDTO(c.getId(), c.getDescricao(), c.getSegmento())).collect(Collectors.toList());
        // Se não encontrou nenhum CEST para o NCM, retorna o padrão
        if (resultado.isEmpty()) {
            return new java.util.ArrayList<>(List.of(cestPadrao()));
        }
        return resultado;
    }

    /** CEST padrão para NCMs sem tabela de substituição tributária específica. */
    private CestResultDTO cestPadrao() {
        return new CestResultDTO("2899900",
                "Outros produtos comercializados pelo sistema de marketing direto porta-a-porta a consumidor final não relacionados em outros itens deste anexo",
                "Outros");
    }

    /** Busca CESTOs por texto livre (código ou descrição). */
    public List<CestResultDTO> searchCest(String search) {
        if (search == null || search.trim().isEmpty())
            return List.of();
        return cestRepository.searchByDescricao(search).stream()
                .map(c -> new CestResultDTO(c.getId(), c.getDescricao(), c.getSegmento())).collect(Collectors.toList());
    }
}
