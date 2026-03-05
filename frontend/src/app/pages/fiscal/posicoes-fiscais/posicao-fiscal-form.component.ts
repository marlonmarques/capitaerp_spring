import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { PosicaoFiscalService, PosicaoFiscal } from '../../../core/services/posicao-fiscal.service';
import { MensagemFiscalService, MensagemFiscal } from '../../../core/services/mensagem-fiscal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { FiscalDataService, BuscaFiscalResultDTO } from '../../../core/services/fiscal-data.service';
import { finalize, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
    selector: 'app-posicao-fiscal-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatCardModule, MatAutocompleteModule],
    template: `
    <div class="p-6 md:p-8 font-sans bg-slate-50 min-h-screen">
      <header class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
            {{ isEditMode() ? 'Editar Posição Fiscal' : 'Nova Posição Fiscal' }}
          </h1>
          <p class="text-slate-500 font-medium">Configure as regras de tributação e mensagens fiscais.</p>
        </div>
        <button mat-stroked-button color="primary" class="!rounded-xl !h-12 !px-6" (click)="voltar()">
          <mat-icon class="mr-2">arrow_back</mat-icon> Voltar
        </button>
      </header>

      <form [formGroup]="form" (ngSubmit)="salvar()" class="max-w-5xl mx-auto flex flex-col gap-6">

        <!-- Identificação -->
        <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-2">
            <mat-icon class="text-indigo-500 text-[18px]">label</mat-icon>
            <h2 class="text-base font-bold text-slate-800">Identificação</h2>
          </div>
          <div class="p-6 bg-white">
            <label class="field-label">Nome da Posição Fiscal *</label>
            <input type="text" formControlName="nome"
              class="field-input"
              placeholder="Ex: Venda de Produto para Consumidor Final - MG">
            <div *ngIf="form.get('nome')?.invalid && form.get('nome')?.touched" class="field-error">Campo obrigatório</div>
          </div>
        </mat-card>

        <!-- Tipo e Finalidade -->
        <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-2">
            <mat-icon class="text-orange-500">tune</mat-icon>
            <h2 class="text-base font-bold text-slate-800">Configurações da Nota</h2>
          </div>
          <div class="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="field-label">Tipo de Nota (Entrada/Saída) *</label>
              <select formControlName="tipoNota"
                class="field-input">
                <option value="">Selecione...</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>
            <div>
              <label class="field-label">Finalidade da Emissão *</label>
              <select formControlName="finalidade"
                class="field-input">
                <option value="">Selecione...</option>
                <option value="NORMAL">Normal</option>
                <option value="COMPLEMENTAR">Complementar</option>
                <option value="AJUSTE">Ajuste</option>
                <option value="DEVOLUCAO_RETORNO">Devolução de Mercadoria / Retorno</option>
              </select>
            </div>
            <div>
              <label class="field-label">Tipo de Operação</label>
              <select formControlName="tipoOperacao"
                class="field-input">
                <option value="">Não informado</option>
                <option value="0">0 - Não se Aplica (NF-e CT-e)</option>
                <option value="1">1 - Operação Presencial</option>
                <option value="2">2 - Operação Não Presencial (Internet)</option>
                <option value="3">3 - Operação Não Presencial (Teleatendimento)</option>
                <option value="4">4 - NFC-e Entrega em Domicílio</option>
              </select>
            </div>
            <div>
              <label class="field-label">Destino da Operação</label>
              <select formControlName="operacaoDestino"
                class="field-input">
                <option value="">Não informado</option>
                <option value="1">1 - Operação Interna</option>
                <option value="2">2 - Operação Interestadual</option>
                <option value="3">3 - Operação com Exterior</option>
              </select>
            </div>
            <div class="flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-slate-50">
              <input type="checkbox" formControlName="consumidorFinal" id="consumidorFinal"
                class="h-5 w-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer">
              <label for="consumidorFinal" class="text-sm font-semibold text-slate-700 cursor-pointer">
                Operação com Consumidor Final
              </label>
            </div>
            <div>
              <label class="field-label">CFOP Padrão</label>
              <input type="text" [formControl]="cfopSearchCtrl" [matAutocomplete]="autoCfop"
                class="field-input"
                placeholder="Buscar CFOP...">
              <mat-autocomplete #autoCfop="matAutocomplete" [displayWith]="displayFiscal" (optionSelected)="selecionarCfop($event.option.value)">
                <mat-option *ngFor="let c of cfops()" [value]="c">{{ c.label }}</mat-option>
              </mat-autocomplete>
            </div>
          </div>
        </mat-card>

        <!-- Mensagens Fiscais -->
        <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <mat-icon class="text-blue-500 text-[18px]">message</mat-icon>
              <h2 class="text-base font-bold text-slate-800">Mensagens Fiscais Vinculadas</h2>
            </div>
            <span class="text-xs text-slate-400">{{ mensagensSelecionadas().length }} selecionada(s)</span>
          </div>
          <div class="p-6 bg-white">
            <p class="text-sm text-slate-500 mb-4">Selecione os templates de texto que serão incluídos automaticamente nas notas emitidas com esta posição fiscal.</p>
            <div *ngIf="todasMensagens().length === 0" class="text-center py-8 text-slate-400 text-sm">
              Nenhuma mensagem fiscal cadastrada. <a (click)="adicionarMensagem()" class="text-indigo-600 underline cursor-pointer">Criar mensagem</a>
            </div>
            <div *ngFor="let msg of todasMensagens()" class="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all mb-2 cursor-pointer"
              (click)="toggleMensagem(msg)">
              <div class="pt-0.5">
                <div class="h-5 w-5 rounded border-2 flex items-center justify-center transition-all"
                  [ngClass]="isMensagemSelecionada(msg) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'">
                  <mat-icon *ngIf="isMensagemSelecionada(msg)" class="!text-xs !h-3 !w-3 text-white">check</mat-icon>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-slate-800 text-sm">{{ msg.titulo }}</p>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-0.5"
                  [ngClass]="msg.destino === 'FISCO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">
                  {{ msg.destino === 'FISCO' ? 'Fisco' : 'Contribuinte' }}
                </span>
                <p class="text-xs text-slate-400 mt-1 font-mono truncate">{{ msg.textoTemplate }}</p>
              </div>
            </div>
          </div>
        </mat-card>

        <div class="flex justify-end gap-3">
          <button type="button" mat-stroked-button class="!rounded-lg" (click)="voltar()">Cancelar</button>
          <button type="submit" mat-flat-button color="primary" class="!rounded-lg !bg-indigo-600" [disabled]="form.invalid">
            <mat-icon class="mr-1">save</mat-icon> Salvar Posição Fiscal
          </button>
        </div>
      </form>
    </div>
  `
})
export class PosicaoFiscalFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(PosicaoFiscalService);
    private mensagemService = inject(MensagemFiscalService);
    private fiscalDataService = inject(FiscalDataService);
    private notification = inject(NotificationService);
    private loadingService = inject(LoadingService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    isEditMode = signal(false);
    posicaoId: string | null = null;
    todasMensagens = signal<MensagemFiscal[]>([]);
    mensagensSelecionadas = signal<string[]>([]);
    cfops = signal<BuscaFiscalResultDTO[]>([]);

    cfopSearchCtrl = new FormControl<string | BuscaFiscalResultDTO | null>('');

    form: FormGroup = this.fb.group({
        nome: ['', Validators.required],
        tipoNota: ['', Validators.required],
        finalidade: ['', Validators.required],
        consumidorFinal: [false, Validators.required],
        tipoOperacao: [''],
        operacaoDestino: [''],
        cfopPadraoCodigo: [''],
        mensagensIds: [[]]
    });

    ngOnInit() {
        this.mensagemService.findAll().subscribe(msgs => this.todasMensagens.set(msgs));

        this.cfopSearchCtrl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(value => typeof value === 'string' ? this.fiscalDataService.searchCfops(value) : [])
        ).subscribe(data => this.cfops.set(data));

        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.isEditMode.set(true);
                this.posicaoId = id;
                this.loadingService.show();
                this.service.findById(id).pipe(finalize(() => this.loadingService.hide())).subscribe({
                    next: data => {
                        this.form.patchValue(data);
                        if (data.mensagensIds) {
                            this.mensagensSelecionadas.set(data.mensagensIds);
                        }
                        if (data.cfopPadraoCodigo) {
                            this.fiscalDataService.searchCfops(data.cfopPadraoCodigo).subscribe(res => {
                                const found = res.find(c => c.id === data.cfopPadraoCodigo);
                                if (found) this.cfopSearchCtrl.setValue(found, { emitEvent: false });
                            });
                        }
                    },
                    error: () => { this.notification.error('Erro ao carregar posição fiscal'); this.voltar(); }
                });
            }
        });
    }

    displayFiscal(item: BuscaFiscalResultDTO | null | undefined): string {
        return item ? item.label : '';
    }

    selecionarCfop(item: BuscaFiscalResultDTO) {
        this.form.patchValue({ cfopPadraoCodigo: item.id });
    }

    isMensagemSelecionada(msg: MensagemFiscal): boolean {
        return this.mensagensSelecionadas().includes(msg.id!);
    }

    toggleMensagem(msg: MensagemFiscal) {
        const atualList = [...this.mensagensSelecionadas()];
        const idx = atualList.indexOf(msg.id!);
        if (idx > -1) {
            atualList.splice(idx, 1);
        } else {
            atualList.push(msg.id!);
        }
        this.mensagensSelecionadas.set(atualList);
    }

    adicionarMensagem() {
        this.router.navigate(['/fiscal/mensagens-fiscais/new']);
    }

    salvar() {
        if (this.form.invalid) return;
        this.loadingService.show();
        const data: PosicaoFiscal = {
            ...this.form.value,
            mensagensIds: this.mensagensSelecionadas()
        };

        const req$ = this.isEditMode() && this.posicaoId
            ? this.service.update(this.posicaoId, data)
            : this.service.insert(data);

        req$.pipe(finalize(() => this.loadingService.hide())).subscribe({
            next: () => {
                this.notification.success(`Posição fiscal ${this.isEditMode() ? 'atualizada' : 'cadastrada'} com sucesso!`);
                this.voltar();
            },
            error: () => this.notification.error(`Erro ao ${this.isEditMode() ? 'atualizar' : 'cadastrar'} posição fiscal`)
        });
    }

    voltar() {
        this.router.navigate(['/fiscal/posicoes-fiscais']);
    }
}
