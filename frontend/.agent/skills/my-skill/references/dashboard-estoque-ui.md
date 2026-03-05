# Dashboard & Estoque UI

## 1. Dashboard Principal

```typescript
// features/dashboard/dashboard.component.ts
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, MatButtonModule, RouterLink,
    NgxEchartsModule, StatusBadgeComponent, CurrencyBrPipe,
    DataTableComponent, FiscalMonitorComponent,
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly dashService = inject(DashboardService);

  readonly kpis           = signal<DashboardKpis | null>(null);
  readonly vendas7dias    = signal<VendasDia[]>([]);
  readonly alertasEstoque = signal<ProdutoAlerta[]>([]);
  readonly ultimasVendas  = signal<VendaResponse[]>([]);
  readonly loading        = signal(true);

  // Opções do gráfico ECharts
  readonly chartVendas = computed<EChartsOption>(() => ({
    tooltip: { trigger: 'axis', formatter: (p: any) => `${p[0].name}<br/>R$ ${p[0].value.toLocaleString('pt-BR')}` },
    xAxis: {
      type: 'category',
      data: this.vendas7dias().map(d => d.data),
      axisLabel: { color: '#64748b', fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748b', formatter: 'R$ {value}' },
      splitLine: { lineStyle: { color: '#e2e8f0' } },
    },
    series: [{
      type: 'bar',
      data: this.vendas7dias().map(d => d.valor),
      itemStyle: { color: '#2563eb', borderRadius: [4, 4, 0, 0] },
      barMaxWidth: 48,
    }],
    grid: { top: 20, right: 20, bottom: 30, left: 60 },
  }));

  ngOnInit() {
    this.dashService.getKpis()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(data => {
        this.kpis.set(data.kpis);
        this.vendas7dias.set(data.vendas7dias);
        this.alertasEstoque.set(data.alertasEstoque);
        this.ultimasVendas.set(data.ultimasVendas);
      });
  }
}
```

```html
<!-- dashboard.component.html -->
<div class="dashboard">

  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-icon kpi-icon--blue"><mat-icon>point_of_sale</mat-icon></div>
      <div class="kpi-info">
        <span class="kpi-label">Vendas Hoje</span>
        <span class="kpi-value">{{ kpis()?.vendasHoje | currencyBr }}</span>
        <span class="kpi-trend" [class.up]="kpis()?.tendenciaVendas > 0">
          <mat-icon>{{ kpis()?.tendenciaVendas > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
          {{ kpis()?.tendenciaVendas | number:'1.1-1' }}% vs ontem
        </span>
      </div>
    </div>

    <div class="kpi-card">
      <div class="kpi-icon kpi-icon--green"><mat-icon>receipt</mat-icon></div>
      <div class="kpi-info">
        <span class="kpi-label">NF emitidas (mês)</span>
        <span class="kpi-value">{{ kpis()?.nfEmitidas }}</span>
        <span class="kpi-sub">{{ kpis()?.nfProcessando }} em processamento</span>
      </div>
    </div>

    <div class="kpi-card">
      <div class="kpi-icon kpi-icon--amber"><mat-icon>inventory_2</mat-icon></div>
      <div class="kpi-info">
        <span class="kpi-label">Alertas Estoque</span>
        <span class="kpi-value kpi-value--warn">{{ kpis()?.alertasEstoque }}</span>
        <span class="kpi-sub">produtos abaixo do mínimo</span>
      </div>
    </div>

    <div class="kpi-card">
      <div class="kpi-icon kpi-icon--purple"><mat-icon>build_circle</mat-icon></div>
      <div class="kpi-info">
        <span class="kpi-label">OS em Andamento</span>
        <span class="kpi-value">{{ kpis()?.osEmAndamento }}</span>
        <span class="kpi-sub">{{ kpis()?.osConcluidas }} concluídas este mês</span>
      </div>
    </div>
  </div>

  <!-- Conteúdo principal -->
  <div class="dashboard-grid">
    <!-- Gráfico de Vendas -->
    <div class="card dashboard-chart">
      <div class="card__header">
        <h2>Vendas — Últimos 7 Dias</h2>
        <button mat-stroked-button routerLink="/vendas">Ver todas</button>
      </div>
      <div class="card__body chart-body">
        <div echarts [options]="chartVendas()" class="chart-container"></div>
      </div>
    </div>

    <!-- Monitor Fiscal -->
    <app-fiscal-monitor />

    <!-- Alertas de Estoque -->
    <div class="card">
      <div class="card__header">
        <h2>⚠ Alertas de Estoque</h2>
        <button mat-stroked-button routerLink="/estoque/alertas">Ver todos</button>
      </div>
      <div class="alerta-list">
        @for (alerta of alertasEstoque(); track alerta.id) {
          <a class="alerta-item" [routerLink]="['/estoque/produtos', alerta.id]">
            <div class="alerta-info">
              <span class="alerta-nome">{{ alerta.nome }}</span>
              <span class="alerta-detalhe">
                Atual: <strong>{{ alerta.estoqueAtual }}</strong> |
                Mínimo: {{ alerta.estoqueMinimo }}
              </span>
            </div>
            <div class="alerta-nivel" [attr.data-nivel]="alerta.estoqueAtual === 0 ? 'critico' : 'baixo'">
              {{ alerta.estoqueAtual === 0 ? 'Crítico' : 'Baixo' }}
            </div>
          </a>
        }
        @empty {
          <div class="alerta-ok">
            <mat-icon color="primary">check_circle</mat-icon>
            Nenhum alerta de estoque!
          </div>
        }
      </div>
    </div>
  </div>
</div>
```

```scss
// dashboard.component.scss
.dashboard { display: flex; flex-direction: column; gap: var(--space-6); }

// KPI Grid
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
}

.kpi-card {
  display: flex; align-items: center; gap: var(--space-4);
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-neutral-200);
  padding: var(--space-5) var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast);
  &:hover { box-shadow: var(--shadow-md); }
}

.kpi-icon {
  width: 48px; height: 48px;
  border-radius: var(--radius-lg);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  mat-icon { font-size: 24px; color: white; }

  &--blue   { background: var(--color-primary-600); }
  &--green  { background: var(--color-success-500); }
  &--amber  { background: var(--color-warning-500); }
  &--purple { background: #7c3aed; }
}

.kpi-info {
  display: flex; flex-direction: column; gap: 2px;
  min-width: 0;
}

.kpi-label {
  font-size: var(--text-xs); color: var(--color-neutral-500);
  text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;
}

.kpi-value {
  font-size: var(--text-2xl); font-weight: 700; color: var(--color-neutral-900);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  &--warn { color: var(--color-warning-700); }
}

.kpi-sub   { font-size: var(--text-xs); color: var(--color-neutral-400); }
.kpi-trend {
  font-size: var(--text-xs); display: flex; align-items: center; gap: 2px;
  color: var(--color-neutral-500);
  mat-icon { font-size: 14px; }
  &.up { color: var(--color-success-600); }
}

// Dashboard Grid
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: var(--space-4);

  .dashboard-chart { grid-column: 1 / 2; }
}

.chart-body { padding: 0 var(--space-4) var(--space-4); }
.chart-container { height: 280px; width: 100%; }

// Alertas
.alerta-list { display: flex; flex-direction: column; }

.alerta-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-3) var(--space-5);
  text-decoration: none; color: inherit;
  border-top: 1px solid var(--color-neutral-100);
  transition: background var(--transition-fast);
  &:hover { background: var(--color-neutral-50); }
}

.alerta-nome   { font-size: var(--text-sm); font-weight: 500; color: var(--color-neutral-800); }
.alerta-detalhe { font-size: var(--text-xs); color: var(--color-neutral-400); }
.alerta-info   { display: flex; flex-direction: column; gap: 2px; }

.alerta-nivel {
  font-size: var(--text-xs); font-weight: 700;
  padding: 2px 8px; border-radius: var(--radius-full);
  &[data-nivel="critico"] { background: var(--color-danger-50); color: var(--color-danger-700); }
  &[data-nivel="baixo"]   { background: var(--color-warning-50); color: var(--color-warning-700); }
}

.alerta-ok {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-5); color: var(--color-neutral-500); font-size: var(--text-sm);
}
```

---

## 2. Tela de Produtos (Estoque)

```typescript
// features/estoque/produto-list.component.ts — padrão de listagem
readonly columns: TableColumn<ProdutoResponse>[] = [
  { key: 'codigoBarras',   header: 'Cód. Barras', width: '140px' },
  { key: 'nome',           header: 'Produto',     sortable: true },
  { key: 'categoria.nome', header: 'Categoria' },
  { key: 'precoVenda',     header: 'Preço Venda', type: 'currency', align: 'right', sortable: true },
  { key: 'estoqueAtual',   header: 'Estoque',     align: 'center',  sortable: true, type: 'template', template: estoqueTemplate },
  { key: 'status',         header: 'Status',      type: 'status' },
];
```

```html
<!-- Template do estoque com indicador visual -->
<ng-template #estoqueTemplate let-produto>
  <span class="estoque-badge"
        [class.estoque-badge--critico]="produto.estoqueAtual === 0"
        [class.estoque-badge--baixo]="produto.estoqueAtual > 0 && produto.estoqueAtual < produto.estoqueMinimo"
        [class.estoque-badge--ok]="produto.estoqueAtual >= produto.estoqueMinimo">
    {{ produto.estoqueAtual }}
  </span>
</ng-template>
```

```scss
.estoque-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 36px; padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm); font-weight: 700;

  &--ok      { background: var(--color-success-50); color: var(--color-success-700); }
  &--baixo   { background: var(--color-warning-50); color: var(--color-warning-700); }
  &--critico { background: var(--color-danger-50);  color: var(--color-danger-700); }
}
```
