import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { EmpresaService } from '../../core/services/empresa.service';
import { Empresa } from '../../core/models/empresa.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Configurações da Empresa</h1>
        <button mat-flat-button color="primary" (click)="salvar()" [disabled]="form.invalid || loading()">
          <mat-icon>save</mat-icon>
          Salvar Alterações
        </button>
      </div>

      <mat-card class="p-6">
        <form [formGroup]="form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div class="md:col-span-2 flex flex-col items-center mb-6">
            <h3 class="text-lg font-medium mb-4">Logo da Empresa</h3>
            <div class="relative w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
              <img *ngIf="logoPreview() || form.get('logoUrl')?.value" 
                   [src]="logoPreview() || form.get('logoUrl')?.value" 
                   class="max-w-full max-h-full object-contain" />
              <div *ngIf="!logoPreview() && !form.get('logoUrl')?.value" class="text-gray-400 text-center p-4">
                <mat-icon class="text-4xl h-10 w-10">image</mat-icon>
                <p>Sem Logo</p>
              </div>
            </div>
            <div class="mt-4 w-full max-w-md">
              <mat-form-field class="w-full" appearance="outline">
                <mat-label>URL do Logo</mat-label>
                <input matInput formControlName="logoUrl" placeholder="https://exemplo.com/logo.png" />
                <mat-hint>Insira a URL direta da imagem do logo</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>ID da Empresa (Multi-tenancy)</mat-label>
            <input matInput formControlName="tenantIdentifier" placeholder="ex: minha-empresa" />
            <mat-hint>O identificador único para acesso ao seu ambiente</mat-hint>
            <mat-error *ngIf="form.get('tenantIdentifier')?.hasError('required')">ID da Empresa é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Razão Social</mat-label>
            <input matInput formControlName="razaoSocial" />
            <mat-error *ngIf="form.get('razaoSocial')?.hasError('required')">Razão Social é obrigatória</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nome Fantasia</mat-label>
            <input matInput formControlName="nomeFantasia" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>CNPJ</mat-label>
            <input matInput formControlName="cnpj" placeholder="00.000.000/0000-00" />
            <mat-error *ngIf="form.get('cnpj')?.hasError('required')">CNPJ é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>E-mail de Contato</mat-label>
            <input matInput formControlName="email" type="email" />
            <mat-error *ngIf="form.get('email')?.hasError('email')">E-mail inválido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Telefone</mat-label>
            <input matInput formControlName="telefone" />
          </mat-form-field>

        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f8fafc;
      min-height: 100vh;
    }
  `]
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private empresaService = inject(EmpresaService);
  private snackBar = inject(MatSnackBar);

  form: FormGroup;
  loading = signal(false);
  logoPreview = signal<string | null>(null);

  constructor() {
    this.form = this.fb.group({
      id: [''],
      tenantIdentifier: ['', Validators.required],
      razaoSocial: ['', Validators.required],
      nomeFantasia: [''],
      cnpj: ['', Validators.required],
      telefone: [''],
      email: ['', [Validators.email]],
      logoUrl: ['']
    });
  }

  ngOnInit(): void {
    this.carregarDados();

    // Monitorar mudanças na URL do logo para preview
    this.form.get('logoUrl')?.valueChanges.subscribe(value => {
      this.logoPreview.set(value);
    });
  }

  carregarDados(): void {
    this.loading.set(true);
    this.empresaService.carregarConfiguracao().subscribe({
      next: (config) => {
        if (config) {
          this.form.patchValue(config);
        }
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Erro ao carregar configurações', 'Fechar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  salvar(): void {
    if (this.form.valid) {
      this.loading.set(true);
      const dados: Empresa = this.form.value;

      this.empresaService.salvarConfiguracao(dados).subscribe({
        next: () => {
          this.snackBar.open('Configurações salvas com sucesso!', 'OK', { duration: 3000 });
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Erro ao salvar configurações', 'Fechar', { duration: 3000 });
          this.loading.set(false);
        }
      });
    }
  }
}
