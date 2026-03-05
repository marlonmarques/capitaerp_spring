import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/auth/models/user.model';
import { EmpresaService } from '../../core/services/empresa.service';

interface MenuItem {
  label: string;
  icon: string;
  link?: string;
  roles?: string[];
  expanded?: boolean;
  children?: MenuItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService);
  public empresaService = inject(EmpresaService);

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
          roles: ['ROLE_OPERATOR', 'ROLE_ADMIN']
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
    }
    // Accordion behavior: close all other items in the filtered menu list
    const wasExpanded = item.expanded;
    this.filteredMenuItems.forEach(m => m.expanded = false);

    if (item.children) {
      item.expanded = !wasExpanded;
    }
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
        if (!item.roles) return true;
        return this.authService.hasAnyRole(item.roles);
      })
      .map(item => {
        if (item.children) {
          return {
            ...item,
            children: item.children.filter(child => {
              if (!child.roles) return true;
              return this.authService.hasAnyRole(child.roles);
            })
          };
        }
        return item;
      });
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
    } else {
      this.breadcrumbItems = [{ label: 'Dashboard', link: '/dashboard' }];
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
