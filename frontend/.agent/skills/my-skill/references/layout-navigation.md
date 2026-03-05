# Layout, Sidebar & Navegação

## 1. Shell Component (estrutura principal)

```typescript
// core/layout/shell/shell.component.ts
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  template: `
    <div class="shell" [class.sidebar-collapsed]="sidebarCollapsed()">
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        (toggleCollapse)="sidebarCollapsed.set(!sidebarCollapsed())"
      />
      <div class="shell__main">
        <app-header (toggleSidebar)="sidebarCollapsed.set(!sidebarCollapsed())" />
        <main class="shell__content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell {
      display: grid;
      grid-template-columns: var(--sidebar-width) 1fr;
      height: 100vh;
      overflow: hidden;
      transition: grid-template-columns var(--transition-normal);

      &.sidebar-collapsed {
        grid-template-columns: var(--sidebar-collapsed-width) 1fr;
      }
    }

    .shell__main {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--color-neutral-50);
    }

    .shell__content {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-6);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  readonly sidebarCollapsed = signal(false);
}
```

---

## 2. Sidebar Component

```typescript
// core/layout/sidebar/sidebar.component.ts
export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',       icon: 'dashboard',      route: '/dashboard' },
  { label: 'Divider' },
  {
    label: 'Estoque',
    icon: 'inventory_2',
    children: [
      { label: 'Produtos',      icon: 'category',       route: '/estoque/produtos' },
      { label: 'Movimentações', icon: 'swap_horiz',     route: '/estoque/movimentacoes' },
      { label: 'Alertas',       icon: 'warning_amber',  route: '/estoque/alertas', badge: 3 },
    ]
  },
  {
    label: 'Vendas',
    icon: 'point_of_sale',
    children: [
      { label: 'Nova Venda',    icon: 'add_shopping_cart', route: '/vendas/nova' },
      { label: 'Lista de Vendas', icon: 'receipt_long',    route: '/vendas' },
    ]
  },
  { label: 'Clientes',        icon: 'people',          route: '/clientes' },
  { label: 'Fornecedores',    icon: 'local_shipping',  route: '/fornecedores' },
  {
    label: 'Ordens de Serviço',
    icon: 'build_circle',
    children: [
      { label: 'Nova OS',        icon: 'add_circle',    route: '/ordens-servico/nova' },
      { label: 'Lista de OS',    icon: 'format_list_bulleted', route: '/ordens-servico' },
    ]
  },
  { label: 'Divider' },
  {
    label: 'Fiscal',
    icon: 'receipt',
    children: [
      { label: 'NF-e',           icon: 'description',   route: '/fiscal/nfe' },
      { label: 'NFS-e',          icon: 'handyman',      route: '/fiscal/nfse' },
      { label: 'NFC-e',          icon: 'receipt_long',  route: '/fiscal/nfce' },
    ]
  },
  { label: 'Configurações',   icon: 'settings',        route: '/configuracoes' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, MatIconModule, MatBadgeModule,
            MatTooltipModule, MatRippleModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  readonly navItems = NAV_ITEMS;
  readonly expandedSections = signal<Set<string>>(new Set(['Estoque']));

  toggleSection(label: string) {
    this.expandedSections.update(set => {
      const newSet = new Set(set);
      newSet.has(label) ? newSet.delete(label) : newSet.add(label);
      return newSet;
    });
  }

  isExpanded(label: string) {
    return this.expandedSections().has(label);
  }
}
```

```html
<!-- sidebar.component.html -->
<aside class="sidebar" [class.collapsed]="collapsed">
  <!-- Logo -->
  <div class="sidebar__logo">
    <div class="logo-icon">
      <mat-icon>storefront</mat-icon>
    </div>
    @if (!collapsed) {
      <span class="logo-text">ERP System</span>
    }
    <button class="collapse-btn" (click)="toggleCollapse.emit()" [matTooltip]="collapsed ? 'Expandir' : 'Recolher'">
      <mat-icon>{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
    </button>
  </div>

  <!-- Nav -->
  <nav class="sidebar__nav">
    @for (item of navItems; track item.label) {
      @if (item.label === 'Divider') {
        <div class="nav-divider"></div>
      } @else if (item.children) {
        <!-- Grupo expansível -->
        <div class="nav-group">
          <button class="nav-item nav-item--parent"
                  (click)="toggleSection(item.label)"
                  [class.expanded]="isExpanded(item.label)"
                  [matTooltip]="collapsed ? item.label : ''"
                  matTooltipPosition="right">
            <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
            @if (!collapsed) {
              <span class="nav-label">{{ item.label }}</span>
              <mat-icon class="nav-chevron">expand_more</mat-icon>
            }
          </button>
          @if (isExpanded(item.label) && !collapsed) {
            <div class="nav-children" @slideDown>
              @for (child of item.children; track child.route) {
                <a class="nav-item nav-item--child"
                   [routerLink]="child.route"
                   routerLinkActive="active">
                  <mat-icon class="nav-icon">{{ child.icon }}</mat-icon>
                  <span class="nav-label">{{ child.label }}</span>
                  @if (child.badge) {
                    <span class="nav-badge">{{ child.badge }}</span>
                  }
                </a>
              }
            </div>
          }
        </div>
      } @else {
        <a class="nav-item"
           [routerLink]="item.route"
           routerLinkActive="active"
           [matTooltip]="collapsed ? item.label : ''"
           matTooltipPosition="right">
          <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
          @if (!collapsed) {
            <span class="nav-label">{{ item.label }}</span>
          }
        </a>
      }
    }
  </nav>
</aside>
```

```scss
// sidebar.component.scss
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--color-neutral-900);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width var(--transition-normal);
  border-right: 1px solid rgba(255,255,255,0.06);

  &.collapsed { width: var(--sidebar-collapsed-width); }
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-4);
  height: var(--header-height);
  border-bottom: 1px solid rgba(255,255,255,0.08);

  .logo-icon {
    width: 32px; height: 32px;
    background: var(--color-primary-600);
    border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    mat-icon { color: white; font-size: 20px; }
  }

  .logo-text {
    font-weight: var(--font-bold);
    font-size: var(--text-base);
    color: white;
    white-space: nowrap;
    overflow: hidden;
  }

  .collapse-btn {
    margin-left: auto;
    background: transparent;
    border: none;
    color: var(--color-neutral-400);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-sm);
    display: flex;
    transition: color var(--transition-fast);
    &:hover { color: white; }
  }
}

.sidebar__nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-3) var(--space-2);

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
}

.nav-divider {
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin: var(--space-2) var(--space-2);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-neutral-400);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  transition: background var(--transition-fast), color var(--transition-fast);

  &:hover { background: rgba(255,255,255,0.07); color: var(--color-neutral-100); }

  &.active {
    background: var(--color-primary-600);
    color: white;
    .nav-icon { color: white; }
  }

  &--parent {
    font-weight: var(--font-semibold);
    color: var(--color-neutral-300);

    .nav-chevron {
      margin-left: auto;
      font-size: 18px;
      transition: transform var(--transition-fast);
    }

    &.expanded .nav-chevron { transform: rotate(180deg); }
  }

  &--child {
    padding-left: var(--space-8);
    font-size: var(--text-xs);
  }
}

.nav-icon { font-size: 20px; flex-shrink: 0; }
.nav-label { white-space: nowrap; overflow: hidden; }
.nav-badge {
  margin-left: auto;
  background: var(--color-danger-500);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
}

.nav-children { padding-top: var(--space-1); }
```

---

## 3. Header Component

```typescript
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule,
            RouterLink, CommonModule],
  template: `
    <header class="header">
      <button mat-icon-button class="mobile-menu-btn" (click)="toggleSidebar.emit()">
        <mat-icon>menu</mat-icon>
      </button>

      <!-- Breadcrumb -->
      <nav class="breadcrumb" aria-label="Breadcrumb">
        @for (crumb of breadcrumbs(); track crumb.url; let last = $last) {
          @if (!last) {
            <a [routerLink]="crumb.url" class="breadcrumb__item">{{ crumb.label }}</a>
            <mat-icon class="breadcrumb__sep">chevron_right</mat-icon>
          } @else {
            <span class="breadcrumb__item breadcrumb__item--current">{{ crumb.label }}</span>
          }
        }
      </nav>

      <div class="header__actions">
        <!-- Notificações de estoque -->
        <button mat-icon-button [matMenuTriggerFor]="notifMenu"
                [matBadge]="alertasEstoque()" matBadgeColor="warn"
                [matBadgeHidden]="!alertasEstoque()">
          <mat-icon>notifications</mat-icon>
        </button>

        <mat-menu #notifMenu="matMenu" xPosition="before">
          <div class="notif-header">Alertas de Estoque</div>
          @for (alerta of alertasList(); track alerta.id) {
            <button mat-menu-item [routerLink]="['/estoque/produtos', alerta.id]">
              <mat-icon color="warn">inventory_2</mat-icon>
              <span>{{ alerta.nome }}: {{ alerta.estoqueAtual }} un.</span>
            </button>
          }
          @empty {
            <div class="notif-empty">Nenhum alerta</div>
          }
        </mat-menu>

        <!-- Avatar / Usuário -->
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <div class="avatar">{{ userInitials() }}</div>
        </button>

        <mat-menu #userMenu="matMenu" xPosition="before">
          <button mat-menu-item routerLink="/configuracoes/perfil">
            <mat-icon>account_circle</mat-icon> Meu Perfil
          </button>
          <button mat-menu-item routerLink="/configuracoes">
            <mat-icon>settings</mat-icon> Configurações
          </button>
          <mat-divider />
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon> Sair
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      height: var(--header-height);
      padding: 0 var(--space-6);
      background: var(--color-neutral-0);
      border-bottom: 1px solid var(--color-neutral-200);
    }

    .breadcrumb {
      display: flex; align-items: center; gap: 2px;
      flex: 1;

      &__item {
        font-size: var(--text-sm);
        color: var(--color-neutral-500);
        text-decoration: none;
        &:hover { color: var(--color-primary-600); }
        &--current { color: var(--color-neutral-900); font-weight: var(--font-semibold); }
      }

      &__sep { font-size: 16px; color: var(--color-neutral-300); }
    }

    .header__actions { display: flex; align-items: center; gap: var(--space-1); margin-left: auto; }

    .avatar {
      width: 32px; height: 32px;
      background: var(--color-primary-600);
      color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
    }

    .notif-header { padding: var(--space-3) var(--space-4); font-weight: var(--font-semibold); font-size: var(--text-sm); color: var(--color-neutral-500); }
    .notif-empty  { padding: var(--space-4); text-align: center; color: var(--color-neutral-400); font-size: var(--text-sm); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  // Injeta router para breadcrumb automático
  private router = inject(Router);
  readonly breadcrumbs = signal<{ label: string; url: string }[]>([]);
  readonly alertasEstoque = signal(0);
  readonly alertasList = signal<any[]>([]);
  readonly userInitials = signal('US');

  logout() { /* implementar */ }
}
```

---

## 4. Page Header Component

```typescript
// shared/components/page-header/page-header.component.ts
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, CommonModule],
  template: `
    <div class="page-header">
      <div class="page-header__info">
        @if (backRoute) {
          <button mat-icon-button class="back-btn" [routerLink]="backRoute">
            <mat-icon>arrow_back</mat-icon>
          </button>
        }
        <div>
          <h1 class="page-title">{{ title }}</h1>
          @if (subtitle) {
            <p class="page-subtitle">{{ subtitle }}</p>
          }
        </div>
      </div>
      <div class="page-header__actions">
        <ng-content select="[actions]" />
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: var(--space-6);
      gap: var(--space-4);

      &__info { display: flex; align-items: center; gap: var(--space-3); }
      &__actions { display: flex; align-items: center; gap: var(--space-2); flex-shrink: 0; }
    }

    .page-title   { font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-neutral-900); margin: 0; }
    .page-subtitle { font-size: var(--text-sm); color: var(--color-neutral-500); margin: 4px 0 0; }
  `],
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() backRoute?: string | any[];
}
```
