import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsComponent } from './pages/products/products.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { UsersComponent } from './pages/users/users.component';
import { LoginComponent } from './shared/login/login.component';

import { AuthGuard } from './core/auth/auth.guard';
import { AdminGuard } from './core/auth/admin.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        component: DashboardComponent,
        data: { roles: ['ROLE_USER', 'ROLE_ADMIN'] }
      },
      { 
        path: 'products', 
        component: ProductsComponent,
        data: { roles: ['ROLE_USER', 'ROLE_ADMIN'] }
      },
      { 
        path: 'categories', 
        component: CategoriesComponent,
        data: { roles: ['ROLE_USER', 'ROLE_ADMIN'] }
      },
      { 
        path: 'users', 
        component: UsersComponent,
        data: { roles: ['ROLE_ADMIN'] }
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