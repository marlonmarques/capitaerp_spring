package com.erp.capitalerp.application.estoque.dto;

import com.erp.capitalerp.domain.estoque.Produto;
import com.erp.capitalerp.domain.estoque.ProdutoStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * DTO completo do Produto — usado tanto para leitura quanto para escrita.
 *
 * Campos de tributação: - grupoTributarioId: referência ao GrupoTributario
 * (preferível) - aliquotaIcms/Pis/Cofins/cstIcms/cstPis/cstCofins/cfop: campos
 * legado
 */
public record ProdutoDTO(
                // Identificação
                UUID id, String nome, String descricao, String codigoBarras, String codigoNcm, String codigoCest,
                String unidadeMedida, String origem,

                // Precificação
                BigDecimal precoVenda, BigDecimal precoCusto, BigDecimal margemLucro,

                // Estoque
                Integer estoqueMinimo, Integer estoqueAtual, ProdutoStatus status,

                // Dimensões / Logística
                BigDecimal pesoBruto, BigDecimal pesoLiquido, BigDecimal larguraCm, BigDecimal alturaCm,
                BigDecimal profundidadeCm,

                // Imagens
                String imagemUrl, String imagensUrls,

                // Tributação — Grupo (preferencial)
                UUID grupoTributarioId, String grupoTributarioNome,

                // Tributação — Legado (campos diretos)
                BigDecimal aliquotaIcms, BigDecimal aliquotaPis, BigDecimal aliquotaCofins, String cstIcms,
                String cstPis, String cstCofins, String cfop,

                // Relacionamentos
                UUID categoriaId, String categoriaNome, UUID fornecedorPrincipalId, String fornecedorPrincipalNome,

                // Variações
                Boolean temVariacoes, List<ProdutoVariacaoDTO> variacoes,

                // PDV — favorito
                Boolean favorito,

                // Auditoria
                LocalDateTime criadoEm, LocalDateTime atualizadoEm, LocalDateTime deletadoEm) {
        public ProdutoDTO(Produto entity) {
                this(entity.getId(), entity.getNome(), entity.getDescricao(), entity.getCodigoBarras(),
                                entity.getCodigoNcm(), entity.getCodigoCest(), entity.getUnidadeMedida(),
                                entity.getOrigem(), entity.getPrecoVenda(), entity.getPrecoCusto(),
                                entity.getMargemLucro(), entity.getEstoqueMinimo(), entity.getEstoqueAtual(),
                                entity.getStatus(), entity.getPesoBruto(), entity.getPesoLiquido(),
                                entity.getLarguraCm(), entity.getAlturaCm(), entity.getProfundidadeCm(),
                                entity.getImagemUrl(), entity.getImagensUrls(),
                                entity.getGrupoTributario() != null ? entity.getGrupoTributario().getId() : null,
                                entity.getGrupoTributario() != null ? entity.getGrupoTributario().getNome() : null,
                                entity.getAliquotaIcms(), entity.getAliquotaPis(), entity.getAliquotaCofins(),
                                entity.getCstIcms(), entity.getCstPis(), entity.getCstCofins(), entity.getCfop(),
                                entity.getCategoria() != null ? entity.getCategoria().getId() : null,
                                entity.getCategoria() != null ? entity.getCategoria().getNome() : null,
                                entity.getFornecedorPrincipal() != null ? entity.getFornecedorPrincipal().getId()
                                                : null,
                                entity.getFornecedorPrincipal() != null ? entity
                                                .getFornecedorPrincipal().getNomeFantasia() : null,
                                entity.getTemVariacoes(),
                                entity.getVariacoes() != null ? entity.getVariacoes().stream()
                                                .map(ProdutoVariacaoDTO::new).collect(Collectors.toList()) : List.of(),
                                entity.getFavorito(), entity.getCriadoEm(), entity.getAtualizadoEm(),
                                entity.getDeletadoEm());
        }
}
