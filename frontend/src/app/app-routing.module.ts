import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './core/auth/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./shared/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'products/new',
        loadComponent: () => import('./pages/products/product-form.component').then(m => m.ProductFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./pages/products/product-form.component').then(m => m.ProductFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'categories/new',
        loadComponent: () => import('./pages/categories/category-form.component').then(m => m.CategoryFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'categories/:id/edit',
        loadComponent: () => import('./pages/categories/category-form.component').then(m => m.CategoryFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'clientes',
        loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'clientes/new',
        loadComponent: () => import('./pages/clientes/cliente-form.component').then(m => m.ClienteFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'clientes/:id/edit',
        loadComponent: () => import('./pages/clientes/cliente-form.component').then(m => m.ClienteFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'fornecedores',
        loadComponent: () => import('./pages/fornecedores/fornecedores.component').then(m => m.FornecedoresComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'fornecedores/new',
        loadComponent: () => import('./pages/fornecedores/fornecedor-form.component').then(m => m.FornecedorFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'fornecedores/:id/edit',
        loadComponent: () => import('./pages/fornecedores/fornecedor-form.component').then(m => m.FornecedorFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'filiais',
        loadComponent: () => import('./pages/filiais/filiais.component').then(m => m.FiliaisComponent),
        data: { roles: ['ROLE_ADMIN', 'ROLE_OPERATOR'] }
      },
      {
        path: 'filiais/new',
        loadComponent: () => import('./pages/filiais/filial-form.component').then(m => m.FilialFormComponent),
        data: { roles: ['ROLE_ADMIN', 'ROLE_OPERATOR'] }
      },
      {
        path: 'filiais/:id/edit',
        loadComponent: () => import('./pages/filiais/filial-form.component').then(m => m.FilialFormComponent),
        data: { roles: ['ROLE_ADMIN', 'ROLE_OPERATOR'] }
      },
      {
        path: 'contabilidade/nfse',
        loadComponent: () => import('./pages/nfse/nfse-list.component').then(m => m.NfseListComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'contabilidade/nfse/criar',
        loadComponent: () => import('./pages/nfse/nfse-form.component').then(m => m.NfseFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'contabilidade/nfse/:id',
        loadComponent: () => import('./pages/nfse/nfse-form.component').then(m => m.NfseFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'contabilidade/nfse/:id/editar',
        loadComponent: () => import('./pages/nfse/nfse-form.component').then(m => m.NfseFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'contabilidade/nfe',
        loadComponent: () => import('./pages/nfe/nfe-list/nfe-list.component').then(m => m.NfeListComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'contabilidade/nfe/nova',
        loadComponent: () => import('./pages/nfe/nfe-form/nfe-form.component').then(m => m.NfeFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'contabilidade/nfe/editar/:id',
        loadComponent: () => import('./pages/nfe/nfe-form/nfe-form.component').then(m => m.NfeFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'configuracoes',
        loadComponent: () => import('./pages/configuracoes/configuracoes-layout.component').then(m => m.ConfiguracoesLayoutComponent),
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] },
        children: [
          { path: '', redirectTo: 'geral', pathMatch: 'full' },
          { path: 'geral', loadComponent: () => import('./pages/configuracoes/configuracoes-geral.component').then(m => m.ConfiguracoesGeralComponent) },
          { path: 'nfse', loadComponent: () => import('./pages/configuracoes/configuracoes-nfse.component').then(m => m.ConfiguracoesNfseComponent) },
          { path: 'nfe', loadComponent: () => import('./pages/configuracoes/configuracoes-nfe.component').then(m => m.ConfiguracoesNfeComponent) },
          { path: 'nfce', loadComponent: () => import('./pages/configuracoes/configuracoes-nfce.component').then(m => m.ConfiguracoesNfceComponent) }
        ]
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/profile/settings.component').then(m => m.SettingsComponent),
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'users/new',
        loadComponent: () => import('./pages/users/user-form.component').then(m => m.UserFormComponent),
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./pages/users/user-form.component').then(m => m.UserFormComponent),
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'audit',
        loadComponent: () => import('./pages/audit/audit.component').then(m => m.AuditComponent),
        data: { roles: ['ROLE_ADMIN', 'ROLE_OPERATOR'] }
      },
      {
        path: 'servicos',
        loadComponent: () => import('./pages/servicos/servicos.component').then(m => m.ServicosComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'servicos/new',
        loadComponent: () => import('./pages/servicos/servico-form.component').then(m => m.ServicoFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'servicos/:id/edit',
        loadComponent: () => import('./pages/servicos/servico-form.component').then(m => m.ServicoFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'estoque',
        loadComponent: () => import('./pages/estoque/estoque.component').then(m => m.EstoqueComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'estoque/locais',
        loadComponent: () => import('./pages/estoque/locais-estoque.component').then(m => m.LocaisEstoqueComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'fiscal/posicoes-fiscais',
        loadComponent: () => import('./pages/fiscal/posicoes-fiscais/posicoes-fiscais.component').then(m => m.PosicoesFiscaisComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'fiscal/posicoes-fiscais/new',
        loadComponent: () => import('./pages/fiscal/posicoes-fiscais/posicao-fiscal-form.component').then(m => m.PosicaoFiscalFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'fiscal/posicoes-fiscais/:id/edit',
        loadComponent: () => import('./pages/fiscal/posicoes-fiscais/posicao-fiscal-form.component').then(m => m.PosicaoFiscalFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'fiscal/mensagens-fiscais',
        loadComponent: () => import('./pages/fiscal/mensagens-fiscais/mensagens-fiscais.component').then(m => m.MensagensFiscaisComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'fiscal/mensagens-fiscais/new',
        loadComponent: () => import('./pages/fiscal/mensagens-fiscais/mensagem-fiscal-form.component').then(m => m.MensagemFiscalFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'fiscal/mensagens-fiscais/:id/edit',
        loadComponent: () => import('./pages/fiscal/mensagens-fiscais/mensagem-fiscal-form.component').then(m => m.MensagemFiscalFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'fiscal/grupos-tributarios',
        loadComponent: () => import('./pages/fiscal/grupos-tributarios/grupos-tributarios.component').then(m => m.GruposTributariosComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'fiscal/grupos-tributarios/new',
        loadComponent: () => import('./pages/fiscal/grupos-tributarios/grupo-tributario-form.component').then(m => m.GrupoTributarioFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'fiscal/grupos-tributarios/:id/edit',
        loadComponent: () => import('./pages/fiscal/grupos-tributarios/grupo-tributario-form.component').then(m => m.GrupoTributarioFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'financeiro/contas-bancarias',
        loadComponent: () => import('./pages/financeiro/contas-bancarias/contas-bancarias.component').then(m => m.ContasBancariasComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'financeiro/contas-bancarias/new',
        loadComponent: () => import('./pages/financeiro/contas-bancarias/conta-bancaria-form.component').then(m => m.ContaBancariaFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      },
      {
        path: 'financeiro/contas-bancarias/:id/edit',
        loadComponent: () => import('./pages/financeiro/contas-bancarias/conta-bancaria-form.component').then(m => m.ContaBancariaFormComponent),
        data: { roles: ['ROLE_OPERATOR', 'ROLE_ADMIN'] }
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }