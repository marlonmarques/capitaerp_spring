# Testes Angular — Jest & Cypress

## 1. Configuração Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterFramework: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.routes.ts',
    '!src/app/**/index.ts',
  ],
  coverageThreshold: {
    global: { lines: 80, functions: 80 },
    './src/app/shared/pipes/':    { lines: 100 },
    './src/app/shared/validators/': { lines: 100 },
  },
};
```

```typescript
// setup-jest.ts
import 'jest-preset-angular/setup-jest';
```

---

## 2. Testes de Pipes

### CurrencyBrPipe

```typescript
// currency-br.pipe.spec.ts
describe('CurrencyBrPipe', () => {
  const pipe = new CurrencyBrPipe();

  it('deve formatar número como BRL', () => {
    expect(pipe.transform(1500)).toBe('R$\u00a01.500,00');
  });

  it('deve retornar "—" para null', () => {
    expect(pipe.transform(null)).toBe('—');
  });

  it('deve formatar string numérica', () => {
    expect(pipe.transform('299.90')).toBe('R$\u00a0299,90');
  });

  it('deve formatar zero', () => {
    expect(pipe.transform(0)).toBe('R$\u00a00,00');
  });

  it('deve ocultar símbolo quando showSymbol=false', () => {
    expect(pipe.transform(100, false)).toBe('100,00');
  });
});
```

### CpfCnpjPipe

```typescript
describe('CpfCnpjPipe', () => {
  const pipe = new CpfCnpjPipe();

  it('deve formatar CPF', () => {
    expect(pipe.transform('12345678901')).toBe('123.456.789-01');
  });

  it('deve formatar CNPJ', () => {
    expect(pipe.transform('12345678000195')).toBe('12.345.678/0001-95');
  });

  it('deve retornar "—" para null', () => {
    expect(pipe.transform(null)).toBe('—');
  });

  it('deve retornar o valor original se inválido', () => {
    expect(pipe.transform('1234')).toBe('1234');
  });
});
```

### TelefonePipe

```typescript
describe('TelefonePipe', () => {
  const pipe = new TelefonePipe();

  it('deve formatar celular com 11 dígitos', () => {
    expect(pipe.transform('61999998888')).toBe('(61) 99999-8888');
  });

  it('deve formatar fixo com 10 dígitos', () => {
    expect(pipe.transform('6133334444')).toBe('(61) 3333-4444');
  });

  it('deve retornar "—" para null', () => {
    expect(pipe.transform(null)).toBe('—');
  });
});
```

---

## 3. Testes de Validators

```typescript
// cpf-cnpj.validator.spec.ts
describe('cpfCnpjValidator', () => {
  const validator = cpfCnpjValidator();

  function ctrl(val: string) {
    return new FormControl(val);
  }

  it('deve aceitar CPF válido', () => {
    expect(validator(ctrl('529.982.247-25'))).toBeNull();
  });

  it('deve rejeitar CPF inválido', () => {
    expect(validator(ctrl('111.111.111-11'))).toEqual({ cpfInvalido: true });
  });

  it('deve aceitar CNPJ válido', () => {
    expect(validator(ctrl('11.222.333/0001-81'))).toBeNull();
  });

  it('deve rejeitar CNPJ inválido', () => {
    expect(validator(ctrl('11.111.111/1111-11'))).toEqual({ cnpjInvalido: true });
  });

  it('deve aceitar campo vazio (required cuida disso)', () => {
    expect(validator(ctrl(''))).toBeNull();
  });
});
```

---

## 4. Testes de Service (com HttpClientTestingModule)

```typescript
// cliente.service.spec.ts
describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClienteService,
        provideHttpClientTesting(),
      ]
    });
    service  = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve listar clientes com paginação', () => {
    const mockPage: Page<ClienteResponse> = {
      content: [{ id: '1', razaoSocial: 'Empresa X', cpfCnpj: '12345678000195' } as any],
      totalElements: 1, totalPages: 1, size: 20, number: 0,
    };

    service.listar({ page: 0, size: 20 }).subscribe(page => {
      expect(page.totalElements).toBe(1);
      expect(page.content[0].razaoSocial).toBe('Empresa X');
    });

    const req = httpMock.expectOne(r => r.url.includes('/api/v1/clientes'));
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('deve criar cliente com POST', () => {
    const payload: ClienteRequest = { razaoSocial: 'Novo', cpfCnpj: '52998224725' } as any;
    const mockResponse: ClienteResponse = { id: 'novo-id', ...payload } as any;

    service.criar(payload).subscribe(res => {
      expect(res.id).toBe('novo-id');
    });

    const req = httpMock.expectOne('/api/v1/clientes');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
```

---

## 5. Testes de Componente

```typescript
// data-table.component.spec.ts
describe('DataTableComponent', () => {
  let fixture: ComponentFixture<DataTableComponent<any>>;
  let component: DataTableComponent<any>;

  const mockData = [
    { id: '1', nome: 'Produto A', preco: 100, status: 'ATIVO' },
    { id: '2', nome: 'Produto B', preco: 200, status: 'INATIVO' },
  ];

  const mockColumns: TableColumn[] = [
    { key: 'nome',   header: 'Nome' },
    { key: 'preco',  header: 'Preço',  type: 'currency' },
    { key: 'status', header: 'Status', type: 'status' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture   = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
    component.data    = mockData;
    component.columns = mockColumns;
    component.totalElements = 2;
    fixture.detectChanges();
  });

  it('deve renderizar cabeçalhos corretos', () => {
    const headers = fixture.debugElement.queryAll(By.css('.mat-mdc-header-cell'));
    expect(headers.map(h => h.nativeElement.textContent.trim()))
      .toEqual(expect.arrayContaining(['Nome', 'Preço', 'Status']));
  });

  it('deve renderizar linhas de dados', () => {
    const rows = fixture.debugElement.queryAll(By.css('.mat-mdc-row'));
    expect(rows.length).toBe(2);
  });

  it('deve emitir rowClick ao clicar em uma linha', () => {
    const spy = jest.spyOn(component.rowClick, 'emit');
    const firstRow = fixture.debugElement.query(By.css('.mat-mdc-row'));
    firstRow.nativeElement.click();
    expect(spy).toHaveBeenCalledWith(mockData[0]);
  });

  it('deve mostrar empty state quando sem dados', () => {
    component.data = [];
    fixture.detectChanges();
    const empty = fixture.debugElement.query(By.css('app-empty-state'));
    expect(empty).toBeTruthy();
  });
});
```

---

## 6. Testes E2E com Cypress

### Configuração

```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
  },
});
```

### Commands Customizados

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('login', (email = 'admin@erp.com', password = 'senha123') => {
  cy.request('POST', '/api/v1/auth/login', { email, password })
    .then(({ body }) => {
      localStorage.setItem('token', body.token);
    });
  cy.visit('/');
});

Cypress.Commands.add('criarCliente', (overrides = {}) => {
  cy.request({
    method: 'POST',
    url: '/api/v1/clientes',
    body: { razaoSocial: 'Cliente Teste', cpfCnpj: '52998224725', ...overrides },
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
});
```

### Teste de Cadastro de Cliente

```typescript
// cypress/e2e/clientes/cadastro-cliente.cy.ts
describe('Cadastro de Cliente', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/clientes/novo');
  });

  it('deve criar cliente com CPF', () => {
    cy.get('[formControlName="razaoSocial"]').type('João da Silva');
    cy.get('[formControlName="cpfCnpj"]').type('52998224725'); // CPF válido
    cy.get('[formControlName="email"]').type('joao@email.com');
    cy.get('[formControlName="telefone"]').type('61999998888');

    // CEP com autocomplete
    cy.get('[formControlName="cep"]').type('70040010');
    cy.wait(1500); // aguarda ViaCEP
    cy.get('[formControlName="logradouro"]').should('not.be.empty');
    cy.get('[formControlName="numero"]').type('100');

    cy.get('button[type="button"]').contains('Salvar').click();

    cy.url().should('include', '/clientes');
    cy.contains('Cliente criado com sucesso').should('be.visible');
  });

  it('deve exibir erro para CPF inválido', () => {
    cy.get('[formControlName="razaoSocial"]').type('Teste');
    cy.get('[formControlName="cpfCnpj"]').type('11111111111');
    cy.get('[formControlName="razaoSocial"]').click(); // blur no campo
    cy.contains('CPF inválido').should('be.visible');
    cy.get('button').contains('Salvar').click();
    cy.url().should('include', '/clientes/novo'); // permanece na página
  });

  it('deve formatar máscara do CNPJ ao digitar 14 dígitos', () => {
    cy.get('[formControlName="cpfCnpj"]').type('11222333000181');
    cy.get('[formControlName="cpfCnpj"]').should('have.value', '11.222.333/0001-81');
  });
});
```

### Teste de Emissão de NFS-e

```typescript
// cypress/e2e/fiscal/emissao-nfse.cy.ts
describe('Emissão NFS-e', () => {
  beforeEach(() => cy.login());

  it('fluxo completo de emissão', () => {
    cy.criarCliente({ razaoSocial: 'Cliente Fiscal', cpfCnpj: '52998224725' });

    cy.visit('/fiscal/nfse/emitir');

    cy.get('[formControlName="clienteId"]').click();
    cy.contains('mat-option', 'Cliente Fiscal').click();

    cy.get('[formControlName="descricaoServico"]').type('Desenvolvimento de Software');
    cy.get('app-currency-input').type('150000'); // R$ 1.500,00
    cy.get('[formControlName="itemListaServico"]').type('01.01');

    cy.get('button').contains('Emitir').click();

    cy.contains('Nota enviada', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/fiscal/nfse');
  });
});
```
