import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  title = 'Capital ERP';
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.authService.checkSessionStatus();
    });

    // Detectar perda de conexão ou reinício de servidor de forma ativa
    setInterval(() => {
      this.authService.checkSessionStatus();
    }, 2 * 60 * 1000);
  }
}