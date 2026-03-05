import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-configuracoes-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule],
    templateUrl: './configuracoes-layout.component.html',
    styles: [`
    .nav-link.active {
      @apply bg-indigo-50 text-indigo-700 font-semibold border-indigo-500 shadow-sm relative z-10;
    }
  `]
})
export class ConfiguracoesLayoutComponent {
    private router = inject(Router);
    currentRoute = '';

    menuItems = [
        { label: 'Visão Geral', icon: 'dashboard', route: '/configuracoes/geral' },
        { label: 'Dados da Empresa', icon: 'business', route: '/settings/company' },
        { label: 'Filiais e Estoques', icon: 'storefront', route: '/configuracoes/estoques' },
        { label: 'Financeiro Geral', icon: 'account_balance_wallet', route: '/configuracoes/financeiro' },
        { label: 'NFS-e (Serviços)', icon: 'receipt_long', route: '/configuracoes/nfse' },
        { label: 'NF-e (Mercadorias)', icon: 'local_mall', route: '/configuracoes/nfe' },
        { label: 'NFC-e (Consumidor)', icon: 'point_of_sale', route: '/configuracoes/nfce' },
        { label: 'Automações & E-mails', icon: 'mark_email_read', route: '/configuracoes/automacoes' },
        { label: 'Perfis e Acessos', icon: 'manage_accounts', route: '/users' }
    ];

    constructor() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.currentRoute = event.urlAfterRedirects.split('?')[0];
        });
    }

    isRouteActive(routeHref: string): boolean {
        return this.currentRoute.includes(routeHref);
    }
}
