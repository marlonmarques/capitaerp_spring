import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    if (this.authService.isAuthenticated()) {
      const requiredRoles = route.data['roles'] as Array<string>;
      
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRole = this.authService.hasAnyRole(requiredRoles);
        
        if (!hasRole) {
          this.notification.error('Você não tem permissão para acessar esta página!');
          this.router.navigate(['/dashboard']);
          return false;
        }
      }
      
      return true;
    }

    this.notification.warning('Por favor, faça login para acessar esta página!');
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}