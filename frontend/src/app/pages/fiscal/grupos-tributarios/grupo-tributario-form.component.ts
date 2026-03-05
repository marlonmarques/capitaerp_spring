import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
    GrupoTributarioService, GrupoTributario,
    REGIMES_TRIBUTARIOS, TIPOS_IMPOSTO,
    CST_CSOSN_SIMPLES, CST_ICMS_NORMAL, TipoImposto
} from '../../../core/services/grupo-tributario.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-grupo-tributario-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatCardModule],
    template: `
    <div class="p-6 md:p-8 font-sans bg-slate-50 min-h-screen">
      <header class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ isEditMode() ? 'Editar Grupo Tributário' : 'Novo Grupo Tributário' }}
          </h1>
          <p class="text-slate-500 font-medium mt-1">Configure as regras fiscais que serão aplicadas aos produtos/serviços.</p>
        </div>
        <button mat-stroked-button color="primary" class="!rounded-xl !h-12 !px-6" (click)="voltar()">
          <mat-icon class="mr-2">arrow_back</mat-icon> Voltar
        </button>
      </header>

      <form [formGroup]="form" (ngSubmit)="salvar()" class="max-w-5xl mx-auto flex flex-col gap-5">

        <!-- Identificação -->
        <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-2">
            <mat-icon class="text-indigo-500 text-[18px]">label</mat-icon>
            <h2 class="text-base font-bold text-slate-800">Identificação</h2>
          </div>
          <div class="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="md:col-span-2">
              <label class="label">Nome do Grupo *</label>
              <input type="text" formControlName="nome" class="inp" placeholder="Ex: ICMS Saída Interno 18%">
              <div *ngIf="form.get('nome')?.invalid && form.get('nome')?.touched" class="err">Nome é obrigatório</div>
            </div>
            <div>
              <label class="label">Regime Tributário *</label>
              <select formControlName="regime" class="inp">
                <option value="">Selecione...</option>
                <option *ngFor="let r of regimes" [value]="r.valor">{{ r.label }}</option>
              </select>
            </div>
            <div>
              <label class="label">Tipo de Imposto *</label>
              <select formControlName="tipoImposto" class="inp">
                <option value="">Selecione...</option>
                <option *ngFor="let t of tipos" [value]="t.valor">{{ t.label }}</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="label">Descrição</label>
              <textarea formControlName="descricao" class="inp" rows="2" placeholder="Descrição detalhada das regras..."></textarea>
            </div>
          </div>
        </mat-card>

        <!-- ICMS (mostrado para ICMS, ICMS_ST, SIMPLES, COMPOSTO) -->
        <mat-card *ngIf="mostrar(['ICMS','ICMS_ST','SIMPLES','COMPOSTO'])"
          class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-2">
            <mat-icon class="text-orange-500">account_balance</mat-icon>
            <h2 class="text-base font-bold text-slate-800">ICMS</h2>
          </div>
          <div class="p-6 bg-white grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label class="label">CST / CSOSN *</label>
              <select formControlName="cstCsosn" class="inp">
                <option value="">Selecione...</option>
                <optgroup *ngIf="isSimplesNacional()" label="CSOSN — Simples Nacional">
                  <option *ngFor="let c of cstSimplesOpts" [value]="c.valor">{{ c.label }}</option>
                </optgroup>
                <optgroup *ngIf="!isSimplesNacional()" label="CST — Regime Normal">
                  <option *ngFor="let c of cstNormalOpts" [value]="c.valor">{{ c.label }}</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label class="label">Alíquota ICMS (%)</label>
              <input type="number" formControlName="aliquotaIcms" class="inp" step="0.01" placeholder="0.00">
            </div>
            <div>
              <label class="label">Redução B.C. ICMS (%)</label>
              <input type="number" formControlName="reducaoBaseIcms" class="inp" step="0.01" placeholder="0.00">
            </div>
            <div>
              <label class="label">DIFAL (%)</label>
              <input type="number" formControlName="aliquotaDifal" class="inp" step="0.01" placeholder="0.00">
            </div>
          </div>
        </mat-card>

        <!-- ICMS ST -->
        <mat-card *ngIf="mostrar(['ICMS_ST','COMPOSTO'])"
          class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-2">
            <mat-icon class="text-amber-500">swap_horiz</mat-icon>
            <h2 class="text-base font-bold text-slate-800">ICMS Substituição Tributária</h2>
          </div>
          <div class="p-6 bg-white grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label class="label">Alíquota ST (%)</label>
              <input type="number" formControlName="aliquotaSt" class="inp" step="0.01" placeholder="0.00">
            </div>
            <div>
              <label class="label">MVA — Margem de Valor Agregado (%)</label>
              <input type="number" formControlName="mva" class="inp" step="0.01" placeholder="0.00">
            </div>
            <div>
              <label class="label">Redução B.C. ST (%)</label>
              <input type="number" formControlName="reducaoBaseSt" class="inp" step="0.01" placeholder="0.00">
            </div>
          </div>
        </mat-card>

        <!-- IPI -->
        <mat-card *ngIf="mostrar(['IPI','COMPOSTO'])"
          class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-2">
            <mat-icon class="text-yellow-500">factory</mat-icon>
            <h2 class="text-base font-bold text-slate-800">IPI — Imposto sobre Produtos Industrializados</h2>
          </div>
          <div class="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="label">CST IPI</label>
              <select formControlName="cstIpi" class="inp">
                <option value="">Selecione...</option>
                <option value="00">00 — Entrada com recuperação de crédito</option>
                <option value="49">49 — Outras entradas</option>
                <option value="50">50 — Saída tributada</option>
                <option value="53">53 — Saída não tributada</option>
                <option value="55">55 — Saída com suspensão</option>
                <option value="99">99 — Outras saídas</option>
              </select>
            </div>
            <div>
              <label class="label">Alíquota IPI (%)</label>
              <input type="number" formControlName="aliquotaIpi" class="inp" step="0.01" placeholder="0.00">
            </div>
          </div>
        </mat-card>

        <!-- PIS / COFINS -->
        <mat-card *ngIf="mostrar(['ICMS','ICMS_ST','IPI','PIS_COFINS','COMPOSTO','ISENTO'])"
          class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-2">
            <mat-icon class="text-cyan-500">percent</mat-icon>
            <h2 class="text-base font-bold text-slate-800">PIS / COFINS</h2>
          </div>
          <div class="p-6 bg-white grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <label class="label">CST PIS</label>
              <select formControlName="cstPis" class="inp">
                <option value="">--</option>
                <option value="01">01 — Tributável (cumulativo)</option>
                <option value="02">02 — Tributável (não cumulativo)</option>
                <option value="06">06 — Alíquota zero</option>
                <option value="07">07 — Isenta</option>
                <option value="49">49 — Outras operações de saída</option>
                <option value="50">50 — Operações de entrada</option>
              </select>
            </div>
            <div>
              <label class="label">Alíquota PIS (%)</label>
              <input type="number" formControlName="aliquotaPis" class="inp" step="0.0001" placeholder="0.00">
            </div>
            <div>
              <label class="label">CST COFINS</label>
              <select formControlName="cstCofins" class="inp">
                <option value="">--</option>
                <option value="01">01 — Tributável (cumulativo)</option>
                <option value="02">02 — Tributável (não cumulativo)</option>
                <option value="06">06 — Alíquota zero</option>
                <option value="07">07 — Isenta</option>
                <option value="49">49 — Outras operações de saída</option>
                <option value="50">50 — Operações de entrada</option>
              </select>
            </div>
            <div>
              <label class="label">Alíquota COFINS (%)</label>
              <input type="number" formControlName="aliquotaCofins" class="inp" step="0.0001" placeholder="0.00">
            </div>
          </div>
        </mat-card>

        <!-- ISS -->
        <mat-card *ngIf="mostrar(['ISS','SIMPLES','COMPOSTO'])"
          class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-2">
            <mat-icon class="text-teal-500">handshake</mat-icon>
            <h2 class="text-base font-bold text-slate-800">ISS — Imposto Sobre Serviços</h2>
          </div>
          <div class="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="label">Alíquota ISS (%)</label>
              <input type="number" formControlName="aliquotaIss" class="inp" step="0.01" placeholder="0.00">
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 self-end">
              <input type="checkbox" formControlName="reterIss" id="reterIss" class="h-5 w-5 rounded text-indigo-600">
              <label for="reterIss" class="text-sm font-semibold text-slate-700 cursor-pointer">Reter ISS na fonte</label>
            </div>
          </div>
        </mat-card>

        <!-- CFOP -->
        <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-2">
            <mat-icon class="text-slate-500">swap_horiz</mat-icon>
            <h2 class="text-base font-bold text-slate-800">CFOP Padrão</h2>
          </div>
          <div class="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="label">CFOP Saída</label>
              <input type="text" formControlName="cfopSaida" class="inp" placeholder="Ex: 5102" maxlength="6">
            </div>
            <div>
              <label class="label">CFOP Entrada</label>
              <input type="text" formControlName="cfopEntrada" class="inp" placeholder="Ex: 1102" maxlength="6">
            </div>
          </div>
        </mat-card>

        <!-- Reforma Tributária -->
        <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden border-l-4 border-l-purple-500">
          <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <mat-icon class="text-purple-500 text-[18px]">auto_awesome</mat-icon>
              <h2 class="text-base font-bold text-slate-800">Reforma Tributária (EC 132/2023)</h2>
            </div>
            <span class="text-xs bg-purple-100 text-purple-600 font-semibold px-3 py-1 rounded-full">Vigência: 2026–2033</span>
          </div>
          <div class="p-6 bg-white">
            <p class="text-xs text-slate-500 mb-4">
              Campos para IBS (substitui ICMS+ISS) e CBS (substitui PIS+COFINS). O sistema irá usar esses valores
              automaticamente durante o período de transição conforme o calendário da Reforma Tributária.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label class="label text-purple-700">Alíquota IBS (%)</label>
                <input type="number" formControlName="aliquotaIbs" class="inp !border-purple-200 focus:!border-purple-500" step="0.0001" placeholder="0.00">
                <p class="text-xs text-slate-400 mt-1">Imposto sobre Bens e Serviços (estadual + municipal)</p>
              </div>
              <div>
                <label class="label text-purple-700">Alíquota CBS (%)</label>
                <input type="number" formControlName="aliquotaCbs" class="inp !border-purple-200 focus:!border-purple-500" step="0.0001" placeholder="0.00">
                <p class="text-xs text-slate-400 mt-1">Contribuição sobre Bens e Serviços (federal)</p>
              </div>
              <div>
                <label class="label">Alíquota IS (%)</label>
                <input type="number" formControlName="aliquotaIs" class="inp" step="0.0001" placeholder="0.00">
                <p class="text-xs text-slate-400 mt-1">Imposto Seletivo (cigarros, álcool, etc.)</p>
              </div>
              <div>
                <label class="label">Código IS</label>
                <input type="text" formControlName="codigoIs" class="inp" placeholder="Código do bem/serviço IS">
              </div>
              <div class="md:col-span-2">
                <label class="label">Regime Especial na Reforma</label>
                <input type="text" formControlName="regimeEspecialReforma" class="inp" placeholder="Ex: monofásico, diferenciado, cesta básica...">
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Ativo -->
        <div class="flex items-center gap-3 px-1">
          <input type="checkbox" formControlName="ativo" id="ativo" class="h-5 w-5 rounded text-indigo-600">
          <label for="ativo" class="text-sm font-semibold text-slate-700 cursor-pointer">Grupo ativo</label>
        </div>

        <!-- Botões -->
        <div class="flex justify-end gap-3">
          <button type="button" mat-stroked-button class="!rounded-lg" (click)="voltar()">Cancelar</button>
          <button type="submit" mat-flat-button color="primary" class="!rounded-lg !bg-indigo-600"
            [disabled]="form.invalid">
            <mat-icon class="mr-1">save</mat-icon> Salvar Grupo
          </button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .label { @apply block text-sm font-semibold text-slate-700 mb-1.5; }
    .inp   { @apply w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-sm; }
    .err   { @apply text-red-500 text-xs mt-1 font-medium; }
  `]
})
export class GrupoTributarioFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(GrupoTributarioService);
    private notification = inject(NotificationService);
    private loadingService = inject(LoadingService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    isEditMode = signal(false);
    grupoId: string | null = null;

    regimes = REGIMES_TRIBUTARIOS;
    tipos = TIPOS_IMPOSTO;
    cstSimplesOpts = CST_CSOSN_SIMPLES;
    cstNormalOpts = CST_ICMS_NORMAL;

    form: FormGroup = this.fb.group({
        nome: ['', Validators.required],
        descricao: [''],
        regime: ['', Validators.required],
        tipoImposto: ['', Validators.required],
        ativo: [true],
        // ICMS
        cstCsosn: [''], aliquotaIcms: [null], reducaoBaseIcms: [null], aliquotaDifal: [null],
        // ST
        aliquotaSt: [null], mva: [null], reducaoBaseSt: [null],
        // IPI
        cstIpi: [''], aliquotaIpi: [null],
        // PIS/COFINS
        cstPis: [''], aliquotaPis: [null], cstCofins: [''], aliquotaCofins: [null],
        // ISS
        aliquotaIss: [null], reterIss: [false],
        // CFOP
        cfopSaida: [''], cfopEntrada: [''],
        // Reforma Tributária
        aliquotaIbs: [null], aliquotaCbs: [null], aliquotaIs: [null],
        codigoIs: [''], regimeEspecialReforma: ['']
    });

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.isEditMode.set(true);
                this.grupoId = id;
                this.loadingService.show();
                this.service.findById(id).pipe(finalize(() => this.loadingService.hide())).subscribe({
                    next: data => this.form.patchValue(data),
                    error: () => { this.notification.error('Erro ao carregar grupo'); this.voltar(); }
                });
            }
        });
    }

    tipoAtual(): TipoImposto | '' {
        return this.form.get('tipoImposto')?.value ?? '';
    }

    mostrar(tipos: TipoImposto[]): boolean {
        return tipos.includes(this.tipoAtual() as TipoImposto);
    }

    isSimplesNacional(): boolean {
        return this.form.get('regime')?.value === 'SIMPLES_NACIONAL';
    }

    salvar() {
        if (this.form.invalid) return;
        this.loadingService.show();
        const payload: GrupoTributario = this.form.value;
        const req$ = this.isEditMode() && this.grupoId
            ? this.service.update(this.grupoId, payload)
            : this.service.insert(payload);

        req$.pipe(finalize(() => this.loadingService.hide())).subscribe({
            next: () => {
                this.notification.success(`Grupo ${this.isEditMode() ? 'atualizado' : 'criado'} com sucesso!`);
                this.voltar();
            },
            error: () => this.notification.error('Erro ao salvar grupo tributário')
        });
    }

    voltar() { this.router.navigate(['/fiscal/grupos-tributarios']); }
}
