import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../app/core/services/auth.service';
import { LoginRequest } from '../../core/auth/models/user.model';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
[x: string]: any;
  loginForm: FormGroup;
  loading = false;
  returnUrl = '';
  readonly passwordVisible = signal(false);
  currentYear: number;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private loadingService: LoadingService
  ) {
    this.loginForm = this.createForm();
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit(): void {
    // Se já estiver autenticado, redireciona para dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Obtém a URL de retorno dos query parameters
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.loadingService.show();

      const credentials: LoginRequest = this.loginForm.value;

      this.authService.login(credentials)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.loadingService.hide();
          })
        )
        .subscribe({
          next: () => {
            this.notification.success('Login realizado com sucesso!');
            this.router.navigate([this.returnUrl]);
          },
          error: (error) => {
            let errorMessage = 'Erro ao fazer login. Tente novamente.';

            if (error.status === 401) {
              errorMessage = 'Email ou senha inválidos.';
            } else if (error.status === 0) {
              errorMessage = 'Servidor indisponível. Tente novamente mais tarde.';
            }

            this.notification.error(errorMessage);
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
