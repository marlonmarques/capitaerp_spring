import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MenuRefreshService } from '../../core/services/menu-refresh.service';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/auth/models/user.model';
import { EmpresaService } from '../../core/services/empresa.service';
import { ConfiguracaoNfseService } from '../../core/services/configuracoes/configuracao-nfse.service';
import { ConfiguracaoNfeService } from '../../core/services/configuracoes/configuracao-nfe.service';
import { ConfiguracaoNfceService } from '../../core/services/configuracoes/configuracao-nfce.service';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

interface MenuItem {
  label: string;
  icon: string;
  link?: string;
  roles?: string[];
  expanded?: boolean;
  children?: MenuItem[];
  showIfConfig?: 'nfse' | 'nfe' | 'nfce';
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [ConfirmDialogModule, ToastModule, CommonModule, RouterModule, MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  providers: [ConfirmationService, MessageService],
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  public authService = inject(AuthService);
  public empresaService = inject(EmpresaService);
  private configNfseService = inject(ConfiguracaoNfseService);
  private configNfeService = inject(ConfiguracaoNfeService);
  private configNfceService = inject(ConfiguracaoNfceService);
  private menuRefresh = inject(MenuRefreshService);
  private destroy$ = new Subject<void>();

  private configsHabilitadas = {
    nfse: false,
    nfe: false,
    nfce: false
  };

  isCollapsed = false;
  loading = false;
  isDarkMode = false;
  isNotificationPanelOpen = false;
  notifications = [
    { title: 'Baixo Estoque', message: 'Produto "Monitor 24" atingiu o limite mínimo.', type: 'warning', time: 'Há 15 min', read: false },
    { title: 'Novo Cliente', message: 'João Silva foi cadastrado com sucesso.', type: 'success', time: 'Há 2h', read: true },
    { title: 'Sistema', message: 'Atualização do ERP Capital foi concluída.', type: 'info', time: 'Ontem', read: true }
  ];
  breadcrumbItems: Array<{ label: string; link?: string }> = [];
  currentUser: User | null = null;
  filteredMenuItems: MenuItem[] = [];

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      link: '/dashboard',
      roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
    },
    {
      label: 'Cadastros',
      icon: 'pi pi-folder',
      roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'],
      expanded: true,
      children: [
        {
          label: 'Produtos',
          icon: 'pi pi-shopping-bag',
          link: '/products',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Categorias',
          icon: 'pi pi-tags',
          link: '/categories',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Clientes',
          icon: 'pi pi-user',
          link: '/clientes',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Fornecedores',
          icon: 'pi pi-truck',
          link: '/fornecedores',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Serviços',
          icon: 'pi pi-briefcase',
          link: '/servicos',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Filiais e Caixas',
          icon: 'pi pi-sitemap',
          link: '/filiais',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
        }
      ]
    },
    {
      label: 'Estoque',
      icon: 'pi pi-warehouse',
      roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'],
      expanded: false,
      children: [
        {
          label: 'Controle de Estoque',
          icon: 'pi pi-chart-bar',
          link: '/estoque',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Locais de Estoque',
          icon: 'pi pi-map-marker',
          link: '/estoque/locais',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
        }
      ]
    },
    {
      label: 'Contabilidade',
      icon: 'pi pi-file-edit',
      roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'],
      expanded: false,
      children: [
        {
          label: 'Fatura NFS-e (Serviços)',
          icon: 'pi pi-file-check',
          link: '/contabilidade/nfse',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'],
          showIfConfig: 'nfse'
        },
        {
          label: 'Fatura NFe (Produtos)',
          icon: 'pi pi-shopping-cart',
          link: '/contabilidade/nfe',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'],
          showIfConfig: 'nfe'
        }
      ]
    },
    {
      label: 'Financeiro',
      icon: 'pi pi-wallet',
      roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'],
      expanded: false,
      children: [
        {
          label: 'Contas Bancárias',
          icon: 'pi pi-building-columns',
          link: '/financeiro/contas-bancarias',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
        }
      ]
    },
    {
      label: 'Sistema',
      icon: 'pi pi-desktop',
      roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'],
      expanded: false,
      children: [
        {
          label: 'Usuários',
          icon: 'pi pi-users',
          link: '/users',
          roles: ['ROLE_ADMIN']
        },
        {
          label: 'Auditoria Técnica',
          icon: 'pi pi-shield',
          link: '/audit',
          roles: ['ROLE_ADMIN', 'ROLE_OPERATOR']
        },
        {
          label: 'Configurações',
          icon: 'pi pi-cog',
          link: '/configuracoes',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
        }
      ]
    },
    {
      label: 'Cadastro Fiscal',
      icon: 'pi pi-book',
      roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'],
      expanded: false,
      children: [
        {
          label: 'Posições Fiscais',
          icon: 'pi pi-wallet',
          link: '/fiscal/posicoes-fiscais',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Mensagens Fiscais',
          icon: 'pi pi-comments',
          link: '/fiscal/mensagens-fiscais',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
        },
        {
          label: 'Grupos Tributários',
          icon: 'pi pi-percentage',
          link: '/fiscal/grupos-tributarios',
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
        }
      ]
    }
  ];

  toggleSubmenu(item: MenuItem): void {
    if (this.isCollapsed) {
      this.isCollapsed = false;
      item.expanded = true;
      return;
    }

    const wasExpanded = item.expanded;
    // Accordion: Opcional, se quiser que apenas um abra por vez, mantenha a linha abaixo
    this.filteredMenuItems.forEach(m => m.expanded = false);

    if (item.children) {
      item.expanded = !wasExpanded;
    }
  }

  isParentActive(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => child.link && this.router.url.includes(child.link));
  }

  private autoExpandMenu(): void {
    const url = this.router.url;
    this.filteredMenuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => child.link && url.includes(child.link));
        if (hasActiveChild) {
          item.expanded = true;
        }
      }
    });
  }

  closeAllSubmenus(): void {
    this.filteredMenuItems.forEach(m => m.expanded = false);
  }

  toggleNotificationPanel(): void {
    this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  ngOnInit(): void {
    this.setupBreadcrumb();
    this.setupUser();
    this.carregarLogo();
    this.loadTheme();
    this.carregarConfiguracoesHabilitadas();

    // Auto expandir no carregamento inicial
    setTimeout(() => this.autoExpandMenu(), 500);

    this.menuRefresh.refresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.carregarConfiguracoesHabilitadas());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private carregarConfiguracoesHabilitadas(): void {
    forkJoin({
      nfse: this.configNfseService.getConfiguracao().pipe(catchError(() => of({ ativarNfse: false }))),
      nfe: this.configNfeService.getConfiguracao().pipe(catchError(() => of({ ativarNfe: false }))),
      nfce: this.configNfceService.getConfiguracao().pipe(catchError(() => of({ ativarNfce: false })))
    }).subscribe(res => {
      this.configsHabilitadas.nfse = !!(res.nfse as any).ativarNfse;
      this.configsHabilitadas.nfe = !!(res.nfe as any).ativarNfe;
      this.configsHabilitadas.nfce = !!(res.nfce as any).ativarNfce;
      this.buildMenu();
    });
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      this.isDarkMode = false;
      document.documentElement.classList.remove('dark');
    }
  }

  private carregarLogo(): void {
    this.empresaService.carregarConfiguracao().subscribe();
  }

  private setupBreadcrumb(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBreadcrumb();
        this.autoExpandMenu();
      });
  }

  private setupUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.buildMenu();
    });
  }

  private buildMenu(): void {
    this.filteredMenuItems = this.menuItems
      .filter(item => {
        // 1. Verificar Permissões (Roles)
        if (item.roles && !this.authService.hasAnyRole(item.roles)) return false;

        // 2. Verificar Feature Toggle (Configurações)
        if (item.showIfConfig && !this.configsHabilitadas[item.showIfConfig]) return false;

        return true;
      })
      .map(item => {
        if (item.children) {
          const filteredChildren = item.children.filter(child => {
            // 1. Verificar Roles
            if (child.roles && !this.authService.hasAnyRole(child.roles)) return false;

            // 2. Verificar Feature Toggle
            if (child.showIfConfig && !this.configsHabilitadas[child.showIfConfig]) return false;

            return true;
          });

          // Oculta o menu pai inteiro se ele tiver filhos marcados com feature toggle e nenhum estiver ativo
          // (Opcional, mas limpa o sidebar se o grupo ficar vazio)
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter(item => !item.children || item.children.length > 0); // Remove grupos vazios
  }

  private updateBreadcrumb(): void {
    const url = this.router.url;

    if (url.includes('/dashboard')) {
      this.breadcrumbItems = [{ label: 'Dashboard' }];
    } else if (url.includes('/products')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Cadastros' },
        { label: 'Produtos', link: '/products' }
      ];
    } else if (url.includes('/categories')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Cadastros' },
        { label: 'Categorias', link: '/categories' }
      ];
    } else if (url.includes('/users')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Sistema' },
        { label: 'Usuários', link: '/users' }
      ];
    } else if (url.includes('/audit')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Sistema' },
        { label: 'Auditoria', link: '/audit' }
      ];
    } else if (url.includes('/servicos')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Cadastros' },
        { label: 'Serviços', link: '/servicos' }
      ];
    } else if (url.includes('/configuracoes')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Sistema' },
        { label: 'Configurações', link: '/configuracoes' }
      ];
    } else if (url.includes('/settings')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Sistema' },
        { label: 'Meu Perfil', link: '/settings' }
      ];
    } else if (url.includes('/fiscal/posicoes-fiscais')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Cadastro Fiscal' },
        { label: 'Posições Fiscais', link: '/fiscal/posicoes-fiscais' }
      ];
    } else if (url.includes('/fiscal/mensagens-fiscais')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Cadastro Fiscal' },
        { label: 'Mensagens Fiscais', link: '/fiscal/mensagens-fiscais' }
      ];
    } else if (url.includes('/fiscal/grupos-tributarios')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Cadastro Fiscal' },
        { label: 'Grupos Tributários', link: '/fiscal/grupos-tributarios' }
      ];
    } else if (url.includes('/financeiro/contas-bancarias')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Financeiro' },
        { label: 'Contas Bancárias', link: '/financeiro/contas-bancarias' }
      ];
    } else if (url.includes('/estoque/locais')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Estoque' },
        { label: 'Locais de Estoque', link: '/estoque/locais' }
      ];
    } else if (url.includes('/estoque')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Estoque' },
        { label: 'Controle de Estoque', link: '/estoque' }
      ];
    } else if (url.includes('/contabilidade/nfse/criar')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Contabilidade' },
        { label: 'Fatura NFS-e', link: '/contabilidade/nfse' },
        { label: 'Criar Nota' }
      ];
    } else if (url.includes('/contabilidade/nfse') && url.includes('/editar')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Contabilidade' },
        { label: 'Fatura NFS-e', link: '/contabilidade/nfse' },
        { label: 'Editar Nota' }
      ];
    } else if (url.includes('/contabilidade/nfse')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Contabilidade' },
        { label: 'Fatura NFS-e', link: '/contabilidade/nfse' }
      ];
    } else if (url.includes('/contabilidade/nfe/nova')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Contabilidade' },
        { label: 'Fatura NFe', link: '/contabilidade/nfe' },
        { label: 'Criar Nota' }
      ];
    } else if (url.includes('/contabilidade/nfe/editar')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Contabilidade' },
        { label: 'Fatura NFe', link: '/contabilidade/nfe' },
        { label: 'Editar Nota' }
      ];
    } else if (url.includes('/contabilidade/nfe')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Contabilidade' },
        { label: 'Fatura NFe', link: '/contabilidade/nfe' }
      ];
    } else {
      this.breadcrumbItems = [{ label: 'Dashboard', link: '/dashboard' }];
    }
  }

  logout(): void {
    this.confirmationService.confirm({
      header: 'Confirmação',
      message: 'Deseja realmente sair do sistema?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, sair',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        // Ação executada se o usuário confirmar
        this.authService.logout();
      },
      reject: () => {
        // Opcional: ação se o usuário cancelar
        console.log('Logout cancelado');
      }
    });
  }
}
