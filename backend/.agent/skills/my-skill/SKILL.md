---
name: spring-boot-erp
description: >
  Skill completo para desenvolvimento de ERP em Spring Boot 3 com módulos de
  controle de estoque, vendas, cadastro de clientes e fornecedores, ordens de
  serviço e emissão de documentos fiscais (NF-e, NFS-e, NF-Ce) integrados com
  ACBr/SEFAZ. Use este skill SEMPRE que o usuário mencionar: Spring Boot ERP,
  estoque, fiscal, NF-e, NFS-e, NFC-e, ACBr, SEFAZ, cadastro de clientes/fornecedores,
  ordem de serviço, venda de produtos, módulos de um sistema de gestão, ou qualquer
  combinação de backend Java com domínio fiscal/comercial. Inclui estrutura de
  projeto, padrões de engenharia de software, arquitetura em camadas, testes
  automatizados com JUnit 5 + Mockito + Testcontainers, e boas práticas de API REST.
compatibility:
  - Java 21+
  - Spring Boot 3.2+
  - Maven ou Gradle
  - PostgreSQL
  - Docker
---

# Spring Boot 3 ERP — Guia Mestre

## 1. Visão Geral da Arquitetura

Este ERP segue **Clean Architecture** adaptada para Spring Boot, com separação clara entre domínio, aplicação e infraestrutura.

```
erp-backend/
├── src/
│   ├── main/java/com/erp/
│   │   ├── config/           # Beans de configuração Spring
│   │   ├── domain/           # Entidades, VOs, enums de negócio
│   │   │   ├── estoque/
│   │   │   ├── vendas/
│   │   │   ├── fiscal/
│   │   │   ├── clientes/
│   │   │   ├── fornecedores/
│   │   │   └── ordemservico/
│   │   ├── application/      # Use Cases / Services
│   │   │   ├── estoque/
│   │   │   ├── vendas/
│   │   │   ├── fiscal/
│   │   │   └── ...
│   │   ├── infrastructure/   # JPA Repos, HTTP Clients, Adapters
│   │   │   ├── persistence/
│   │   │   ├── acbr/         # Integração ACBr REST
│   │   │   └── sefaz/
│   │   ├── web/              # Controllers REST
│   │   │   └── v1/
│   │   └── shared/           # Utils, Exceptions, DTOs comuns
│   └── test/
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── docker-compose.yml
└── pom.xml
```

### Stack Tecnológica Principal

| Camada | Tecnologia |
|---|---|
| Framework | Spring Boot 3.2, Spring Security 6 |
| Persistência | Spring Data JPA + Hibernate 6, Flyway |
| BD | PostgreSQL 15+ |
| Testes | JUnit 5, Mockito, Testcontainers, RestAssured |
| Fiscal | ACBr REST API (NFe, NFSe, NFCe) |
| Docs | SpringDoc OpenAPI 3 |
| Monitoramento | Actuator + Micrometer |
| Build | Maven 3.9+ |

---

## 2. Módulos do Sistema

Leia o arquivo de referência correspondente ao módulo que está desenvolvendo:

| Módulo | Arquivo de Referência |
|---|---|
| Estoque & Produtos | `references/estoque.md` |
| Vendas & PDV | `references/vendas.md` |
| Clientes & Fornecedores | `references/cadastros.md` |
| Ordem de Serviço | `references/ordem-servico.md` |
| Fiscal NF-e / NFC-e | `references/fiscal-nfe.md` |
| Fiscal NFS-e | `references/fiscal-nfse.md` |
| Testes Automatizados | `references/testes.md` |

---

## 3. Convenções Globais

### 3.1 Estrutura de Pacotes por Módulo

Cada módulo segue este padrão vertical (feature package):
```
domain/estoque/
  ├── Produto.java           # @Entity
  ├── Estoque.java           # @Entity
  ├── ProdutoStatus.java     # enum
  └── EstoqueInsuficienteException.java

application/estoque/
  ├── ProdutoService.java    # @Service (use cases)
  ├── EstoqueService.java
  └── dto/
      ├── ProdutoRequest.java  # record
      └── ProdutoResponse.java # record

infrastructure/persistence/estoque/
  ├── ProdutoRepository.java   # JpaRepository
  └── EstoqueRepository.java

web/v1/estoque/
  └── ProdutoController.java   # @RestController
```

### 3.2 Padrão de DTOs (Java Records)

```java
// Request com validação Bean Validation
public record ProdutoRequest(
    @NotBlank(message = "Nome obrigatório")
    @Size(max = 255)
    String nome,

    @NotNull
    @Positive(message = "Preço deve ser positivo")
    BigDecimal preco,

    @NotBlank
    String codigoBarras,

    @NotNull
    @Min(0)
    Integer estoqueMinimo
) {}

// Response imutável
public record ProdutoResponse(
    UUID id,
    String nome,
    BigDecimal preco,
    Integer quantidadeEstoque,
    LocalDateTime criadoEm
) {}
```

### 3.3 Tratamento de Erros Global

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage(), Instant.now()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(
            MethodArgumentNotValidException ex) {
        var errors = ex.getBindingResult().getFieldErrors()
            .stream()
            .map(fe -> new FieldError(fe.getField(), fe.getDefaultMessage()))
            .toList();
        return ResponseEntity.badRequest()
            .body(new ValidationErrorResponse("VALIDATION_ERROR", errors));
    }

    @ExceptionHandler(EstoqueInsuficienteException.class)
    public ResponseEntity<ErrorResponse> handleEstoque(EstoqueInsuficienteException ex) {
        return ResponseEntity.status(422)
            .body(new ErrorResponse("ESTOQUE_INSUFICIENTE", ex.getMessage(), Instant.now()));
    }
}
```

### 3.4 Paginação Padronizada

Todos os endpoints de listagem usam `Pageable`:
```java
@GetMapping
public Page<ProdutoResponse> listar(
    @ParameterObject Pageable pageable,
    @RequestParam(required = false) String busca
) {
    return produtoService.listar(busca, pageable);
}
// GET /api/v1/produtos?page=0&size=20&sort=nome,asc&busca=notebook
```

### 3.5 Auditoria Automática

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime criadoEm;

    @LastModifiedDate
    private LocalDateTime atualizadoEm;

    @CreatedBy
    @Column(updatable = false)
    private String criadoPor;

    @LastModifiedBy
    private String atualizadoPor;
}
```

---

## 4. Integração ACBr — Padrão Fiscal

A integração com o ACBr segue um cliente HTTP genérico + tratamento de respostas INI.

### 4.1 Cliente ACBr Base

```java
@Component
@Slf4j
public class AcbrHttpClient {

    private final RestClient restClient;

    public AcbrHttpClient(@Value("${acbr.url:http://localhost:8050}") String baseUrl) {
        this.restClient = RestClient.builder()
            .baseUrl(baseUrl)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    public AcbrResponse post(String endpoint, Object payload) {
        try {
            return restClient.post()
                .uri("/" + endpoint)
                .body(payload)
                .retrieve()
                .body(AcbrResponse.class);
        } catch (ResourceAccessException ex) {
            log.warn("ACBr indisponível em {}: {}", endpoint, ex.getMessage());
            throw new AcbrIndisponivelException("Servidor ACBr não acessível", ex);
        }
    }
}
```

### 4.2 Resposta e Parse INI

```java
public record AcbrResponse(
    boolean error,
    String mensagem,
    String detalhes,
    @JsonProperty("xml_distribuicao") String xmlDistribuicao
) {}

@Component
public class AcbrIniParser {

    public Map<String, Map<String, String>> parse(String iniContent) {
        var result = new LinkedHashMap<String, Map<String, String>>();
        if (iniContent == null || iniContent.isBlank()) return result;
        // ... lógica de parse igual ao PHP, mas em Java
        String currentSection = "Geral";
        for (String line : iniContent.lines().toList()) {
            line = line.strip();
            if (line.isEmpty() || line.startsWith(";")) continue;
            if (line.startsWith("[") && line.endsWith("]")) {
                currentSection = line.substring(1, line.length() - 1);
                result.putIfAbsent(currentSection, new LinkedHashMap<>());
            } else {
                int idx = line.indexOf('=');
                if (idx > 0) {
                    result.computeIfAbsent(currentSection, k -> new LinkedHashMap<>())
                          .put(line.substring(0, idx).strip(), line.substring(idx + 1).strip());
                }
            }
        }
        return result;
    }
}
```

### 4.3 Classificação de Erros de Infraestrutura

```java
@Component
public class AcbrErrorClassifier {

    private static final List<String> INFRA_ERRORS = List.of(
        "timed out", "curl error 28", "x999", "110",
        "connection refused", "s:client - error"
    );

    public boolean isInfrastructureError(String message) {
        if (message == null) return false;
        String lower = message.toLowerCase();
        return INFRA_ERRORS.stream().anyMatch(lower::contains);
    }

    public boolean isDuplicateRps(String content) {
        if (content == null) return false;
        List<String> terms = List.of(
            "rps ja processado", "rps ja informado",
            "duplicidade de rps", "e156"
        );
        String norm = content.toLowerCase();
        return terms.stream().anyMatch(norm::contains);
    }
}
```

---

## 5. Configuração do pom.xml

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.5</version>
</parent>

<dependencies>
    <!-- Core -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <!-- BD -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    <!-- Docs -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.5.0</version>
    </dependency>
    <!-- Testes -->
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>postgresql</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>rest-assured</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 6. Checklist de Qualidade

Antes de entregar qualquer módulo, verificar:

- [ ] **Cobertura**: ≥ 80% de cobertura por linha nos Services
- [ ] **Testes unitários**: Todos os use cases cobertos com Mockito
- [ ] **Testes de integração**: Repositories testados com Testcontainers
- [ ] **Testes E2E**: Fluxos principais testados com RestAssured
- [ ] **Validação**: Bean Validation em todos os DTOs de entrada
- [ ] **Swagger**: Todos os endpoints documentados com `@Operation`
- [ ] **Migrations**: Toda alteração de schema via Flyway
- [ ] **Fiscal**: Testes de emissão com mock do ACBr para NFe, NFSe e NFCe
- [ ] **Auditoria**: `BaseEntity` em todas as entidades
- [ ] **Tratamento de erro**: Exceções de domínio mapeadas no `GlobalExceptionHandler`

---

## 7. Docker Compose de Desenvolvimento

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: erp_db
      POSTGRES_USER: erp
      POSTGRES_PASSWORD: erp123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  acbr-api:
    image: acbr/acbr-rest:latest   # ajuste para a imagem correta
    ports:
      - "8050:8050"
    volumes:
      - ./acbr-config:/config

volumes:
  pgdata:
```

---

> Para implementação detalhada de cada módulo, leia o arquivo `references/` correspondente.
> Sempre comece pela referência do módulo antes de escrever qualquer código.
