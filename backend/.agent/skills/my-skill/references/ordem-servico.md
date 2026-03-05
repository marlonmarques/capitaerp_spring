# Módulo: Ordem de Serviço

## Entidades

```java
@Entity
@Table(name = "ordens_servico")
public class OrdemServico extends BaseEntity {

    @Column(nullable = false, unique = true)
    private Integer numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrdemServicoStatus status;
    // ABERTA, EM_ANDAMENTO, AGUARDANDO_PECA, CONCLUIDA, CANCELADA, FATURADA

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id")
    private Usuario tecnico;

    // Equipamento / objeto do serviço
    private String equipamento;
    private String marca;
    private String modelo;
    private String numeroSerie;
    private String descricaoProblema;

    @Column(length = 2000)
    private String diagnostico;

    @Column(length = 2000)
    private String solucaoAplicada;

    private LocalDateTime dataAbertura;
    private LocalDateTime dataPrevisao;
    private LocalDateTime dataConclusao;

    @Column(precision = 10, scale = 2)
    private BigDecimal valorServicos;

    @Column(precision = 10, scale = 2)
    private BigDecimal valorPecas;

    @Column(precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(precision = 5, scale = 2)
    private BigDecimal garantiaMeses;

    // Peças utilizadas
    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemOrdemServico> itens = new ArrayList<>();

    // Serviços prestados
    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServicoOrdemServico> servicos = new ArrayList<>();

    // Vínculo com a NFS-e gerada ao faturar
    private UUID documentoFiscalId;

    public void calcularTotal() {
        this.valorPecas = itens.stream()
            .map(ItemOrdemServico::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.valorServicos = servicos.stream()
            .map(ServicoOrdemServico::getValor)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.valorTotal = valorServicos.add(valorPecas);
    }
}

@Entity
@Table(name = "itens_os") // peças usadas
public class ItemOrdemServico extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ordem_servico_id")
    private OrdemServico ordemServico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id")
    private Produto produto; // null se for peça sem cadastro

    private String descricao; // descrição livre se não tiver produto
    private Integer quantidade;
    private BigDecimal valorUnitario;
    private BigDecimal subtotal;
}

@Entity
@Table(name = "servicos_os")
public class ServicoOrdemServico extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ordem_servico_id")
    private OrdemServico ordemServico;

    private String descricao;
    private BigDecimal valor;

    // Código de serviço para a NFS-e
    private String itemListaServico;
    private String codigoCnae;
}
```

## Service de OS

```java
@Service
@Transactional
@Slf4j
public class OrdemServicoService {

    private final OrdemServicoRepository osRepository;
    private final EstoqueService estoqueService;
    private final NfseService nfseService;
    private final SequenceService sequenceService;

    public OrdemServicoResponse abrir(AbrirOrdemServicoRequest request) {
        var os = new OrdemServico();
        os.setNumero(sequenceService.proximoNumeroOS());
        os.setStatus(OrdemServicoStatus.ABERTA);
        os.setDataAbertura(LocalDateTime.now());
        // ... mapear campos
        return OrdemServicoResponse.from(osRepository.save(os));
    }

    public OrdemServicoResponse adicionarPeca(UUID osId, AdicionarPecaRequest request) {
        var os = osRepository.findById(osId)
            .orElseThrow(() -> new EntityNotFoundException("OS não encontrada"));

        if (!os.getStatus().permiteEdicao()) {
            throw new BusinessException("OS não permite adição de peças no status: " + os.getStatus());
        }

        var item = new ItemOrdemServico();
        item.setOrdemServico(os);

        if (request.produtoId() != null) {
            // Reserva estoque ao adicionar a peça
            estoqueService.darBaixa(request.produtoId(), request.quantidade(),
                osId.toString(), "OS");
        }

        item.setQuantidade(request.quantidade());
        item.setValorUnitario(request.valorUnitario());
        item.setSubtotal(request.valorUnitario().multiply(new BigDecimal(request.quantidade())));
        os.getItens().add(item);
        os.calcularTotal();

        return OrdemServicoResponse.from(osRepository.save(os));
    }

    /**
     * Fatura a OS, gerando NFS-e automaticamente.
     */
    public OrdemServicoResponse faturar(UUID osId) {
        var os = osRepository.findById(osId)
            .orElseThrow(() -> new EntityNotFoundException("OS não encontrada"));

        if (os.getStatus() != OrdemServicoStatus.CONCLUIDA) {
            throw new BusinessException("Somente OS concluídas podem ser faturadas.");
        }

        // Cria documento fiscal a partir da OS
        var documento = criarDocumentoFiscalParaOS(os);
        nfseService.emitir(documento);

        os.setStatus(OrdemServicoStatus.FATURADA);
        os.setDocumentoFiscalId(documento.getId());

        return OrdemServicoResponse.from(osRepository.save(os));
    }

    private DocumentoFiscal criarDocumentoFiscalParaOS(OrdemServico os) {
        // Lógica de montar o DocumentoFiscal a partir dos dados da OS
        // Usa o primeiro serviço para itemListaServico e codigoCnae
        var doc = new DocumentoFiscal();
        doc.setTipo(TipoDocumento.NFSE);
        doc.setStatus(DocumentoStatus.PENDENTE);
        doc.setEmpresa(os.getTecnico().getEmpresa());
        doc.setValorServicos(os.getValorTotal());
        doc.setDescricaoServico(os.getSolucaoAplicada());

        os.getServicos().stream().findFirst().ifPresent(s -> {
            doc.setItemListaServico(s.getItemListaServico());
            doc.setCodigoCnae(s.getCodigoCnae());
        });

        return doc;
    }
}
```

## Controller

```java
@RestController
@RequestMapping("/api/v1/ordens-servico")
@Tag(name = "Ordens de Serviço")
@RequiredArgsConstructor
public class OrdemServicoController {

    private final OrdemServicoService osService;

    @PostMapping
    public ResponseEntity<OrdemServicoResponse> abrir(@Valid @RequestBody AbrirOrdemServicoRequest req) {
        return ResponseEntity.status(201).body(osService.abrir(req));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrdemServicoResponse> atualizarStatus(
        @PathVariable UUID id,
        @RequestParam OrdemServicoStatus novoStatus,
        @RequestBody(required = false) String observacao
    ) {
        return ResponseEntity.ok(osService.atualizarStatus(id, novoStatus, observacao));
    }

    @PostMapping("/{id}/pecas")
    public ResponseEntity<OrdemServicoResponse> adicionarPeca(
        @PathVariable UUID id,
        @Valid @RequestBody AdicionarPecaRequest req
    ) {
        return ResponseEntity.ok(osService.adicionarPeca(id, req));
    }

    @PostMapping("/{id}/faturar")
    public ResponseEntity<OrdemServicoResponse> faturar(@PathVariable UUID id) {
        return ResponseEntity.ok(osService.faturar(id));
    }

    @GetMapping
    public Page<OrdemServicoResponse> listar(
        @ParameterObject Pageable pageable,
        @RequestParam(required = false) OrdemServicoStatus status,
        @RequestParam(required = false) UUID clienteId,
        @RequestParam(required = false) UUID tecnicoId
    ) {
        return osService.listar(status, clienteId, tecnicoId, pageable);
    }
}
```
