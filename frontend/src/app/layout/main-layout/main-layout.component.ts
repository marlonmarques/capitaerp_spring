import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/auth/models/user.model';

interface MenuItem {
  label: string;
  icon: string;
  link?: string;
  roles?: string[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  isCollapsed = false;
  loading = false;
  breadcrumbItems: Array<{ label: string; link?: string }> = [];
  currentUser: User | null = null;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      link: '/dashboard',
      roles: ['ROLE_USER', 'ROLE_ADMIN']
    },
    {
      label: 'Produtos',
      icon: 'shopping',
      link: '/products',
      roles: ['ROLE_USER', 'ROLE_ADMIN']
    },
    {
      label: 'Categorias',
      icon: 'folder',
      link: '/categories',
      roles: ['ROLE_USER', 'ROLE_ADMIN']
    },
    {
      label: 'Usuários',
      icon: 'user',
      link: '/users',
      roles: ['ROLE_ADMIN']
    }
  ];

  constructor(public router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.setupBreadcrumb();
    this.setupUser();
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
    });
  }

  private updateBreadcrumb(): void {
    const url = this.router.url;
    
    if (url.includes('/dashboard')) {
      this.breadcrumbItems = [{ label: 'Dashboard' }];
    } else if (url.includes('/products')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Produtos' }
      ];
    } else if (url.includes('/categories')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Categorias' }
      ];
    } else if (url.includes('/users')) {
      this.breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Usuários' }
      ];
    }
  }

  get filteredMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => {
      if (!item.roles) return true;
      return this.authService.hasAnyRole(item.roles);
    });
  }

  logout(): void {
    this.authService.logout();
  }

}