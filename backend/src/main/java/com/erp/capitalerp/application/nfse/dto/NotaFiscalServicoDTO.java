package com.erp.capitalerp.application.nfse.dto;

import com.erp.capitalerp.domain.nfse.NotaFiscalServico;
import com.erp.capitalerp.domain.nfse.StatusNFSe;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record NotaFiscalServicoDTO(UUID id, Integer numeroRps, String serieRps, String numeroNfse,
                String codigoVerificacao, StatusNFSe status,

                // Tomador
                Long clienteId, String clienteNome, String clienteCpfCnpj, String emailsEnvio,

                // Serviço
                String naturezaOperacao, String discriminacaoServico, String informacoesComplementares,
                String codigoCnae, String itemLc116, String codigoNbs, String municipioIbge, String ufPrestacao,
                Short exigibilidadeIss, Boolean issRetido,

                // Datas
                LocalDate dataEmissao, LocalDate dataCompetencia, LocalDate dataVencimento,
                LocalDateTime dataAutorizacao, LocalDateTime dataCancelamento,

                // Valores
                BigDecimal valorServicos, BigDecimal valorDesconto, BigDecimal aliquotaIss, BigDecimal valorIss,
                BigDecimal valorIssRetido, BigDecimal valorLiquido,

                // ACBr
                String mensagemRetorno, boolean temXml,

                // Auditoria
                LocalDateTime criadoEm, String criadoPor) {
        public NotaFiscalServicoDTO(NotaFiscalServico n) {
                this(n.getId(), n.getNumeroRps(), n.getSerieRps(), n.getNumeroNfse(), n.getCodigoVerificacao(),
                                n.getStatus(), n.getCliente() != null ? n.getCliente().getId() : null,
                                n.getCliente() != null ? (n.getCliente().getRazaoSocial() != null
                                                && !n.getCliente().getRazaoSocial().isBlank()
                                                                ? n.getCliente().getRazaoSocial()
                                                                : (n.getCliente().getName() + " " + (n.getCliente()
                                                                                .getLastName() != null ? n.getCliente()
                                                                                                .getLastName() : ""))
                                                                                                                .trim())
                                                : null,
                                n.getCliente() != null ? n.getCliente().getCpf() : null, n.getEmailsEnvio(),

                                n.getNaturezaOperacao(), n.getDiscriminacaoServico(), n.getInformacoesComplementares(),
                                n.getCodigoCnae(), n.getItemLc116(), n.getCodigoNbs(), n.getMunicipioIbge(),
                                n.getUfPrestacao(), n.getExigibilidadeIss(), n.getIssRetido(),

                                n.getDataEmissao(), n.getDataCompetencia(), n.getDataVencimento(),
                                n.getDataAutorizacao(), n.getDataCancelamento(),

                                n.getValorServicos(), n.getValorDesconto(), n.getAliquotaIss(), n.getValorIss(),
                                n.getValorIssRetido(), n.getValorLiquido(),

                                n.getMensagemRetorno(), n.getXmlNfse() != null && !n.getXmlNfse().isBlank(),

                                n.getCriadoEm(), n.getCriadoPor());
        }
}
