# Módulo: Vendas & PDV

## Entidades de Venda

```java
@Entity
@Table(name = "vendas")
public class Venda extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VendaStatus status; // ORCAMENTO, ABERTA, FECHADA, CANCELADA

    @Enumerated(EnumType.STRING)
    private TipoDocumentoFiscal tipoDocumento; // NFE, NFCE, NFSE

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 10, scale = 2)
    private BigDecimal desconto;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    private String observacoes;

    @OneToMany(mappedBy = "venda", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemVenda> itens = new ArrayList<>();

    @OneToMany(mappedBy = "venda", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PagamentoVenda> pagamentos = new ArrayList<>();

    // Referência para o documento fiscal gerado
    private UUID documentoFiscalId;

    public BigDecimal calcularTotal() {
        var sub = itens.stream()
            .map(ItemVenda::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.subtotal = sub;
        this.total = sub.subtract(desconto != null ? desconto : BigDecimal.ZERO);
        return this.total;
    }

    public void adicionarItem(Produto produto, int quantidade, BigDecimal precoUnitario) {
        var item = new ItemVenda();
        item.setVenda(this);
        item.setProduto(produto);
        item.setQuantidade(quantidade);
        item.setPrecoUnitario(precoUnitario);
        item.calcularSubtotal();
        itens.add(item);
        calcularTotal();
    }
}

@Entity
@Table(name = "itens_venda")
public class ItemVenda extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "venda_id")
    private Venda venda;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id")
    private Produto produto;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoUnitario;

    @Column(precision = 5, scale = 2)
    private BigDecimal desconto;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    // Snapshot dos dados fiscais no momento da venda
    private String codigoNcm;
    private String cfop;
    private String cstIcms;
    private BigDecimal aliquotaIcms;

    public void calcularSubtotal() {
        var base = precoUnitario.multiply(new BigDecimal(quantidade));
        this.subtotal = desconto != null
            ? base.subtract(desconto)
            : base;
    }
}
```

## Use Case: Fechar Venda

```java
@Service
@Transactional
@Slf4j
public class VendaService {

    private final VendaRepository vendaRepository;
    private final EstoqueService estoqueService;
    private final ApplicationEventPublisher eventPublisher;
    private final FiscalDocumentoService fiscalService;

    /**
     * Fecha a venda, dá baixa no estoque e emite documento fiscal.
     */
    public VendaResponse fecharVenda(UUID vendaId, FecharVendaRequest request) {
        var venda = vendaRepository.findByIdWithItens(vendaId)
            .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada: " + vendaId));

        if (venda.getStatus() != VendaStatus.ABERTA) {
            throw new BusinessException("Venda não está aberta: " + venda.getStatus());
        }

        // 1. Dar baixa no estoque para cada item
        for (ItemVenda item : venda.getItens()) {
            estoqueService.darBaixa(
                item.getProduto().getId(),
                item.getQuantidade(),
                vendaId.toString(),
                "VENDA"
            );
        }

        // 2. Registrar pagamentos
        registrarPagamentos(venda, request.pagamentos());

        // 3. Fechar venda
        venda.setStatus(VendaStatus.FECHADA);
        vendaRepository.save(venda);

        // 4. Publicar evento para emissão assíncrona do documento fiscal
        if (request.emitirDocumentoFiscal()) {
            eventPublisher.publishEvent(new VendaFechadaEvent(venda));
        }

        log.info("Venda {} fechada. Total: {}", vendaId, venda.getTotal());
        return VendaResponse.from(venda);
    }

    public VendaResponse cancelar(UUID vendaId, String motivo) {
        var venda = vendaRepository.findByIdWithItens(vendaId)
            .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada: " + vendaId));

        if (venda.getStatus() == VendaStatus.CANCELADA) {
            throw new BusinessException("Venda já cancelada");
        }

        // Estorno de estoque se a venda estava fechada
        if (venda.getStatus() == VendaStatus.FECHADA) {
            for (ItemVenda item : venda.getItens()) {
                estoqueService.darEntrada(
                    item.getProduto().getId(),
                    item.getQuantidade(),
                    vendaId.toString(),
                    "CANCELAMENTO_VENDA"
                );
            }
        }

        venda.setStatus(VendaStatus.CANCELADA);
        eventPublisher.publishEvent(new VendaCanceladaEvent(venda, motivo));

        return VendaResponse.from(vendaRepository.save(venda));
    }
}
```

## Controller REST

```java
@RestController
@RequestMapping("/api/v1/vendas")
@Tag(name = "Vendas")
@RequiredArgsConstructor
public class VendaController {

    private final VendaService vendaService;

    @PostMapping
    @Operation(summary = "Criar venda/orçamento")
    public ResponseEntity<VendaResponse> criar(@Valid @RequestBody VendaRequest request) {
        return ResponseEntity.status(201).body(vendaService.criar(request));
    }

    @PostMapping("/{id}/itens")
    @Operation(summary = "Adicionar item à venda")
    public ResponseEntity<VendaResponse> adicionarItem(
        @PathVariable UUID id,
        @Valid @RequestBody ItemVendaRequest request
    ) {
        return ResponseEntity.ok(vendaService.adicionarItem(id, request));
    }

    @PostMapping("/{id}/fechar")
    @Operation(summary = "Fechar venda e emitir fiscal")
    public ResponseEntity<VendaResponse> fechar(
        @PathVariable UUID id,
        @Valid @RequestBody FecharVendaRequest request
    ) {
        return ResponseEntity.ok(vendaService.fecharVenda(id, request));
    }

    @PostMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar venda")
    public ResponseEntity<VendaResponse> cancelar(
        @PathVariable UUID id,
        @RequestBody @NotBlank String motivo
    ) {
        return ResponseEntity.ok(vendaService.cancelar(id, motivo));
    }

    @GetMapping
    @Operation(summary = "Listar vendas com filtros")
    public Page<VendaResponse> listar(
        @ParameterObject Pageable pageable,
        @RequestParam(required = false) VendaStatus status,
        @RequestParam(required = false) UUID clienteId,
        @RequestParam(required = false) LocalDate dataInicio,
        @RequestParam(required = false) LocalDate dataFim
    ) {
        return vendaService.listar(status, clienteId, dataInicio, dataFim, pageable);
    }
}
```

## Migration Flyway

```sql
-- V4__create_vendas.sql
CREATE TABLE vendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTA',
    tipo_documento VARCHAR(10),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    desconto NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    observacoes TEXT,
    documento_fiscal_id UUID,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100)
);

CREATE TABLE itens_venda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    preco_unitario NUMERIC(10,2) NOT NULL,
    desconto NUMERIC(10,2),
    subtotal NUMERIC(10,2) NOT NULL,
    codigo_ncm VARCHAR(8),
    cfop VARCHAR(6),
    cst_icms VARCHAR(10),
    aliquota_icms NUMERIC(5,2),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE pagamentos_venda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID NOT NULL REFERENCES vendas(id),
    forma_pagamento VARCHAR(30) NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendas_cliente ON vendas(cliente_id);
CREATE INDEX idx_vendas_status ON vendas(status);
CREATE INDEX idx_vendas_criado_em ON vendas(criado_em);
CREATE INDEX idx_itens_venda_venda ON itens_venda(venda_id);
```
