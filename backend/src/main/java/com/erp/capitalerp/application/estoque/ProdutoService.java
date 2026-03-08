package com.erp.capitalerp.application.estoque;

import com.erp.capitalerp.application.estoque.dto.ProdutoBuscaVendaDTO;
import com.erp.capitalerp.application.estoque.dto.ProdutoDTO;
import com.erp.capitalerp.application.estoque.dto.ProdutoVariacaoDTO;
import com.erp.capitalerp.domain.estoque.*;
import com.erp.capitalerp.domain.fiscal.GrupoTributario;
import com.erp.capitalerp.infrastructure.persistence.cadastros.CategoriaRepository;
import com.erp.capitalerp.infrastructure.persistence.cadastros.FornecedorRepository;
import com.erp.capitalerp.infrastructure.persistence.estoque.ProdutoRepository;
import com.erp.capitalerp.infrastructure.persistence.estoque.ProdutoVariacaoRepository;
import com.erp.capitalerp.infrastructure.persistence.cadastros.GrupoTributarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@Transactional
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final ProdutoVariacaoRepository variacaoRepository;
    private final CategoriaRepository categoriaRepository;
    private final FornecedorRepository fornecedorRepository;
    private final GrupoTributarioRepository grupoTributarioRepository;

    public ProdutoService(ProdutoRepository produtoRepository, ProdutoVariacaoRepository variacaoRepository,
            CategoriaRepository categoriaRepository, FornecedorRepository fornecedorRepository,
            GrupoTributarioRepository grupoTributarioRepository) {
        this.produtoRepository = produtoRepository;
        this.variacaoRepository = variacaoRepository;
        this.categoriaRepository = categoriaRepository;
        this.fornecedorRepository = fornecedorRepository;
        this.grupoTributarioRepository = grupoTributarioRepository;
    }

    // ─── Consultas ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ProdutoDTO> listar(String busca, String status, Pageable pageable) {
        ProdutoStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = ProdutoStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }
        return produtoRepository.findComFiltros(busca, statusEnum, pageable).map(ProdutoDTO::new);
    }

    @Transactional(readOnly = true)
    public List<ProdutoBuscaVendaDTO> buscarParaVenda(String busca) {
        String buscaNormalizada = busca != null ? busca.trim().toLowerCase() : "";

        // 1. Produtos simples (sem variações)
        List<ProdutoBuscaVendaDTO> simples = produtoRepository.findAllAtivos().stream()
                .filter(p -> !Boolean.TRUE.equals(p.getTemVariacoes()))
                .filter(p -> p.getNome().toLowerCase().contains(buscaNormalizada) ||
                        (p.getCodigoBarras() != null && p.getCodigoBarras().contains(buscaNormalizada)))
                .map(this::mapToVendaDTO)
                .toList();

        // 2. Variações de produtos
        List<ProdutoBuscaVendaDTO> variacoes = variacaoRepository.findAll().stream()
                .filter(v -> Boolean.TRUE.equals(v.getAtivo()) && v.getProduto().getDeletadoEm() == null)
                .filter(v -> v.getProduto().getNome().toLowerCase().contains(buscaNormalizada) ||
                        v.getNomeVariacao().toLowerCase().contains(buscaNormalizada) ||
                        (v.getSku() != null && v.getSku().toLowerCase().contains(buscaNormalizada)) ||
                        (v.getCodigoBarras() != null && v.getCodigoBarras().contains(buscaNormalizada)))
                .map(this::mapToVendaDTO)
                .toList();

        // Une e limita o resultado para não sobrecarregar
        return Stream.concat(simples.stream(), variacoes.stream())
                .sorted(Comparator.comparing(ProdutoBuscaVendaDTO::nome))
                .limit(50)
                .toList();
    }

    private ProdutoBuscaVendaDTO mapToVendaDTO(Produto p) {
        return new ProdutoBuscaVendaDTO(
                p.getId(), null, p.getCodigoBarras(), p.getNome(),
                p.getPrecoVenda(), p.getEstoqueAtual(), p.getUnidadeMedida(),
                p.getCodigoNcm(), p.getCfop(),
                p.getCstIcms() != null ? p.getCstIcms() : "102",
                p.getAliquotaIcms() != null ? p.getAliquotaIcms() : BigDecimal.ZERO,
                p.getCstPis() != null ? p.getCstPis() : "01",
                p.getAliquotaPis() != null ? p.getAliquotaPis() : BigDecimal.ZERO,
                p.getCstCofins() != null ? p.getCstCofins() : "01",
                p.getAliquotaCofins() != null ? p.getAliquotaCofins() : BigDecimal.ZERO,
                p.getOrigem() != null && p.getOrigem().equals("NACIONAL") ? 0 : 1);
    }

    private ProdutoBuscaVendaDTO mapToVendaDTO(ProdutoVariacao v) {
        Produto p = v.getProduto();
        String nomeFull = p.getNome() + " [" + v.getNomeVariacao() + "]";
        return new ProdutoBuscaVendaDTO(
                p.getId(), v.getId(), v.getSku() != null ? v.getSku() : v.getCodigoBarras(), nomeFull,
                v.getPrecoVendaEfetivo(), v.getEstoqueAtual(), p.getUnidadeMedida(),
                p.getCodigoNcm(), p.getCfop(),
                p.getCstIcms() != null ? p.getCstIcms() : "102",
                p.getAliquotaIcms() != null ? p.getAliquotaIcms() : BigDecimal.ZERO,
                p.getCstPis() != null ? p.getCstPis() : "01",
                p.getAliquotaPis() != null ? p.getAliquotaPis() : BigDecimal.ZERO,
                p.getCstCofins() != null ? p.getCstCofins() : "01",
                p.getAliquotaCofins() != null ? p.getAliquotaCofins() : BigDecimal.ZERO,
                p.getOrigem() != null && p.getOrigem().equals("NACIONAL") ? 0 : 1);
    }

    @Transactional(readOnly = true)
    public ProdutoDTO buscarPorId(UUID id) {
        Produto produto = produtoRepository.findByIdComVariacoes(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + id));
        return new ProdutoDTO(produto);
    }

    @Transactional(readOnly = true)
    public List<ProdutoDTO> listarAtivos() {
        return produtoRepository.findAllAtivos().stream().map(ProdutoDTO::new).toList();
    }

    // ─── Mutações ─────────────────────────────────────────────────────────────

    @Transactional
    public ProdutoDTO inserir(ProdutoDTO dto) {
        Produto entity = new Produto();
        mapDtoToEntity(dto, entity);
        entity.setEstoqueAtual(dto.estoqueAtual() != null ? dto.estoqueAtual() : 0);
        entity.setStatus(dto.status() != null ? dto.status() : ProdutoStatus.ATIVO);
        entity = produtoRepository.save(entity);

        // Gerar EAN-13 interno se não foi informado
        if (entity.getCodigoBarras() == null || entity.getCodigoBarras().isBlank()) {
            entity.setCodigoBarras(gerarEan13Interno(entity));
            entity = produtoRepository.save(entity);
        }

        // Salvar variações se informadas
        if (Boolean.TRUE.equals(dto.temVariacoes()) && dto.variacoes() != null) {
            salvarVariacoes(entity, dto.variacoes());
            entity.recalcularEstoqueDasVariacoes();
            produtoRepository.save(entity);
        }

        return new ProdutoDTO(produtoRepository.findByIdComVariacoes(entity.getId()).orElseThrow());
    }

    @Transactional
    public ProdutoDTO atualizar(UUID id, ProdutoDTO dto) {
        Produto entity = produtoRepository.findByIdComVariacoes(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + id));
        mapDtoToEntity(dto, entity);
        if (dto.status() != null)
            entity.setStatus(dto.status());

        // Substituir variações completamente
        if (Boolean.TRUE.equals(entity.getTemVariacoes()) && dto.variacoes() != null) {
            entity.getVariacoes().clear();
            produtoRepository.flush(); // garante orphan removal
            salvarVariacoes(entity, dto.variacoes());
            entity.recalcularEstoqueDasVariacoes();
        }

        entity = produtoRepository.save(entity);
        return new ProdutoDTO(produtoRepository.findByIdComVariacoes(entity.getId()).orElseThrow());
    }

    /** Soft-delete: marca deletadoEm e status=INATIVO. */
    @Transactional
    public void excluir(UUID id) {
        Produto entity = produtoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + id));
        entity.excluirLogicamente();
        produtoRepository.save(entity);
    }

    /** Toggle favorito — inverte o flag sem necessidade do DTO completo. */
    @Transactional
    public ProdutoDTO toggleFavorito(UUID id) {
        Produto entity = produtoRepository.findByIdComVariacoes(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + id));
        entity.setFavorito(!Boolean.TRUE.equals(entity.getFavorito()));
        produtoRepository.save(entity);
        return new ProdutoDTO(entity);
    }

    // ─── Variações ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ProdutoVariacaoDTO> listarVariacoes(UUID produtoId) {
        return variacaoRepository.findByProdutoId(produtoId).stream().map(ProdutoVariacaoDTO::new).toList();
    }

    @Transactional
    public ProdutoVariacaoDTO adicionarVariacao(UUID produtoId, ProdutoVariacaoDTO dto) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + produtoId));
        produto.setTemVariacoes(true);
        ProdutoVariacao variacao = buildVariacao(produto, dto);
        produto.getVariacoes().add(variacao);
        produto.recalcularEstoqueDasVariacoes();
        variacao = variacaoRepository.save(variacao);
        return new ProdutoVariacaoDTO(variacao);
    }

    @Transactional
    public ProdutoVariacaoDTO atualizarVariacao(UUID produtoId, UUID variacaoId, ProdutoVariacaoDTO dto) {
        ProdutoVariacao variacao = variacaoRepository.findById(variacaoId)
                .orElseThrow(() -> new EntityNotFoundException("Variação não encontrada: " + variacaoId));
        if (!variacao.getProduto().getId().equals(produtoId)) {
            throw new IllegalArgumentException("Variação não pertence ao produto informado");
        }
        variacao.getAtributos().clear();
        mapVariacaoDto(variacao, dto);
        variacao = variacaoRepository.save(variacao);
        variacao.getProduto().recalcularEstoqueDasVariacoes();
        return new ProdutoVariacaoDTO(variacao);
    }

    @Transactional
    public void excluirVariacao(UUID produtoId, UUID variacaoId) {
        ProdutoVariacao variacao = variacaoRepository.findById(variacaoId)
                .orElseThrow(() -> new EntityNotFoundException("Variação não encontrada: " + variacaoId));
        if (!variacao.getProduto().getId().equals(produtoId)) {
            throw new IllegalArgumentException("Variação não pertence ao produto informado");
        }
        Produto produto = variacao.getProduto();
        produto.getVariacoes().remove(variacao);
        produto.recalcularEstoqueDasVariacoes();
        variacaoRepository.delete(variacao);
    }

    // ─── Auxiliares privados ──────────────────────────────────────────────────

    private void mapDtoToEntity(ProdutoDTO dto, Produto entity) {
        entity.setNome(dto.nome());
        entity.setDescricao(dto.descricao());
        entity.setCodigoBarras(dto.codigoBarras());
        entity.setCodigoNcm(dto.codigoNcm());
        entity.setCodigoCest(dto.codigoCest());
        if (dto.unidadeMedida() != null)
            entity.setUnidadeMedida(dto.unidadeMedida());
        if (dto.origem() != null)
            entity.setOrigem(dto.origem());
        entity.setPrecoCusto(dto.precoCusto());
        entity.setMargemLucro(dto.margemLucro());

        // Cálculo do preço de venda
        if (dto.precoCusto() != null && dto.margemLucro() != null) {
            BigDecimal margem = dto.margemLucro().divide(new BigDecimal("100"));
            entity.setPrecoVenda(dto.precoCusto().multiply(BigDecimal.ONE.add(margem)));
        } else {
            entity.setPrecoVenda(dto.precoVenda());
        }

        entity.setEstoqueMinimo(dto.estoqueMinimo() != null ? dto.estoqueMinimo() : 0);

        // Dimensões
        entity.setPesoBruto(dto.pesoBruto());
        entity.setPesoLiquido(dto.pesoLiquido());
        entity.setLarguraCm(dto.larguraCm());
        entity.setAlturaCm(dto.alturaCm());
        entity.setProfundidadeCm(dto.profundidadeCm());

        // Imagens
        entity.setImagemUrl(dto.imagemUrl());
        entity.setImagensUrls(dto.imagensUrls());

        // Tributação legado
        entity.setAliquotaIcms(dto.aliquotaIcms());
        entity.setAliquotaPis(dto.aliquotaPis());
        entity.setAliquotaCofins(dto.aliquotaCofins());
        entity.setCstIcms(dto.cstIcms());
        entity.setCstPis(dto.cstPis());
        entity.setCstCofins(dto.cstCofins());
        entity.setCfop(dto.cfop());

        // Grupo tributário
        if (dto.grupoTributarioId() != null) {
            entity.setGrupoTributario(grupoTributarioRepository.getReferenceById(dto.grupoTributarioId()));
        } else {
            entity.setGrupoTributario(null);
        }

        // Categoria
        if (dto.categoriaId() != null) {
            entity.setCategoria(categoriaRepository.getReferenceById(dto.categoriaId()));
        } else {
            entity.setCategoria(null);
        }

        // Fornecedor
        if (dto.fornecedorPrincipalId() != null) {
            entity.setFornecedorPrincipal(fornecedorRepository.getReferenceById(dto.fornecedorPrincipalId()));
        } else {
            entity.setFornecedorPrincipal(null);
        }

        entity.setTemVariacoes(Boolean.TRUE.equals(dto.temVariacoes()));
        entity.setFavorito(Boolean.TRUE.equals(dto.favorito()));
    }

    private void salvarVariacoes(Produto produto, List<ProdutoVariacaoDTO> dtos) {
        for (ProdutoVariacaoDTO dto : dtos) {
            ProdutoVariacao variacao = buildVariacao(produto, dto);
            produto.getVariacoes().add(variacao);
        }
    }

    private ProdutoVariacao buildVariacao(Produto produto, ProdutoVariacaoDTO dto) {
        ProdutoVariacao variacao = new ProdutoVariacao();
        variacao.setProduto(produto);
        mapVariacaoDto(variacao, dto);
        return variacao;
    }

    private void mapVariacaoDto(ProdutoVariacao variacao, ProdutoVariacaoDTO dto) {
        variacao.setSku(dto.sku());
        variacao.setCodigoBarras(dto.codigoBarras());
        variacao.setPrecoCusto(dto.precoCusto());
        variacao.setPrecoVenda(dto.precoVenda());
        variacao.setMargemLucro(dto.margemLucro());
        variacao.setEstoqueMinimo(dto.estoqueMinimo() != null ? dto.estoqueMinimo() : 0);
        variacao.setEstoqueAtual(dto.estoqueAtual() != null ? dto.estoqueAtual() : 0);
        variacao.setAtivo(dto.ativo() != null ? dto.ativo() : true);
        variacao.setImagemUrl(dto.imagemUrl());

        // Mapear atributos
        if (dto.atributos() != null) {
            for (var atributoDto : dto.atributos()) {
                ProdutoVariacaoAtributo atributo = new ProdutoVariacaoAtributo(variacao, atributoDto.tipo(),
                        atributoDto.valor());
                variacao.getAtributos().add(atributo);
            }
        }

        variacao.atualizarNomeVariacao();
    }

    // ─── EAN-13 geração interna ───────────────────────────────────────────────

    /**
     * Gera um EAN-13 interno para produtos sem código de barras. Formato: 789
     * (prefixo brasileiro) + 9 dígitos numéricos do UUID + 1 dígito verificador.
     */
    private String gerarEan13Interno(Produto produto) {
        // Converte os últimos 9 dígitos do UUID em número
        String uuidStr = produto.getId().toString().replaceAll("[^0-9]", "");
        // Pega os últimos 9 dígitos disponíveis (ou completa com zeros)
        while (uuidStr.length() < 9)
            uuidStr = "0" + uuidStr;
        String base12 = "789" + uuidStr.substring(uuidStr.length() - 9);

        // Calcula dígito verificador EAN-13
        int soma = 0;
        for (int i = 0; i < 12; i++) {
            int digito = base12.charAt(i) - '0';
            soma += (i % 2 == 0) ? digito : digito * 3;
        }
        int digitoVerificador = (10 - (soma % 10)) % 10;
        return base12 + digitoVerificador;
    }
}
