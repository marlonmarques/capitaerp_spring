# Módulo: Cadastros — Clientes & Fornecedores

## Entidades

```java
@Entity
@Table(name = "pessoas")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Pessoa extends BaseEntity {

    @Column(nullable = false, length = 14)
    private String cpfCnpj;

    @Column(nullable = false)
    private String razaoSocial;

    private String nomeFantasia;

    @Column(unique = true)
    private String email;

    private String telefone;
    private String celular;

    @Enumerated(EnumType.STRING)
    private TipoPessoa tipo; // FISICA, JURIDICA

    @Enumerated(EnumType.STRING)
    private PessoaStatus status; // ATIVO, INATIVO, BLOQUEADO

    @OneToMany(mappedBy = "pessoa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Endereco> enderecos = new ArrayList<>();

    public Endereco getEnderecoPrincipal() {
        return enderecos.stream()
            .filter(Endereco::isPadrao)
            .findFirst()
            .orElse(enderecos.isEmpty() ? null : enderecos.get(0));
    }
}

@Entity
@Table(name = "clientes")
public class Cliente extends Pessoa {

    @Column(precision = 10, scale = 2)
    private BigDecimal limiteCredito;

    @Column(precision = 10, scale = 2)
    private BigDecimal saldoDevedor;

    private String inscricaoEstadual;
    private String inscricaoMunicipal;

    @Enumerated(EnumType.STRING)
    private RegimeTributario regimeTributario;

    private LocalDate dataNascimento;
    private String observacoes;
}

@Entity
@Table(name = "fornecedores")
public class Fornecedor extends Pessoa {

    private String inscricaoEstadual;
    private String inscricaoMunicipal;

    @Enumerated(EnumType.STRING)
    private RegimeTributario regimeTributario;

    private String site;
    private String contatoNome;

    @Column(precision = 5, scale = 2)
    private BigDecimal prazoMedioPagamento; // dias

    private String observacoes;
}

@Entity
@Table(name = "enderecos")
public class Endereco extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pessoa_id", nullable = false)
    private Pessoa pessoa;

    @Column(nullable = false, length = 8)
    private String cep;

    @Column(nullable = false)
    private String logradouro;

    private String numero;
    private String complemento;

    @Column(nullable = false)
    private String bairro;

    @Column(nullable = false)
    private String cidade;

    // Código IBGE do município
    private String codigoMunicipio;

    @Column(nullable = false, length = 2)
    private String uf;

    private boolean padrao;
}
```

## Service de Cliente

```java
@Service
@Transactional
@Slf4j
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final CepService cepService; // integração ViaCEP

    public ClienteResponse criar(ClienteRequest request) {
        validarCpfCnpjUnico(request.cpfCnpj(), null);

        var cliente = new Cliente();
        mapearRequest(cliente, request);

        if (request.enderecoPrincipal() != null) {
            var endereco = construirEndereco(request.enderecoPrincipal());
            endereco.setPadrao(true);
            cliente.getEnderecos().add(endereco);
            endereco.setPessoa(cliente);
        }

        return ClienteResponse.from(clienteRepository.save(cliente));
    }

    public ClienteResponse atualizar(UUID id, ClienteRequest request) {
        var cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado: " + id));

        validarCpfCnpjUnico(request.cpfCnpj(), id);
        mapearRequest(cliente, request);

        return ClienteResponse.from(clienteRepository.save(cliente));
    }

    private void validarCpfCnpjUnico(String cpfCnpj, UUID idIgnorar) {
        clienteRepository.findByCpfCnpj(cpfCnpj)
            .filter(c -> !c.getId().equals(idIgnorar))
            .ifPresent(c -> {
                throw new BusinessException("CPF/CNPJ já cadastrado: " + cpfCnpj);
            });
    }

    @Transactional(readOnly = true)
    public Page<ClienteResponse> listar(String busca, Pageable pageable) {
        return clienteRepository.findComFiltros(busca, pageable)
            .map(ClienteResponse::from);
    }
}
```

## ViaCEP Integration

```java
@Component
@Slf4j
public class CepService {

    private final RestClient restClient;

    public CepService() {
        this.restClient = RestClient.builder()
            .baseUrl("https://viacep.com.br/ws")
            .build();
    }

    public Optional<EnderecoViaCep> consultar(String cep) {
        try {
            var response = restClient.get()
                .uri("/{cep}/json", cep.replaceAll("\\D", ""))
                .retrieve()
                .body(EnderecoViaCep.class);
            return Optional.ofNullable(response).filter(r -> r.cep() != null);
        } catch (Exception e) {
            log.warn("Falha ao consultar CEP {}: {}", cep, e.getMessage());
            return Optional.empty();
        }
    }

    public record EnderecoViaCep(
        String cep, String logradouro, String bairro,
        String localidade, String uf, String ibge
    ) {}
}
```

## Validação de CPF/CNPJ

```java
@Component
public class DocumentoValidator {

    public boolean isValidCpf(String cpf) {
        String digits = cpf.replaceAll("\\D", "");
        if (digits.length() != 11 || digits.chars().distinct().count() == 1) return false;
        return calcularDigitoCpf(digits, 9) == (digits.charAt(9) - '0')
            && calcularDigitoCpf(digits, 10) == (digits.charAt(10) - '0');
    }

    public boolean isValidCnpj(String cnpj) {
        String digits = cnpj.replaceAll("\\D", "");
        if (digits.length() != 14 || digits.chars().distinct().count() == 1) return false;
        return calcularDigitoCnpj(digits, 12) == (digits.charAt(12) - '0')
            && calcularDigitoCnpj(digits, 13) == (digits.charAt(13) - '0');
    }

    private int calcularDigitoCpf(String cpf, int pos) {
        int sum = 0;
        for (int i = 0; i < pos; i++) sum += (cpf.charAt(i) - '0') * (pos + 1 - i);
        int rem = sum % 11;
        return rem < 2 ? 0 : 11 - rem;
    }

    private int calcularDigitoCnpj(String cnpj, int pos) {
        int[] weights = pos == 12 ? new int[]{5,4,3,2,9,8,7,6,5,4,3,2} : new int[]{6,5,4,3,2,9,8,7,6,5,4,3,2};
        int sum = 0;
        for (int i = 0; i < weights.length; i++) sum += (cnpj.charAt(i) - '0') * weights[i];
        int rem = sum % 11;
        return rem < 2 ? 0 : 11 - rem;
    }
}
```

## Migration Flyway

```sql
-- V2__create_pessoas.sql
CREATE TABLE pessoas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cpf_cnpj VARCHAR(14) NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    email VARCHAR(255),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    tipo VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    criado_por VARCHAR(100),
    atualizado_por VARCHAR(100)
);

CREATE TABLE clientes (
    id UUID PRIMARY KEY REFERENCES pessoas(id),
    limite_credito NUMERIC(10,2),
    saldo_devedor NUMERIC(10,2) DEFAULT 0,
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    regime_tributario VARCHAR(30),
    data_nascimento DATE,
    observacoes TEXT
);

CREATE TABLE fornecedores (
    id UUID PRIMARY KEY REFERENCES pessoas(id),
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    regime_tributario VARCHAR(30),
    site VARCHAR(255),
    contato_nome VARCHAR(255),
    prazo_medio_pagamento INTEGER,
    observacoes TEXT
);

CREATE TABLE enderecos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    cep VARCHAR(8) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    codigo_municipio VARCHAR(7),
    uf CHAR(2) NOT NULL,
    padrao BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pessoas_cpf_cnpj ON pessoas(cpf_cnpj);
CREATE INDEX idx_pessoas_status ON pessoas(status);
CREATE INDEX idx_enderecos_pessoa ON enderecos(pessoa_id);
```
