import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { InputMaskModule } from 'primeng/inputmask';

import { ContaBancariaService, ContaBancaria, BANCOS_DISPONIVEIS } from '../../../core/services/financeiro/conta-bancaria.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-conta-bancaria-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule,
        MatButtonModule, MatTooltipModule, MatProgressSpinnerModule, InputMaskModule
    ],
    template: `
    <div class="min-h-screen bg-slate-50 p-4 md:p-6">
      <header class="flex items-center justify-between mb-6 pb-5 border-b border-slate-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <mat-icon class="text-orange-600 !text-xl">account_balance</mat-icon>
          </div>
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
              {{ isEditMode() ? 'Editar Conta' : 'Nova Conta Bancária' }}
            </h1>
            <p class="text-slate-500 text-sm">Configure os dados de acesso, integração e boletos</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" mat-icon-button (click)="togglePadrao()"
                  [matTooltip]="form.get('padrao')?.value ? 'Conta Principal (Padrão para recebimentos)' : 'Definir como principal'">
            <mat-icon [class]="form.get('padrao')?.value ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'">
              {{ form.get('padrao')?.value ? 'star' : 'star_border' }}
            </mat-icon>
          </button>
          <button mat-stroked-button color="primary" class="!rounded-xl !h-10" (click)="voltar()">
            <mat-icon class="mr-1">arrow_back</mat-icon> Voltar
          </button>
        </div>
      </header>

      <form [formGroup]="form" (ngSubmit)="salvar()" class="max-w-5xl mx-auto space-y-5">
        
        <!-- 1. Dados Básicos -->
        <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-2">
              <mat-icon class="text-orange-500 text-[18px]">domain</mat-icon>
              <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Identificação</h2>
            </div>
          </div>
          <div class="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div class="md:col-span-2">
              <label class="field-label">Instituição Financeira / Banco *</label>
              <select formControlName="codigoBanco" class="field-input text-lg font-semibold text-indigo-900 bg-indigo-50/30 border-indigo-100">
                <option value="">— Selecione o Banco ou Gateway —</option>
                <option *ngFor="let b of bancos" [value]="b.value">{{ b.label }}</option>
              </select>
              <div *ngIf="f['codigoBanco']?.invalid && f['codigoBanco']?.touched" class="field-error">Selecione uma instituição</div>
            </div>

            <div class="mb-2.5">
              <label class="field-label">Apelido da Conta *</label>
              <input type="text" formControlName="nome" class="field-input" placeholder="Ex: Conta Principal Asaas, Caixinha da Loja...">
              <div *ngIf="f['nome']?.invalid && f['nome']?.touched" class="field-error">Nome/Apelido é obrigatório</div>
            </div>

            <div class="mb-2.5">
              <label class="field-label">Saldo Inicial (R$)</label>
              <input type="number" formControlName="saldoInicial" step="0.01" class="field-input" placeholder="0.00">
            </div>

          </div>
        </mat-card>

        <!-- 2. Dados Bancários Tradicionais (Esconde se for Gateway) -->
        <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden transition-all duration-300"
                  *ngIf="!isGatewayApi()">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-2">
              <mat-icon class="text-indigo-500 text-[18px]">account_balance_wallet</mat-icon>
              <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Dados da Conta</h2>
            </div>
            <span class="bg-indigo-100 text-indigo-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Banco Tradicional</span>
          </div>
          <div class="p-6 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="mb-2.5">
              <label class="field-label">Agência</label>
              <input type="text" formControlName="agencia" class="field-input" placeholder="0000-0">
            </div>
            <div class="mb-2.5 lg:col-span-2">
              <label class="field-label">Número da Conta</label>
              <input type="text" formControlName="numeroConta" class="field-input" placeholder="0000000-0">
            </div>
            <div class="mb-2.5">
              <label class="field-label">Telefone Gerente</label>
              <p-inputMask formControlName="telefone" mask="(99) 99999-9999" unmask="true" styleClass="field-input"></p-inputMask>
            </div>
          </div>
        </mat-card>

        <!-- 3. Integração e Configurações de API -->
        <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden border border-emerald-100" *ngIf="isGatewayApi() || form.get('viaApi')?.value">
          <div class="px-6 py-4 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/50">
            <div class="flex items-center gap-2">
              <mat-icon class="text-emerald-500 text-[18px]">api</mat-icon>
              <h2 class="text-sm font-bold text-emerald-800 uppercase tracking-wider">Integração Digital</h2>
            </div>
            <span class="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> API Ativa
            </span>
          </div>
          <div class="p-6 bg-white">
            <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4 flex gap-3 text-emerald-800 text-sm">
              <mat-icon class="mt-0.5">lock</mat-icon>
              <p>Insira a chave de integração (Token API) fornecida pelo painel da sua instituição. Esta chave permitirá a emissão automática de boletos, Pix e conciliação.</p>
            </div>
            
            <div class="mb-2.5">
              <label class="field-label">Chave de Acesso / API Token *</label>
              <input type="password" formControlName="tokenApi" class="field-input font-mono tracking-widest text-emerald-900 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx">
            </div>
          </div>
        </mat-card>

        <!-- 4. Emissão de Boletos Tradicionais (Manual/CNAB) -->
        <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden" *ngIf="!isGatewayApi()">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-2">
              <mat-icon class="text-blue-500 text-[18px]">receipt_long</mat-icon>
              <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Configuração de Boleto Bancário</h2>
            </div>
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" formControlName="viaApi" class="sr-only peer">
              <div class="relative w-10 h-5">
                <div class="w-10 h-5 bg-slate-300 rounded-full peer-checked:bg-emerald-500 transition-colors"></div>
                <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Via API WS</span>
            </label>
          </div>
          
          <div class="p-6 bg-white grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="mb-2.5">
              <label class="field-label">Convênio</label>
              <input type="text" formControlName="convenio" class="field-input" placeholder="Número do Convênio">
            </div>
            <div class="mb-2.5">
              <label class="field-label">Carteira</label>
              <input type="text" formControlName="carteira" class="field-input" placeholder="Ex: 17">
            </div>
            <div class="mb-2.5">
              <label class="field-label">Contrato</label>
              <input type="text" formControlName="contrato" class="field-input" placeholder="Número do Contrato">
            </div>

            <div class="md:col-span-3 border-t border-slate-100 pt-4 mt-2">
              <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Instruções Impressas no Boleto</h3>
              <div class="space-y-3">
                <input type="text" formControlName="instrucoesBoleto1" class="field-input text-sm text-slate-600" placeholder="Linha 1 (Ex: Pagável em qualquer banco até o vencimento)">
                <input type="text" formControlName="instrucoesBoleto2" class="field-input text-sm text-slate-600" placeholder="Linha 2 (Ex: Após vencimento cobrar juros de X%)">
                <input type="text" formControlName="instrucoesBoleto3" class="field-input text-sm text-slate-600" placeholder="Linha 3 (Ex: Protestar em 5 dias úteis)">
              </div>
            </div>

            <div class="md:col-span-3 mt-2 flex gap-4">
              <div class="flex-1">
                <label class="field-label">Mora Diária (%)</label>
                <input type="number" formControlName="taxaMora" step="0.01" class="field-input" placeholder="0.00">
              </div>
              <div class="flex-1">
                <label class="field-label">Multa Atraso (%)</label>
                <input type="number" formControlName="taxaMulta" step="0.01" class="field-input" placeholder="2.00">
              </div>
            </div>
          </div>
        </mat-card>

        <div class="flex justify-end gap-3 pb-6">
          <button type="button" mat-stroked-button class="!rounded-xl !h-10 !px-5" (click)="voltar()">Cancelar</button>
          <button type="submit" mat-flat-button color="primary"
                  class="!rounded-xl !h-10 !px-7 !bg-orange-600 hover:!bg-orange-700 font-bold shadow-md"
                  [disabled]="form.invalid || salvando()">
            <mat-spinner *ngIf="salvando()" diameter="18" class="mr-2"></mat-spinner>
            <mat-icon *ngIf="!salvando()" class="mr-1">save</mat-icon>
            {{ isEditMode() ? 'Salvar Alterações' : 'Contratar/Ativar Conta' }}
          </button>
        </div>

      </form>
    </div>
  `
})
export class ContaBancariaFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(ContaBancariaService);
    private notification = inject(NotificationService);
    private loadingService = inject(LoadingService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    bancos = BANCOS_DISPONIVEIS;

    form: FormGroup;
    isEditMode = signal(false);
    salvando = signal(false);
    contaId: string | null = null;

    isGatewayApi = computed(() => {
        const cod = this.form?.get('codigoBanco')?.value;
        return cod === 'ASAAS' || cod === 'PAGHIPER';
    });

    constructor() {
        this.form = this.fb.group({
            nome: ['', [Validators.required]],
            codigoBanco: ['', [Validators.required]],
            agencia: [''],
            numeroConta: [''],
            carteira: [''],
            convenio: [''],
            contrato: [''],
            tipoCarteira: [''],
            instrucoesBoleto1: [''],
            instrucoesBoleto2: [''],
            instrucoesBoleto3: [''],
            taxaMora: [null],
            taxaMulta: [null],
            saldoInicial: [0.00],
            viaApi: [false],
            tokenApi: [''],
            telefone: [''],
            padrao: [false],
            ativo: [true]
        });
    }

    get f() { return this.form.controls; }

    ngOnInit(): void {
        // Escuta mudanças de banco para limpar campos desnecessários
        this.form.get('codigoBanco')?.valueChanges.subscribe(val => {
            if (val === 'ASAAS' || val === 'PAGHIPER') {
                this.form.patchValue({
                    viaApi: true,
                    agencia: '', numeroConta: '', carteira: '', convenio: '', contrato: ''
                });
                this.form.get('tokenApi')?.setValidators([Validators.required]);
            } else {
                this.form.get('tokenApi')?.clearValidators();
            }
            this.form.get('tokenApi')?.updateValueAndValidity();
        });

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.contaId = id;
            this.carregar(id);
        }
    }

    carregar(id: string): void {
        this.loadingService.show();
        this.service.findById(id).pipe(
            finalize(() => this.loadingService.hide())
        ).subscribe({
            next: (data) => this.form.patchValue(data),
            error: () => {
                this.notification.error('Conta Bancária não encontrada.');
                this.voltar();
            }
        });
    }

    togglePadrao(): void {
        const atual = this.form.get('padrao')?.value;
        this.form.get('padrao')?.setValue(!atual);
    }

    salvar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.notification.warning('Preencha os campos obrigatórios corretamente.');
            return;
        }

        this.salvando.set(true);
        const dados = this.form.value;

        const req$ = this.isEditMode() && this.contaId
            ? this.service.update(this.contaId, dados)
            : this.service.insert(dados);

        req$.pipe(
            finalize(() => this.salvando.set(false))
        ).subscribe({
            next: () => {
                this.notification.success(`Conta ${this.isEditMode() ? 'atualizada' : 'cadastrada'} com sucesso!`);
                this.voltar();
            },
            error: () => this.notification.error('Ocorreu um erro ao processar a conta.')
        });
    }

    voltar(): void {
        this.router.navigate(['/financeiro/contas-bancarias']);
    }
}
