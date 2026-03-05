# Testes Automatizados — Guia Completo

## Pirâmide de Testes

```
         [E2E / RestAssured]        ← fluxos reais com BD
        [Integração / Testcontainers] ← repositories, services com BD
      [Unitários / JUnit + Mockito]  ← services, validators, parsers
```

## 1. Testes Unitários (Service Layer)

### Configuração Base

```java
// Não usa Spring context — puro JUnit + Mockito
@ExtendWith(MockitoExtension.class)
class EstoqueServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @Mock
    private MovimentacaoEstoqueRepository movimentacaoRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private EstoqueService estoqueService;
}
```

### Testes de Baixa de Estoque

```java
@Nested
@DisplayName("Dar Baixa no Estoque")
class DarBaixaTest {

    @Test
    @DisplayName("deve dar baixa com sucesso quando há estoque suficiente")
    void deveDarBaixaComSucesso() {
        // GIVEN
        var produto = ProdutoFixture.comEstoque(10);
        when(produtoRepository.findById(produto.getId())).thenReturn(Optional.of(produto));

        // WHEN
        estoqueService.darBaixa(produto.getId(), 3, "venda-123", "VENDA");

        // THEN
        assertThat(produto.getEstoqueAtual()).isEqualTo(7);
        verify(movimentacaoRepository).save(argThat(mov ->
            mov.getTipo() == TipoMovimentacao.SAIDA &&
            mov.getQuantidade() == 3 &&
            mov.getSaldoAnterior() == 10 &&
            mov.getSaldoPosterior() == 7
        ));
    }

    @Test
    @DisplayName("deve lançar EstoqueInsuficienteException quando não há estoque")
    void deveLancarExcecaoEstoqueInsuficiente() {
        // GIVEN
        var produto = ProdutoFixture.comEstoque(2);
        when(produtoRepository.findById(produto.getId())).thenReturn(Optional.of(produto));

        // WHEN + THEN
        assertThatThrownBy(() -> estoqueService.darBaixa(produto.getId(), 5, null, "VENDA"))
            .isInstanceOf(EstoqueInsuficienteException.class)
            .hasMessageContaining("Disponível: 2")
            .hasMessageContaining("Solicitado: 5");

        verify(movimentacaoRepository, never()).save(any());
    }

    @Test
    @DisplayName("deve publicar evento quando estoque cai abaixo do mínimo")
    void devePublicarEventoEstoqueMinimo() {
        // GIVEN - produto com estoque mínimo = 5, atual = 6
        var produto = ProdutoFixture.comEstoque(6, 5);
        when(produtoRepository.findById(produto.getId())).thenReturn(Optional.of(produto));

        // WHEN
        estoqueService.darBaixa(produto.getId(), 2, null, "VENDA");

        // THEN - estoque foi para 4, abaixo do mínimo de 5
        verify(eventPublisher).publishEvent(any(EstoqueAbaixoMinimoEvent.class));
    }
}
```

### Testes do Parser INI

```java
@ExtendWith(MockitoExtension.class)
class AcbrIniParserTest {

    private final AcbrIniParser parser = new AcbrIniParser();

    @Test
    @DisplayName("deve parsear resposta INI completa do ACBr")
    void deveParsearIniCompleto() {
        String ini = """
            [Geral]
            Sucesso=1
            
            [NFSe]
            Numero=1234
            CodigoVerificacao=ABC123
            DataEmissao=2024-01-15T10:30:00
            """;

        var resultado = parser.parse(ini);

        assertThat(resultado).containsKey("NFSe");
        assertThat(resultado.get("NFSe"))
            .containsEntry("Numero", "1234")
            .containsEntry("CodigoVerificacao", "ABC123");
    }

    @Test
    @DisplayName("deve retornar mapa vazio para conteúdo nulo")
    void deveRetornarMapaVazioParaNulo() {
        assertThat(parser.parse(null)).isEmpty();
        assertThat(parser.parse("")).isEmpty();
    }
}
```

### Testes do NfseService com Mock do ACBr

```java
@ExtendWith(MockitoExtension.class)
class NfseServiceTest {

    @Mock private AcbrHttpClient acbrClient;
    @Mock private AcbrIniParser iniParser;
    @Mock private AcbrErrorClassifier errorClassifier;
    @Mock private DocumentoFiscalRepository documentoRepository;
    @Mock private EmpresaConfigService empresaConfigService;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private NfseService nfseService;

    @Test
    @DisplayName("deve autorizar NFS-e quando ACBr retorna número da nota")
    void deveAutorizarNfse() {
        // GIVEN
        var empresa = EmpresaFixture.simplexNacional();
        var documento = DocumentoFiscalFixture.nfse(empresa);

        var acbrResponse = new AcbrResponse(false, "[NFSe]\nNumero=999\n",
            null, "<xml>...</xml>");
        when(acbrClient.post(eq("nfse/emitir"), any())).thenReturn(acbrResponse);
        when(iniParser.parse(any())).thenReturn(Map.of("NFSe", Map.of("Numero", "999")));
        when(errorClassifier.isDuplicateRps(any())).thenReturn(false);
        when(documentoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        var resultado = nfseService.emitir(documento);

        // THEN
        assertThat(resultado.getStatus()).isEqualTo(DocumentoStatus.AUTORIZADO);
        assertThat(resultado.getNumero()).isEqualTo(999);
        verify(eventPublisher).publishEvent(any(DocumentoAutorizadoEvent.class));
    }

    @Test
    @DisplayName("deve redirecionar para consulta quando ACBr indica RPS duplicado")
    void deveRedirecionarParaConsultaEmCasoDeDuplicidade() {
        // GIVEN
        var documento = DocumentoFiscalFixture.nfse();
        var acbrResponse = new AcbrResponse(false, "rps ja processado", null, null);

        when(acbrClient.post(eq("nfse/emitir"), any())).thenReturn(acbrResponse);
        when(errorClassifier.isDuplicateRps("rps ja processado")).thenReturn(true);

        // Mock da consulta por RPS
        var consultaResponse = new AcbrResponse(false, "[NFSe]\nNumero=999\n", null, "<xml/>");
        when(acbrClient.post(eq("nfse/consultar-rps"), any())).thenReturn(consultaResponse);
        when(iniParser.parse(consultaResponse.mensagem()))
            .thenReturn(Map.of("NFSe", Map.of("Numero", "999")));
        when(documentoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        nfseService.emitir(documento);

        // THEN - deve ter tentado consulta ao invés de emitir novamente
        verify(acbrClient, never()).post(eq("nfse/emitir"), any()); // chamado 0x após duplicidade
        verify(acbrClient).post(eq("nfse/consultar-rps"), any());
    }

    @Test
    @DisplayName("deve marcar como PROCESSANDO quando ACBr está indisponível")
    void deveMarcaProcessandoQuandoAcbrIndisponivel() {
        // GIVEN
        var documento = DocumentoFiscalFixture.nfse();
        when(acbrClient.post(any(), any()))
            .thenThrow(new AcbrIndisponivelException("Connection refused"));
        when(documentoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // WHEN + THEN
        assertThatThrownBy(() -> nfseService.emitir(documento))
            .isInstanceOf(AcbrIndisponivelException.class);

        assertThat(documento.getStatus()).isEqualTo(DocumentoStatus.PROCESSANDO);
    }
}
```

---

## 2. Testes de Integração (Testcontainers)

### Configuração Base com Testcontainers

```java
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("erp_test")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
}
```

### Teste de Repository

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class ProdutoRepositoryTest extends IntegrationTestBase {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Test
    @DisplayName("deve encontrar produtos abaixo do estoque mínimo")
    void deveEncontrarProdutosAbaixoDoMinimo() {
        // GIVEN
        var p1 = ProdutoFixture.comEstoque(2, 5); // abaixo
        var p2 = ProdutoFixture.comEstoque(10, 3); // ok
        var p3 = ProdutoFixture.comEstoque(5, 5); // exatamente no mínimo
        produtoRepository.saveAll(List.of(p1, p2, p3));

        // WHEN
        var resultado = produtoRepository.findByEstoqueAtualLessThanEstoqueMinimo();

        // THEN
        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getId()).isEqualTo(p1.getId());
    }

    @Test
    @DisplayName("deve paginar e filtrar produtos por nome")
    void deveFiltrarPorNome() {
        produtoRepository.saveAll(List.of(
            ProdutoFixture.withNome("Notebook Dell"),
            ProdutoFixture.withNome("Notebook Lenovo"),
            ProdutoFixture.withNome("Mouse Logitech")
        ));

        var resultado = produtoRepository.findComFiltros("notebook", null, PageRequest.of(0, 10));

        assertThat(resultado.getTotalElements()).isEqualTo(2);
        assertThat(resultado.getContent())
            .extracting(Produto::getNome)
            .containsExactlyInAnyOrder("Notebook Dell", "Notebook Lenovo");
    }
}
```

---

## 3. Testes E2E com RestAssured

### Configuração

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class ProdutoControllerE2ETest extends IntegrationTestBase {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.basePath = "/api/v1";
    }
}
```

### Teste de CRUD de Produto

```java
@Test
@DisplayName("fluxo completo: criar produto, consultar, atualizar, excluir")
void fluxoCompletoCrudProduto() {
    // CRIAR
    var request = """
        {
          "nome": "Teclado Mecânico",
          "codigoBarras": "7891234567890",
          "preco": 299.90,
          "estoqueMinimo": 5
        }
        """;

    var id = given()
        .contentType(ContentType.JSON)
        .body(request)
    .when()
        .post("/produtos")
    .then()
        .statusCode(201)
        .body("nome", equalTo("Teclado Mecânico"))
        .body("preco", equalTo(299.90f))
        .extract().path("id");

    // CONSULTAR
    given()
    .when()
        .get("/produtos/{id}", id)
    .then()
        .statusCode(200)
        .body("id", equalTo(id));

    // ATUALIZAR
    given()
        .contentType(ContentType.JSON)
        .body("""{"nome": "Teclado Mecânico RGB", "preco": 349.90, "estoqueMinimo": 3}""")
    .when()
        .put("/produtos/{id}", id)
    .then()
        .statusCode(200)
        .body("nome", equalTo("Teclado Mecânico RGB"));
}
```

### Teste do Fluxo de Emissão NFS-e (com WireMock)

```java
@SpringBootTest(webEnvironment = RANDOM_PORT)
@WireMockTest(httpPort = 8050) // Mock do ACBr
class NfseEmissaoE2ETest {

    @Test
    @DisplayName("deve emitir NFS-e e retornar status AUTORIZADO")
    void deveEmitirNfseComSucesso() {
        // GIVEN: Stub do ACBr
        stubFor(post(urlEqualTo("/nfse/emitir"))
            .willReturn(okJson("""
                {
                  "error": false,
                  "mensagem": "[NFSe]\\nNumero=1234\\nCodigoVerificacao=ABC123\\n",
                  "xml_distribuicao": "<NFSe>...</NFSe>"
                }
                """)));

        // WHEN: Dispara a emissão via API
        given()
            .contentType(ContentType.JSON)
            .body("""{"documentoId": "...", "empresaId": "..."}""")
        .when()
            .post("/api/v1/fiscal/nfse/emitir")
        .then()
            .statusCode(200)
            .body("status", equalTo("AUTORIZADO"))
            .body("numero", equalTo(1234));
    }
}
```

---

## 4. Fixtures (Test Builders)

```java
public class ProdutoFixture {

    public static Produto comEstoque(int atual) {
        return comEstoque(atual, 0);
    }

    public static Produto comEstoque(int atual, int minimo) {
        var p = new Produto();
        p.setId(UUID.randomUUID());
        p.setNome("Produto Teste " + atual);
        p.setCodigoBarras("BAR" + System.nanoTime());
        p.setPrecoVenda(new BigDecimal("99.90"));
        p.setEstoqueAtual(atual);
        p.setEstoqueMinimo(minimo);
        p.setStatus(ProdutoStatus.ATIVO);
        return p;
    }

    public static Produto withNome(String nome) {
        var p = comEstoque(100);
        p.setNome(nome);
        return p;
    }
}

public class DocumentoFiscalFixture {

    public static DocumentoFiscal nfse() {
        return nfse(EmpresaFixture.simplexNacional());
    }

    public static DocumentoFiscal nfse(Empresa empresa) {
        var doc = new DocumentoFiscal();
        doc.setId(UUID.randomUUID());
        doc.setTipo(TipoDocumento.NFSE);
        doc.setStatus(DocumentoStatus.PENDENTE);
        doc.setEmpresa(empresa);
        doc.setNumero(1);
        doc.setSerie("1");
        doc.setValorServicos(new BigDecimal("500.00"));
        doc.setValorLiquido(new BigDecimal("500.00"));
        doc.setDescricaoServico("Servico de desenvolvimento de software");
        doc.setItemListaServico("01.01");
        return doc;
    }
}
```

---

## 5. Configuração de Cobertura (JaCoCo)

```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <executions>
        <execution>
            <goals><goal>prepare-agent</goal></goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>verify</phase>
            <goals><goal>report</goal></goals>
        </execution>
        <execution>
            <id>check</id>
            <goals><goal>check</goal></goals>
            <configuration>
                <rules>
                    <rule>
                        <element>CLASS</element>
                        <includes>
                            <include>com.erp.application.*Service</include>
                        </includes>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

Execute com: `mvn verify` para ver o relatório em `target/site/jacoco/index.html`
