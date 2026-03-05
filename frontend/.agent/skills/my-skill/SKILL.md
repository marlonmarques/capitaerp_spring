---
name: angular-erp-frontend
description: >
  Skill completo para desenvolvimento de frontend ERP em Angular 18+ com design
  system profissional, UX limpo e intuitivo, componentes de formulário com máscaras
  de CPF, CNPJ, CEP, telefone e moeda, integração com backend Spring Boot e módulos
  de estoque, vendas, clientes, fornecedores, ordens de serviço e fiscal (NF-e, NFS-e,
  NFC-e). Use SEMPRE que o usuário mencionar: Angular ERP, frontend de gestão,
  tela de cadastro, listagem de produtos/clientes/vendas, dashboard de estoque,
  emissão de nota fiscal, máscara de campo, pipe de moeda/cpf/cnpj, componente de
  tabela, formulário reativo, Angular Material, design system ERP, ou qualquer
  combinação de Angular com domínio fiscal/comercial/gestão. Inclui padrões de
  arquitetura, design tokens, acessibilidade, testes com Jest e Cypress.
---

# Angular ERP Frontend — Guia Mestre (v2.1 - Multi-tenancy & Separate Schemas)

## 0. Multi-tenancy & Arquitetura de Dados

O sistema opera em modo **Multi-tenant** com a estratégia de **Schema por Cliente**.

- **Identificador**: Cada cliente possui um `tenantIdentifier` (ex: `capital`).
- **Resolução de Tenant**: 
  - No Login: Enviado no corpo da requisição junto com email/password.
  - Pós-Login: O `tenantIdentifier` deve ser persistido no `localStorage` após o login e enviado em **todas** as requisições subsequentes via cabeçalho `X-Tenant-ID`.
- **Login**: A tela de login possui o campo "ID da Empresa" (obrigatório).
- **Isolamento**: O backend utiliza o `tenantIdentifier` para chavear o schema do banco de dados (ex: `SET search_path TO 'tenant_slug'`).

## 1. Design System & Identidade Visual

### 1.1 Estética Industrial Refinada
O ERP utiliza uma paleta de cores baseada em tons de **Slate** (Ardósia) e **Blue** (Azul Real), gerando um ambiente de trabalho denso mas limpo.

- **Fundo Global**: `bg-slate-50`
- **Cards & Superfícies**: `bg-white` com `shadow-sm` e `border-slate-200`
- **Tipografia**: `DM Sans` (primária) para legibilidade técnica e números.
- **Ações Primárias**: `bg-blue-600` com hover `bg-blue-700`.

### 1.2 UI Stack
- **PrimeNG 18+**: Otimizado para **DataTables** (`p-table`), Filtros e Gráficos.
- **Angular Material 18+**: Otimizado para **Formulários** (`mat-form-field`), Modais e Toasts.
- **Tailwind CSS**: Estilização utilitária e layout responsivo.
- **PrimeIcons**: Conjunto de ícones vetoriais concisos.

---

## 2. Componentes Inteligentes (Shared)

### 2.1 DataTable Inteligente (`app-data-table`)
Utilize o wrapper genérico para criar tabelas complexas com o mínimo de boilerplate.

**Padrão de Uso (Exemplo Produtos):**
```typescript
// No component.ts
readonly columns: TableColumn[] = [
  { field: 'nome', header: 'Produto', sortable: true, filterable: true },
  { field: 'precoVenda', header: 'Preço', type: 'currency', sortable: true },
  { field: 'status', header: 'Status', type: 'status', width: '120px' }
];
```

```html
<!-- No template -->
<app-data-table 
  [value]="servico.lista()" 
  [columns]="columns" 
  [loading]="servico.carregando()"
  (edit)="editar($event)" (delete)="excluir($event)">
</app-data-table>
```

---

## 3. Arquitetura Standalone (Angular 18)

### 3.1 Estrutura de Feature
Cada feature (ex: `products`) deve ser independente:
```
features/products/
├── components/            # Componentes internos (filtros específicos, modais)
├── services/              # API Rest e SignalStore
├── models/                # Interfaces/DTOs
├── products.routes.ts     # Roteamento da feature
└── products.component.ts  # Tela principal (Orchestrator)
```

### 3.2 Services & Signals (Gestão de Estado)
Sempre use `signal` para estados reativos simples.

```typescript
@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private http = inject(HttpClient);
  readonly lista = signal<Produto[]>([]);
  readonly carregando = signal(false);

  buscarTudo() {
    this.carregando.set(true);
    this.http.get<Produto[]>('/api/produtos')
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe(res => this.lista.set(res));
  }
}
```

---

## 4. Checklist de Qualidade Frontend

- [ ] **Acessibilidade**: Labels em todos os campos e ícones com `aria-label`.
- [ ] **Feedback**: `mat-progress-bar` ou `loading` state em botões durante chamadas HTTP.
- [ ] **Responsividade**: Layout quebras em colunas em dispositivos móveis (`grid-cols-1 md:grid-cols-2`).
- [ ] **Status Badge**: Toda listagem deve indicar o estado do registro (Ativo, Pendente, Cancelado).
- [ ] **Formatadores**: Moeda e Datas devem usar Pipes centralizados (`currencyBr`, `date`).
- [ ] **Lazy Loading**: Importar via `loadComponent` ou `loadChildren` nas rotas.

---

## 5. Referência de Comandos Rápidos
- Gerar component standalone: `ng g c features/nome --standalone --inline-template --inline-style`
- Gerar service: `ng g s core/services/nome`
- Atualizar dependências: `npm update`

---

*Documento mantido pela IA para garantir consistência industrial do Capital ERP.*
