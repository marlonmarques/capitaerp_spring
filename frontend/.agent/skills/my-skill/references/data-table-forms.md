# Data Table & Formulários Reativos

## 1. Smart Data Table Component

Componente genérico reutilizável para todas as listagens do ERP:

```typescript
// shared/components/data-table/data-table.component.ts
export interface TableColumn<T = any> {
  key: string;
  header: string;
  type?: 'text' | 'currency' | 'date' | 'status' | 'cpfcnpj' | 'telefone' | 'template';
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  template?: TemplateRef<{ $implicit: T }>;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatIconModule, MatButtonModule, MatMenuModule, MatCheckboxModule,
    MatTooltipModule, MatProgressBarModule,
    CurrencyBrPipe, CpfCnpjPipe, TelefonePipe, StatusBadgeComponent,
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T extends { id: string }> {
  @Input({ required: true }) data: T[] = [];
  @Input({ required: true }) columns: TableColumn<T>[] = [];
  @Input() totalElements = 0;
  @Input() loading = false;
  @Input() pageSize = 20;
  @Input() pageSizeOptions = [10, 20, 50, 100];
  @Input() selectable = false;
  @Input() actions: { label: string; icon: string; action: (row: T) => void; danger?: boolean }[] = [];

  @Output() pageChange   = new EventEmitter<PageEvent>();
  @Output() sortChange   = new EventEmitter<Sort>();
  @Output() rowClick     = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<T[]>();

  readonly selection = new SelectionModel<T>(true, []);

  get displayedColumns(): string[] {
    const cols = [];
    if (this.selectable) cols.push('select');
    cols.push(...this.columns.map(c => c.key));
    if (this.actions.length) cols.push('actions');
    return cols;
  }

  getCellValue(row: T, col: TableColumn<T>): any {
    return col.key.split('.').reduce((obj: any, k) => obj?.[k], row);
  }

  isAllSelected() {
    return this.selection.selected.length === this.data.length;
  }

  toggleAll() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.data.forEach(r => this.selection.select(r));
    this.selectionChange.emit(this.selection.selected);
  }
}
```

```html
<!-- data-table.component.html -->
<div class="table-container">
  @if (loading) { <mat-progress-bar mode="indeterminate" /> }

  <table mat-table [dataSource]="data" matSort (matSortChange)="sortChange.emit($event)" class="erp-table">

    <!-- Select Column -->
    @if (selectable) {
      <ng-container matColumnDef="select">
        <th mat-header-cell *matHeaderCellDef width="48px">
          <mat-checkbox (change)="toggleAll()"
                        [checked]="isAllSelected()"
                        [indeterminate]="selection.hasValue() && !isAllSelected()" />
        </th>
        <td mat-cell *matCellDef="let row">
          <mat-checkbox (click)="$event.stopPropagation()"
                        (change)="selection.toggle(row); selectionChange.emit(selection.selected)"
                        [checked]="selection.isSelected(row)" />
        </td>
      </ng-container>
    }

    <!-- Dynamic Columns -->
    @for (col of columns; track col.key) {
      <ng-container [matColumnDef]="col.key">
        <th mat-header-cell *matHeaderCellDef
            [mat-sort-header]="col.sortable ? col.key : ''"
            [style.width]="col.width"
            [style.text-align]="col.align ?? 'left'">
          {{ col.header }}
        </th>
        <td mat-cell *matCellDef="let row"
            [style.text-align]="col.align ?? 'left'">
          @switch (col.type) {
            @case ('currency') { {{ getCellValue(row, col) | currencyBr }} }
            @case ('status')   { <app-status-badge [status]="getCellValue(row, col)" /> }
            @case ('cpfcnpj')  { {{ getCellValue(row, col) | cpfCnpj }} }
            @case ('telefone') { {{ getCellValue(row, col) | telefone }} }
            @case ('date')     { {{ getCellValue(row, col) | date:'dd/MM/yyyy' }} }
            @case ('template') {
              <ng-container *ngTemplateOutlet="col.template!; context: { $implicit: row }" />
            }
            @default { {{ getCellValue(row, col) ?? '—' }} }
          }
        </td>
      </ng-container>
    }

    <!-- Actions Column -->
    @if (actions.length) {
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef width="56px"></th>
        <td mat-cell *matCellDef="let row">
          <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            @for (action of actions; track action.label) {
              <button mat-menu-item (click)="action.action(row)"
                      [class.danger-action]="action.danger">
                <mat-icon [color]="action.danger ? 'warn' : ''">{{ action.icon }}</mat-icon>
                <span>{{ action.label }}</span>
              </button>
            }
          </mat-menu>
        </td>
      </ng-container>
    }

    <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"
        (click)="rowClick.emit(row)"
        [class.clickable]="rowClick.observed"></tr>

    <!-- Empty State -->
    <tr class="mat-mdc-no-data-row" *matNoDataRow>
      <td [attr.colspan]="displayedColumns.length">
        <app-empty-state icon="search_off" message="Nenhum registro encontrado" />
      </td>
    </tr>
  </table>

  <mat-paginator [length]="totalElements"
                 [pageSize]="pageSize"
                 [pageSizeOptions]="pageSizeOptions"
                 showFirstLastButtons
                 (page)="pageChange.emit($event)" />
</div>
```

```scss
// data-table.component.scss
.table-container { overflow: auto; border-radius: var(--radius-lg); border: 1px solid var(--color-neutral-200); background: white; }

.erp-table {
  width: 100%;

  .mat-mdc-header-row {
    background: var(--color-neutral-50);
    border-bottom: 2px solid var(--color-neutral-200);
  }

  .mat-mdc-header-cell {
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: var(--color-neutral-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .mat-mdc-cell { font-size: var(--text-sm); color: var(--color-neutral-800); }

  .mat-mdc-row {
    transition: background var(--transition-fast);
    &:hover { background: var(--color-neutral-50); }
    &.clickable { cursor: pointer; }

    &:last-child td { border-bottom: none; }
  }

  .danger-action { color: var(--color-danger-600) !important; }
}
```

**Uso em tela de lista:**
```typescript
// features/clientes/clientes-list.component.ts
@Component({ ... })
export class ClientesListComponent {
  readonly columns: TableColumn<ClienteResponse>[] = [
    { key: 'razaoSocial',  header: 'Razão Social',  sortable: true },
    { key: 'cpfCnpj',     header: 'CPF/CNPJ',      type: 'cpfcnpj' },
    { key: 'telefone',    header: 'Telefone',       type: 'telefone' },
    { key: 'email',       header: 'E-mail' },
    { key: 'status',      header: 'Status',         type: 'status' },
    { key: 'limiteCredito', header: 'Limite',       type: 'currency', align: 'right' },
  ];

  readonly actions = [
    { label: 'Editar',   icon: 'edit',   action: (row: ClienteResponse) => this.router.navigate(['/clientes', row.id, 'editar']) },
    { label: 'Excluir',  icon: 'delete', action: (row: ClienteResponse) => this.confirmarExclusao(row), danger: true },
  ];
}
```

---

## 2. Formulário Reativo Padrão — Página de Cadastro

```typescript
// features/clientes/cliente-form.component.ts
@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatDividerModule,
    MatProgressSpinnerModule, RouterLink,
    CpfCnpjMaskDirective, CepMaskDirective, NgxMaskDirective,
    PageHeaderComponent, FormFieldComponent, CurrencyInputComponent,
    cpfCnpjValidator, getFirstError,
  ],
  templateUrl: './cliente-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteFormComponent implements OnInit {
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);
  private readonly clienteService = inject(ClienteService);
  private readonly toast          = inject(ToastService);
  private readonly fb             = inject(FormBuilder);

  readonly isEdit     = signal(false);
  readonly saving     = signal(false);
  readonly loadingCep = signal(false);
  readonly getFirstError = getFirstError; // expõe para template

  form = this.fb.group({
    razaoSocial:  ['', [Validators.required, Validators.maxLength(255)]],
    nomeFantasia: [''],
    cpfCnpj:      ['', [Validators.required, cpfCnpjValidator()]],
    email:        ['', [Validators.email]],
    telefone:     [''],
    celular:      [''],
    limiteCredito: [0],
    regimeTributario: [''],
    status:       ['ATIVO'],
    // Sub-formulário de endereço
    endereco: this.fb.group({
      cep:        ['', Validators.required],
      logradouro: ['', Validators.required],
      numero:     [''],
      complemento: [''],
      bairro:     ['', Validators.required],
      cidade:     ['', Validators.required],
      uf:         ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    })
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.clienteService.buscarPorId(id).subscribe(cliente => {
        this.form.patchValue(cliente as any);
      });
    }
  }

  preencherEndereco(cepData: CepData) {
    this.form.get('endereco')?.patchValue({
      logradouro: cepData.logradouro,
      bairro:     cepData.bairro,
      cidade:     cepData.cidade,
      uf:         cepData.uf,
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.form.getRawValue();
    const request$ = this.isEdit()
      ? this.clienteService.atualizar(this.route.snapshot.paramMap.get('id')!, payload as any)
      : this.clienteService.criar(payload as any);

    request$.pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.toast.success(`Cliente ${this.isEdit() ? 'atualizado' : 'criado'} com sucesso!`);
          this.router.navigate(['/clientes']);
        },
        error: (err) => {
          // Mapear erros de validação do backend nos campos
          if (err.status === 422 && err.error?.errors) {
            for (const fieldError of err.error.errors) {
              this.form.get(fieldError.field)?.setErrors({ serverError: fieldError.message });
            }
          }
        }
      });
  }
}
```

```html
<!-- cliente-form.component.html -->
<div class="form-page">
  <app-page-header
    [title]="isEdit() ? 'Editar Cliente' : 'Novo Cliente'"
    subtitle="Preencha os dados do cliente"
    backRoute="/clientes">
    <div actions>
      <button mat-stroked-button routerLink="/clientes">Cancelar</button>
      <button mat-flat-button color="primary" (click)="salvar()" [disabled]="saving()">
        @if (saving()) { <mat-spinner diameter="18" /> }
        @else { <mat-icon>save</mat-icon> }
        {{ saving() ? 'Salvando...' : 'Salvar' }}
      </button>
    </div>
  </app-page-header>

  <form [formGroup]="form" class="form-card" novalidate>
    <!-- Seção: Dados Principais -->
    <section class="form-section">
      <h2 class="section-title">Dados Principais</h2>
      <div class="form-grid form-grid--3">
        <mat-form-field appearance="outline" class="col-span-2">
          <mat-label>Razão Social *</mat-label>
          <input matInput formControlName="razaoSocial" />
          <mat-error>{{ getFirstError(form.get('razaoSocial')) }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>CPF / CNPJ *</mat-label>
          <input matInput appCpfCnpjMask formControlName="cpfCnpj" />
          <mat-error>{{ getFirstError(form.get('cpfCnpj')) }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="col-span-2">
          <mat-label>Nome Fantasia</mat-label>
          <input matInput formControlName="nomeFantasia" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Regime Tributário</mat-label>
          <mat-select formControlName="regimeTributario">
            <mat-option value="">Selecione</mat-option>
            <mat-option value="SIMPLES">Simples Nacional</mat-option>
            <mat-option value="LUCRO_PRESUMIDO">Lucro Presumido</mat-option>
            <mat-option value="LUCRO_REAL">Lucro Real</mat-option>
            <mat-option value="MEI">MEI</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </section>

    <mat-divider />

    <!-- Seção: Contato -->
    <section class="form-section">
      <h2 class="section-title">Contato</h2>
      <div class="form-grid form-grid--3">
        <mat-form-field appearance="outline" class="col-span-2">
          <mat-label>E-mail</mat-label>
          <input matInput type="email" formControlName="email" />
          <mat-error>{{ getFirstError(form.get('email')) }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Telefone</mat-label>
          <input matInput mask="(00) 0000-0000||(00) 00000-0000" formControlName="telefone" placeholder="(61) 3333-4444" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Celular</mat-label>
          <input matInput mask="(00) 00000-0000" formControlName="celular" placeholder="(61) 99999-9999" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Limite de Crédito</mat-label>
          <app-currency-input matInput formControlName="limiteCredito" />
        </mat-form-field>
      </div>
    </section>

    <mat-divider />

    <!-- Seção: Endereço -->
    <section class="form-section" formGroupName="endereco">
      <h2 class="section-title">Endereço</h2>
      <div class="form-grid form-grid--3">
        <mat-form-field appearance="outline">
          <mat-label>CEP *</mat-label>
          <input matInput appCepMask formControlName="cep"
                 (cepResolved)="preencherEndereco($event)"
                 (cepLoading)="loadingCep.set($event)" />
          @if (loadingCep()) { <mat-spinner matSuffix diameter="16" /> }
          <mat-error>{{ getFirstError(form.get('endereco.cep')) }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="col-span-2">
          <mat-label>Logradouro *</mat-label>
          <input matInput formControlName="logradouro" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Número</mat-label>
          <input matInput formControlName="numero" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Complemento</mat-label>
          <input matInput formControlName="complemento" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Bairro *</mat-label>
          <input matInput formControlName="bairro" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="col-span-2">
          <mat-label>Cidade *</mat-label>
          <input matInput formControlName="cidade" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>UF *</mat-label>
          <mat-select formControlName="uf">
            @for (uf of ufs; track uf) {
              <mat-option [value]="uf">{{ uf }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    </section>
  </form>
</div>
```

```scss
// Estilos globais de formulário — styles/forms.scss
.form-page { max-width: 1100px; }

.form-card {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-neutral-200);
  overflow: hidden;
}

.form-section {
  padding: var(--space-6);

  + .form-section { border-top: 1px solid var(--color-neutral-100); }
}

.section-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-700);
  margin: 0 0 var(--space-5);
}

.form-grid {
  display: grid;
  gap: var(--space-4);

  &--2 { grid-template-columns: repeat(2, 1fr); }
  &--3 { grid-template-columns: repeat(3, 1fr); }
  &--4 { grid-template-columns: repeat(4, 1fr); }

  .col-span-2 { grid-column: span 2; }
  .col-span-3 { grid-column: span 3; }
  .col-full   { grid-column: 1 / -1; }
}

// Compact Material fields
.mat-mdc-form-field { width: 100%; }
```
