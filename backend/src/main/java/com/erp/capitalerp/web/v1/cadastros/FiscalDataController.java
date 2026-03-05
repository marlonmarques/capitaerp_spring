package com.erp.capitalerp.web.v1.cadastros;

import com.erp.capitalerp.application.cadastros.FiscalDataService;
import com.erp.capitalerp.application.cadastros.dto.BuscaFiscalResultDTO;
import com.erp.capitalerp.application.cadastros.dto.CestResultDTO;
import com.erp.capitalerp.application.cadastros.dto.NcmResultDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fiscal-data")
public class FiscalDataController {

    private final FiscalDataService fiscalDataService;

    public FiscalDataController(FiscalDataService fiscalDataService) {
        this.fiscalDataService = fiscalDataService;
    }

    @GetMapping("/cnaes")
    public ResponseEntity<List<BuscaFiscalResultDTO>> searchCnaes(
            @RequestParam(value = "search", required = false, defaultValue = "") String search) {
        return ResponseEntity.ok(fiscalDataService.searchCnae(search));
    }

    @GetMapping("/nbs")
    public ResponseEntity<List<BuscaFiscalResultDTO>> searchNbs(
            @RequestParam(value = "search", required = false, defaultValue = "") String search) {
        return ResponseEntity.ok(fiscalDataService.searchNbs(search));
    }

    @GetMapping("/nbs-by-cnae")
    public ResponseEntity<List<BuscaFiscalResultDTO>> getNbsByCnae(
            @RequestParam(value = "cnaeMascara") String cnaeMascara) {
        return ResponseEntity.ok(fiscalDataService.getNbsByCnae(cnaeMascara));
    }

    @GetMapping("/lc116-by-nbs")
    public ResponseEntity<List<BuscaFiscalResultDTO>> getLc116ByNbs(
            @RequestParam(value = "nbsCodigo") String nbsCodigo) {
        return ResponseEntity.ok(fiscalDataService.getLc116ByNbs(nbsCodigo));
    }

    @GetMapping("/cfops")
    public ResponseEntity<List<BuscaFiscalResultDTO>> searchCfops(
            @RequestParam(value = "search", required = false, defaultValue = "") String search) {
        return ResponseEntity.ok(fiscalDataService.searchCfop(search));
    }

    @GetMapping("/condicoes-pagamento")
    public ResponseEntity<List<BuscaFiscalResultDTO>> listCondicoesPagamento() {
        return ResponseEntity.ok(fiscalDataService.listPagamentos());
    }

    @GetMapping("/ncm")
    public ResponseEntity<List<NcmResultDTO>> searchNcm(
            @RequestParam(value = "search", required = false, defaultValue = "") String search) {
        return ResponseEntity.ok(fiscalDataService.searchNcm(search));
    }

    @GetMapping("/cest-by-ncm")
    public ResponseEntity<List<CestResultDTO>> getCestByNcm(@RequestParam(value = "ncm") String ncm) {
        return ResponseEntity.ok(fiscalDataService.getCestByNcm(ncm));
    }

    @GetMapping("/cest")
    public ResponseEntity<List<CestResultDTO>> searchCest(
            @RequestParam(value = "search", required = false, defaultValue = "") String search) {
        return ResponseEntity.ok(fiscalDataService.searchCest(search));
    }
}
