import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/auth/models/user.model';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .float-anim { animation: float 6s ease-in-out infinite; }
    .float-anim-slow { animation: float 9s ease-in-out infinite; }
    .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
    .fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
    .fade-delay-1 { opacity: 0; animation: fade-in-up 0.6s ease-out 0.1s forwards; }
    .fade-delay-2 { opacity: 0; animation: fade-in-up 0.6s ease-out 0.2s forwards; }
    .fade-delay-3 { opacity: 0; animation: fade-in-up 0.6s ease-out 0.3s forwards; }
    .fade-delay-4 { opacity: 0; animation: fade-in-up 0.6s ease-out 0.4s forwards; }

    .field-input {
      width: 100%;
      padding: 14px 16px 14px 48px;
      background: rgba(248, 250, 252, 0.9);
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 500;
      color: #0f172a;
      outline: none;
      transition: all 0.2s;
      font-family: 'DM Sans', 'Inter', sans-serif;
    }
    .field-input:focus {
      background: #fff;
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
    }
    .field-input.invalid-field {
      border-color: #f87171;
      background: #fff5f5;
    }
    .field-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 20px;
      pointer-events: none;
    }
    .toggle-pw {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      padding: 4px;
      border-radius: 6px;
      transition: color 0.2s;
    }
    .toggle-pw:hover { color: #3b82f6; }

    .btn-primary {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'DM Sans', 'Inter', sans-serif;
      letter-spacing: 0.3px;
      box-shadow: 0 4px 15px rgba(37,99,235,0.4);
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(37,99,235,0.5);
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
    }
    .btn-primary:active:not(:disabled) { transform: translateY(0); }
    .btn-primary:disabled {
      background: linear-gradient(135deg, #93c5fd 0%, #bfdbfe 100%);
      cursor: not-allowed;
      box-shadow: none;
    }
    .error-msg {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #ef4444;
      margin-top: 6px;
      font-weight: 500;
    }
    .field-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
      letter-spacing: 0.3px;
    }
    .feature-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 50px;
      padding: 8px 16px;
      font-size: 13px;
      color: #e2e8f0;
      font-weight: 500;
    }
  `],
  template: `
    <div class="min-h-screen flex font-sans" style="font-family: 'DM Sans', 'Inter', sans-serif;">

      <!-- ============ LEFT PANEL - Branding ============ -->
      <div class="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden"
           style="background: linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);">

        <!-- Background image -->
        <div class="absolute inset-0 opacity-40"
             style="background-image: url('assets/login-bg.png'); background-size: cover; background-position: center;"></div>

        <!-- Floating decorative blobs -->
        <div class="float-anim pulse-glow absolute w-72 h-72 rounded-full -left-20 -top-20 opacity-20"
             style="background: radial-gradient(circle, #3b82f6, transparent);"></div>
        <div class="float-anim-slow pulse-glow absolute w-96 h-96 rounded-full -right-32 bottom-0 opacity-15"
             style="background: radial-gradient(circle, #6366f1, transparent);"></div>

        <div class="relative z-10 flex flex-col h-full p-12">
          <!-- Logo -->
          <div class="flex items-center gap-3 mb-auto">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                 style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
              <span class="text-white font-black text-base italic">CE</span>
            </div>
            <span class="text-white font-bold text-xl tracking-tight">Capital ERP</span>
          </div>

          <!-- Main copy -->
          <div class="mb-auto mt-16">
            <p class="text-blue-300 font-semibold text-sm uppercase tracking-widest mb-4">Plataforma Integrada de Gestão</p>
            <h1 class="text-5xl font-extrabold text-white leading-tight mb-6" style="line-height: 1.1">
              Gestão completa<br/>
              <span style="background: linear-gradient(90deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                do seu negócio
              </span>
            </h1>
            <p class="text-slate-400 text-lg leading-relaxed max-w-xs">
              Controle estoque, vendas, clientes e notas fiscais em um único lugar. Simples e poderoso.
            </p>
          </div>

          <!-- Features -->
          <div class="flex flex-col gap-3 mb-8">
            <div class="feature-chip">
              <span style="font-size: 18px">📦</span> Gestão de Estoque em Tempo Real
            </div>
            <div class="feature-chip">
              <span style="font-size: 18px">🧾</span> Emissão de NF-e, NFS-e e NFC-e
            </div>
            <div class="feature-chip">
              <span style="font-size: 18px">📊</span> Relatórios e Dashboards Inteligentes
            </div>
          </div>

          <!-- Footer -->
          <p class="text-slate-600 text-xs">© {{ currentYear }} Capital ERP · Todos os direitos reservados</p>
        </div>
      </div>

      <!-- ============ RIGHT PANEL - Form ============ -->
      <div class="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50 relative">
        <!-- Subtle background pattern -->
        <div class="absolute inset-0 opacity-30"
             style="background-image: radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0); background-size: 28px 28px;"></div>

        <div class="relative w-full max-w-md">
          <!-- Mobile logo -->
          <div class="flex lg:hidden items-center justify-center gap-3 mb-10 fade-in-up">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl"
                 style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
              <span class="text-white font-black text-lg italic">CE</span>
            </div>
            <span class="text-slate-900 font-black text-2xl tracking-tight">Capital ERP</span>
          </div>

          <!-- Header -->
          <div class="mb-10 fade-in-up">
            <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Bem-vindo de volta 👋</h2>
            <p class="text-slate-500 font-medium">Entre com suas credenciais para continuar</p>
          </div>

          <!-- Error banner -->
          <div *ngIf="errorMessage" class="fade-in-up mb-6 p-4 rounded-xl border flex items-center gap-3"
               style="background:#fef2f2; border-color:#fecaca;">
            <span class="text-2xl">🚫</span>
            <span class="text-red-700 font-semibold text-sm">{{ errorMessage }}</span>
          </div>

          <!-- Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5" autocomplete="on">

            <!-- Empresa ID -->
            <div class="fade-delay-1">
              <label class="field-label">Empresa ID</label>
              <div class="relative">
                <span class="field-icon pi pi-building" style="font-size:18px"></span>
                <input class="field-input" [class.invalid-field]="isInvalid('tenantIdentifier')"
                       formControlName="tenantIdentifier"
                       placeholder="ex: minha-empresa"
                       autocomplete="organization" />
              </div>
              <div *ngIf="isInvalid('tenantIdentifier')" class="error-msg">
                <span class="pi pi-exclamation-circle"></span> ID da empresa é obrigatório
              </div>
            </div>

            <!-- Email -->
            <div class="fade-delay-2">
              <label class="field-label">E-mail corporativo</label>
              <div class="relative">
                <span class="field-icon pi pi-envelope" style="font-size:17px"></span>
                <input class="field-input" [class.invalid-field]="isInvalid('email')"
                       formControlName="email" type="email"
                       placeholder="nome@empresa.com"
                       autocomplete="email" />
              </div>
              <div *ngIf="isInvalid('email')" class="error-msg">
                <span class="pi pi-exclamation-circle"></span>
                <span *ngIf="loginForm.get('email')?.hasError('required')">E-mail é obrigatório</span>
                <span *ngIf="loginForm.get('email')?.hasError('email')">Informe um e-mail válido</span>
              </div>
            </div>

            <!-- Password -->
            <div class="fade-delay-3">
              <label class="field-label">Senha</label>
              <div class="relative">
                <span class="field-icon pi pi-lock" style="font-size:17px"></span>
                <input class="field-input" [class.invalid-field]="isInvalid('password')"
                       formControlName="password"
                       [type]="passwordVisible() ? 'text' : 'password'"
                       placeholder="Mínimo 6 caracteres"
                       autocomplete="current-password" />
                <button type="button" class="toggle-pw" (click)="togglePasswordVisibility()"
                        [attr.aria-label]="passwordVisible() ? 'Ocultar senha' : 'Mostrar senha'">
                  <span class="pi" [class]="passwordVisible() ? 'pi-eye-slash' : 'pi-eye'" style="font-size:18px"></span>
                </button>
              </div>
              <div *ngIf="isInvalid('password')" class="error-msg">
                <span class="pi pi-exclamation-circle"></span>
                <span *ngIf="loginForm.get('password')?.hasError('required')">Senha é obrigatória</span>
                <span *ngIf="loginForm.get('password')?.hasError('minlength')">Mínimo de 6 caracteres</span>
              </div>
            </div>

            <!-- Remember & Forgot -->
            <div class="fade-delay-3 flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer group">
                <div class="relative">
                  <input type="checkbox" class="sr-only peer" formControlName="rememberMe" />
                  <div class="w-10 h-5 rounded-full transition-colors peer-checked:bg-blue-600 bg-slate-200"></div>
                  <div class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span class="text-sm font-medium text-slate-500">Lembrar-me</span>
              </label>
              <a href="#" class="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            <!-- Submit -->
            <div class="fade-delay-4 pt-2">
              <button type="submit" class="btn-primary" [disabled]="loginForm.invalid || loading">
                <span *ngIf="!loading" class="flex items-center justify-center gap-2">
                  <span class="pi pi-sign-in"></span>
                  Entrar na plataforma
                </span>
                <span *ngIf="loading" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Autenticando...
                </span>
              </button>
            </div>
          </form>

          <!-- Divider / Footer -->
          <div class="mt-10 pt-8 border-t border-slate-200 text-center fade-delay-4">
            <p class="text-xs text-slate-400 font-medium">
              © {{ currentYear }} Capital ERP · Todos os direitos reservados
            </p>
            <div class="flex items-center justify-center gap-4 mt-3">
              <span class="flex items-center gap-1.5 text-xs text-slate-400">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Sistemas operacionais
              </span>
              <span class="text-slate-200">|</span>
              <span class="text-xs text-slate-400 font-medium">v2.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);

  loginForm: FormGroup;
  loading = false;
  returnUrl = '';
  errorMessage = '';
  readonly passwordVisible = signal(false);
  currentYear = new Date().getFullYear();

  constructor() {
    this.loginForm = this.formBuilder.group({
      tenantIdentifier: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }

  isInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.loadingService.show();

    const credentials: LoginRequest = {
      tenantIdentifier: this.loginForm.value.tenantIdentifier,
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials)
      .pipe(finalize(() => {
        this.loading = false;
        this.loadingService.hide();
      }))
      .subscribe({
        next: () => {
          this.notification.success('Login realizado com sucesso!');
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          if (error.status === 401) {
            this.errorMessage = 'E-mail, senha ou ID da empresa inválidos.';
          } else if (error.status === 0) {
            this.errorMessage = 'Servidor indisponível. Tente novamente mais tarde.';
          } else {
            this.errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';
          }
        }
      });
  }
}
