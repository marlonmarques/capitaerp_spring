# Módulo: Estoque & Produtos

## Entidades

```java
@Entity
@Table(name = "produtos")
public class Produto extends BaseEntity {

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @Column(length = 1000)
    private String descricao;

    @NotBlank
    @Column(unique = true)
    private String codigoBarras;

    // Código NCM para NF-e
    @Column(length = 8)
    private String codigoNcm;

    // CEST (se aplicável)
    private String codigoCest;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoVenda;

    @Column(precision = 10, scale = 2)
    private BigDecimal precoCusto;

    @NotNull
    @Min(0)
    private Integer estoqueMinimo;

    @NotNull
    @Min(0)
    private Integer estoqueAtual;

    @Enumerated(EnumType.STRING)
    private ProdutoStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id")
    private Fornecedor fornecedorPrincipal;

    // Impostos
    @Column(precision = 5, scale = 2)
    private BigDecimal aliquotaIcms;

    @Column(precision = 5, scale = 2)
    private BigDecimal aliquotaPis;

    @Column(precision = 5, scale = 2)
    private BigDecimal aliquotaCofins;

    private String cstIcms;
    private String cstPis;
    private String cstCofins;
    private String cfop;

    public boolean isAbaixoEstoqueMinimo() {
        return estoqueAtual < estoqueMinimo;
    }

    public void darBaixa(int quantidade) {
        if (quantidade > estoqueAtual) {
            throw new EstoqueInsuficienteException(
                "Estoque insuficiente para %s. Disponível: %d, Solicitado: %d"
                    .formatted(nome, estoqueAtual, quantidade)
            );
        }
        this.estoqueAtual -= quantidade;
    }

    public void darEntrada(int quantidade) {
        if (quantidade <= 0) throw new IllegalArgumentException("Quantidade deve ser positiva");
        this.estoqueAtual += quantidade;
    }
}
```

```java
@Entity
@Table(name = "movimentacoes_estoque")
public class MovimentacaoEstoque extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id")
    private Produto produto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimentacao tipo; // ENTRADA, SAIDA, AJUSTE, DEVOLUCAO

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false)
    private Integer saldoAnterior;

    @Column(nullable = false)
    private Integer saldoPosterior;

    private String motivo;

    // Rastreabilidade: pode ser ligada a uma venda, NF de compra, etc.
    private UUID referenciaId;
    private String referenciaTipo; // "VENDA", "COMPRA", "AJUSTE_MANUAL"
}
```

## Service de Estoque

```java
@Service
@Transactional
@Slf4j
public class EstoqueService {

    private final ProdutoRepository produtoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final ApplicationEventPublisher eventPublisher;

    public void darBaixa(UUID produtoId, int quantidade, String referenciaId, String tipo) {
        Produto produto = produtoRepository.findById(produtoId)
            .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + produtoId));

        int saldoAnterior = produto.getEstoqueAtual();
        produto.darBaixa(quantidade); // lança EstoqueInsuficienteException se necessário

        registrarMovimentacao(produto, TipoMovimentacao.SAIDA, quantidade,
            saldoAnterior, produto.getEstoqueAtual(), referenciaId, tipo);

        if (produto.isAbaixoEstoqueMinimo()) {
            eventPublisher.publishEvent(new EstoqueAbaixoMinimoEvent(produto));
        }
    }

    public void darEntrada(UUID produtoId, int quantidade, String referenciaId, String tipo) {
        Produto produto = produtoRepository.findById(produtoId)
            .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + produtoId));

        int saldoAnterior = produto.getEstoqueAtual();
        produto.darEntrada(quantidade);

        registrarMovimentacao(produto, TipoMovimentacao.ENTRADA, quantidade,
            saldoAnterior, produto.getEstoqueAtual(), referenciaId, tipo);
    }

    private void registrarMovimentacao(Produto produto, TipoMovimentacao tipo,
            int qtd, int saldoAnt, int saldoPost, String refId, String refTipo) {
        var mov = new MovimentacaoEstoque();
        mov.setProduto(produto);
        mov.setTipo(tipo);
        mov.setQuantidade(qtd);
        mov.setSaldoAnterior(saldoAnt);
        mov.setSaldoPosterior(saldoPost);
        mov.setReferenciaId(refId != null ? UUID.fromString(refId) : null);
        mov.setReferenciaTipo(refTipo);
        movimentacaoRepository.save(mov);
    }

    @Transactional(readOnly = true)
    public List<ProdutoAbaixoMinimoResponse> buscarAbaixoMinimo() {
        return produtoRepository.findByEstoqueAtualLessThanEstoqueMinimo()
            .stream()
            .map(p -> new ProdutoAbaixoMinimoResponse(
                p.getId(), p.getNome(), p.getEstoqueAtual(), p.getEstoqueMinimo()
            ))
            .toList();
    }
}
```

## Repository com Queries

```java
public interface ProdutoRepository extends JpaRepository<Produto, UUID> {

    Optional<Produto> findByCodigoBarras(String codigoBarras);

    @Query("SELECT p FROM Produto p WHERE p.estoqueAtual < p.estoqueMinimo AND p.status = 'ATIVO'")
    List<Produto> findByEstoqueAtualLessThanEstoqueMinimo();

    @Query("""
        SELECT p FROM Produto p
        WHERE (:busca IS NULL OR LOWER(p.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
               OR p.codigoBarras = :busca)
        AND (:categoriaId IS NULL OR p.categoria.id = :categoriaId)
        AND p.status = 'ATIVO'
        """)
    Page<Produto> findComFiltros(
        @Param("busca") String busca,
        @Param("categoriaId") UUID categoriaId,
        Pageable pageable
    );
}
```

## Migration Flyway

```sql
-- V1__create_produtos.sql
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    codigo_barras VARCHAR(50) UNIQUE NOT NULL,
    codigo_ncm VARCHAR(8),
    codigo_cest VARCHAR(7),
    preco_venda NUMERIC(10,2) NOT NULL,
    preco_custo NUMERIC(10,2),
    estoque_minimo INTEGER NOT NULL DEFAULT 0,
    estoque_atual INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    aliquota_icms NUMERIC(5,2),
    aliquota_pis NUMERIC(5,2),
    aliquota_cofins NUMERIC(5,2),
    cst_icms VARCHAR(10),
    cst_pis VARCHAR(3),
    cst_cofins VARCHAR(3),
    cfop VARCHAR(6),
    categoria_id UUID REFERENCES categorias(id),
    fornecedor_id UUID REFERENCES fornecedores(id),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100)
);

CREATE INDEX idx_produtos_codigo_barras ON produtos(codigo_barras);
CREATE INDEX idx_produtos_status ON produtos(status);
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);

CREATE TABLE movimentacoes_estoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES produtos(id),
    tipo VARCHAR(20) NOT NULL,
    quantidade INTEGER NOT NULL,
    saldo_anterior INTEGER NOT NULL,
    saldo_posterior INTEGER NOT NULL,
    motivo TEXT,
    referencia_id UUID,
    referencia_tipo VARCHAR(50),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    criado_por VARCHAR(100)
);
```
