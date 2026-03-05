# UI Fiscal — NF-e, NFS-e, NFC-e

## 1. Listagem de Documentos Fiscais

```typescript
// features/fiscal/fiscal-list.component.ts
@Component({
  selector: 'app-fiscal-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatTabsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule,
    DataTableComponent, StatusBadgeComponent, PageHeaderComponent,
    CurrencyBrPipe,
  ],
  template: `
    <app-page-header title="Documentos Fiscais" subtitle="Gerencie NF-e, NFS-e e NFC-e emitidos">
      <div actions>
        <button mat-flat-button color="primary" routerLink="nfe/emitir">
          <mat-icon>add</mat-icon> Emitir NF-e
        </button>
        <button mat-stroked-button routerLink="nfse/emitir">
          <mat-icon>add</mat-icon> Emitir NFS-e
        </button>
      </div>
    </app-page-header>

    <!-- Filtros -->
    <div class="filter-bar">
      <mat-form-field appearance="outline" class="filter-search">
        <mat-label>Buscar por número, chave ou destinatário</mat-label>
        <input matInput [formControl]="filtroTexto" />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Tipo</mat-label>
        <mat-select [formControl]="filtroTipo">
          <mat-option value="">Todos</mat-option>
          <mat-option value="NFE">NF-e</mat-option>
          <mat-option value="NFSE">NFS-e</mat-option>
          <mat-option value="NFCE">NFC-e</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Status</mat-label>
        <mat-select [formControl]="filtroStatus">
          <mat-option value="">Todos</mat-option>
          <mat-option value="AUTORIZADO">Autorizado</mat-option>
          <mat-option value="PROCESSANDO">Processando</mat-option>
          <mat-option value="REJEITADO">Rejeitado</mat-option>
          <mat-option value="CANCELADO">Cancelado</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>De</mat-label>
        <input matInput [matDatepicker]="dpInicio" [formControl]="filtroDataInicio" />
        <mat-datepicker-toggle matSuffix [for]="dpInicio" />
        <mat-datepicker #dpInicio />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Até</mat-label>
        <input matInput [matDatepicker]="dpFim" [formControl]="filtroDataFim" />
        <mat-datepicker-toggle matSuffix [for]="dpFim" />
        <mat-datepicker #dpFim />
      </mat-form-field>
    </div>

    <!-- Totalizadores -->
    <div class="totais-bar">
      <div class="total-card">
        <span class="total-label">Total Emitido</span>
        <span class="total-value">{{ totalEmitido() | currencyBr }}</span>
      </div>
      <div class="total-card total-card--success">
        <span class="total-label">Autorizados</span>
        <span class="total-value">{{ countAutorizados() }}</span>
      </div>
      <div class="total-card total-card--warning">
        <span class="total-label">Processando</span>
        <span class="total-value">{{ countProcessando() }}</span>
      </div>
      <div class="total-card total-card--danger">
        <span class="total-label">Rejeitados</span>
        <span class="total-value">{{ countRejeitados() }}</span>
      </div>
    </div>

    <app-data-table
      [data]="documentos()"
      [columns]="columns"
      [totalElements]="total()"
      [loading]="loading()"
      [actions]="actions"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)"
      (rowClick)="abrirDetalhe($event)"
    />
  `,
  styles: [`
    .filter-bar {
      display: flex; gap: var(--space-3); align-items: flex-start;
      flex-wrap: wrap; margin-bottom: var(--space-4);

      .filter-search { flex: 1; min-width: 280px; }
      mat-form-field  { min-width: 160px; }
    }

    .totais-bar {
      display: flex; gap: var(--space-3); margin-bottom: var(--space-4); flex-wrap: wrap;
    }

    .total-card {
      flex: 1; min-width: 150px;
      background: white;
      border: 1px solid var(--color-neutral-200);
      border-radius: var(--radius-md);
      padding: var(--space-4) var(--space-5);
      display: flex; flex-direction: column; gap: 2px;

      .total-label { font-size: var(--text-xs); color: var(--color-neutral-500); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
      .total-value { font-size: var(--text-xl); font-weight: 700; color: var(--color-neutral-900); }

      &--success .total-value { color: var(--color-success-700); }
      &--warning .total-value { color: var(--color-warning-700); }
      &--danger  .total-value { color: var(--color-danger-700); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiscalListComponent {
  readonly documentos     = signal<DocumentoFiscalResponse[]>([]);
  readonly loading        = signal(false);
  readonly total          = signal(0);
  readonly totalEmitido   = signal(0);
  readonly countAutorizados = signal(0);
  readonly countProcessando = signal(0);
  readonly countRejeitados  = signal(0);

  readonly filtroTexto    = new FormControl('');
  readonly filtroTipo     = new FormControl('');
  readonly filtroStatus   = new FormControl('');
  readonly filtroDataInicio = new FormControl<Date | null>(null);
  readonly filtroDataFim    = new FormControl<Date | null>(null);

  readonly columns: TableColumn<DocumentoFiscalResponse>[] = [
    { key: 'tipo',          header: 'Tipo',        width: '80px', align: 'center' },
    { key: 'numero',        header: 'Número',      sortable: true, width: '100px' },
    { key: 'status',        header: 'Status',      type: 'status', width: '130px' },
    { key: 'destinatario',  header: 'Destinatário', sortable: true },
    { key: 'valorTotal',    header: 'Valor',       type: 'currency', align: 'right', width: '130px' },
    { key: 'dataAutorizacao', header: 'Autorização', type: 'date', sortable: true, width: '140px' },
  ];

  readonly actions = [
    { label: 'Ver Detalhes', icon: 'visibility',    action: (doc: DocumentoFiscalResponse) => this.abrirDetalhe(doc) },
    { label: 'Baixar XML',   icon: 'code',          action: (doc: DocumentoFiscalResponse) => this.baixarXml(doc) },
    { label: 'Baixar PDF',   icon: 'picture_as_pdf', action: (doc: DocumentoFiscalResponse) => this.baixarPdf(doc) },
    { label: 'Cancelar',     icon: 'cancel',        action: (doc: DocumentoFiscalResponse) => this.cancelar(doc), danger: true },
  ];

  baixarXml(doc: DocumentoFiscalResponse) {
    // Baixa o XML diretamente
    const a = document.createElement('a');
    a.href = `/api/v1/fiscal/${doc.id}/xml`;
    a.download = `${doc.tipo}-${doc.numero}.xml`;
    a.click();
  }

  baixarPdf(doc: DocumentoFiscalResponse) { /* similar */ }
  abrirDetalhe(doc: DocumentoFiscalResponse) { /* navegar */ }
  cancelar(doc: DocumentoFiscalResponse) { /* dialog confirmação */ }
  onPageChange(e: PageEvent) { /* recarregar */ }
  onSortChange(e: Sort) { /* recarregar */ }
}
```

---

## 2. Card de Status do Documento Fiscal (Detalhe)

```html
<!-- Componente de detalhe do documento fiscal -->
<div class="doc-header">
  <div class="doc-tipo-badge" [attr.data-tipo]="documento.tipo">{{ documento.tipo }}</div>
  <h1 class="doc-numero">Nº {{ documento.numero }}</h1>
  <app-status-badge [status]="documento.status" />
</div>

<!-- Timeline de eventos -->
<div class="timeline">
  @for (event of documento.eventos; track event.id) {
    <div class="timeline-item" [class.timeline-item--error]="event.tipo === 'ERRO'">
      <div class="timeline-dot">
        <mat-icon>{{ event.tipo === 'SUCESSO' ? 'check_circle' : 'error' }}</mat-icon>
      </div>
      <div class="timeline-content">
        <span class="timeline-title">{{ event.descricao }}</span>
        <span class="timeline-date">{{ event.dataHora | date:'dd/MM/yyyy HH:mm:ss' }}</span>
      </div>
    </div>
  }
</div>
```

---

## 3. Monitor em Tempo Real (Processando)

```typescript
// Componente que mostra documentos em processamento com auto-refresh
@Component({
  selector: 'app-fiscal-monitor',
  standalone: true,
  template: `
    <div class="monitor-card" @slideIn>
      <div class="monitor-header">
        <mat-spinner diameter="20" />
        <span>{{ countProcessando() }} documento(s) em processamento</span>
        <button mat-icon-button (click)="refresh()">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>
      @for (doc of processando(); track doc.id) {
        <div class="monitor-item">
          <span class="monitor-tipo">{{ doc.tipo }}</span>
          <span class="monitor-desc">Nº {{ doc.numero }} — {{ doc.mensagemRetorno }}</span>
          <mat-progress-bar mode="indeterminate" />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiscalMonitorComponent implements OnInit, OnDestroy {
  readonly processando    = signal<DocumentoFiscalResponse[]>([]);
  readonly countProcessando = computed(() => this.processando().length);

  private readonly fiscalService = inject(FiscalService);
  private interval?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.refresh();
    // Auto-refresh a cada 8 segundos enquanto houver docs em processamento
    this.interval = setInterval(() => {
      if (this.countProcessando() > 0) this.refresh();
    }, 8000);
  }

  refresh() {
    this.fiscalService.listarProcessando()
      .subscribe(docs => this.processando.set(docs));
  }

  ngOnDestroy() { clearInterval(this.interval); }
}
```

---

## 4. Estilos Globais de Card

```scss
// styles/cards.scss
.card {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-neutral-200);
  box-shadow: var(--shadow-sm);
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-5) var(--space-6);
    border-bottom: 1px solid var(--color-neutral-100);

    h2 { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--color-neutral-800); margin: 0; }
  }

  &__body { padding: var(--space-6); }
  &__footer {
    padding: var(--space-4) var(--space-6);
    background: var(--color-neutral-50);
    border-top: 1px solid var(--color-neutral-100);
    display: flex; justify-content: flex-end; gap: var(--space-2);
  }
}

// Tipo badge NF-e / NFS-e / NFC-e
.doc-tipo-badge {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.05em;

  &[data-tipo="NFE"]  { background: #dbeafe; color: #1d4ed8; }
  &[data-tipo="NFSE"] { background: #dcfce7; color: #15803d; }
  &[data-tipo="NFCE"] { background: #fef9c3; color: #a16207; }
}
```
