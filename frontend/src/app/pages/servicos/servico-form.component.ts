import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { ServicoService, Servico } from '../../core/services/servico.service';
import { FiscalDataService, BuscaFiscalResultDTO } from '../../core/services/fiscal-data.service';
import { finalize, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-servico-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    InputNumberModule
  ],
  template: `
    <div class="p-6 md:p-8 font-sans bg-slate-50 min-h-screen">
      <header class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
            {{ isEditMode() ? 'Editar Serviço' : 'Criar Serviço' }}
          </h1>
          <p class="text-slate-500 font-medium">
            Gerencie os dados, precificação e tributação do serviço.
          </p>
        </div>
        <button mat-stroked-button color="primary" class="!rounded-xl !h-12 !px-6" (click)="voltar()">
          <mat-icon class="mr-2">arrow_back</mat-icon> Voltar
        </button>
      </header>

      <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden mb-8 max-w-5xl mx-auto">
        
        <form [formGroup]="servicoForm" (ngSubmit)="salvar()">
          
          <!-- Seção de Informações Básicas -->
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 class="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
              <mat-icon class="text-indigo-500 text-[18px]">info</mat-icon>
              Informações do Serviço
            </h2>
          </div>
          <div class="p-6 bg-white border-b border-slate-100">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="mb-2.5">
                <label class="field-label">Nome do Serviço *</label>
                <input type="text" formControlName="nome" class="field-input" placeholder="Ex: Manutenção de Computador">
                <div *ngIf="servicoForm.get('nome')?.invalid && servicoForm.get('nome')?.touched" class="field-error">
                  Campo obrigatório
                </div>
              </div>
              <div class="mb-2.5 grid grid-cols-2 gap-4">
                 <div>
                   <label class="field-label">Preço Unitário *</label>
                   <p-inputNumber formControlName="preco" mode="currency" currency="BRL" locale="pt-BR" styleClass="w-full" inputStyleClass="w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all w-full" placeholder="0,00"></p-inputNumber>
                 </div>
                 <div>
                   <label class="field-label">Código Interno</label>
                   <input type="text" formControlName="codigoInterno" class="field-input" placeholder="SKU/Ref">
                 </div>
              </div>
            </div>
            <div class="mb-2.5">
              <label class="field-label">Descrição Curta (Interna)</label>
              <textarea formControlName="descricao" rows="2" class="field-input" placeholder="Detalhes adicionais internos..."></textarea>
            </div>
            <div class="col-span-1 md:col-span-2">
                 <label class="field-label">Status</label>
                 <select formControlName="status" class="field-input">
                   <option value="ATIVO">Ativo</option>
                   <option value="INATIVO">Inativo</option>
                 </select>
            </div>
          </div>

          <!-- Seção Tributação -->
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h2 class="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
              <mat-icon class="text-orange-500">account_balance</mat-icon>
              Tributação (NFS-e e Reforma)
            </h2>
          </div>
          <div class="p-6 bg-slate-50">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2.5">
              <div>
                <label class="field-label">CNAE (Atividade Econômica) *</label>
                <input type="text" [formControl]="cnaeSearchCtrl" [matAutocomplete]="autoCnae" class="field-input" placeholder="Buscar CNAE...">
                <mat-autocomplete #autoCnae="matAutocomplete" [displayWith]="displayFiscal" (optionSelected)="selecionarCnae($event.option.value)">
                  <mat-option *ngFor="let c of cnaes()" [value]="c">{{ c.label }}</mat-option>
                </mat-autocomplete>
              </div>
              <div>
                <label class="field-label">NBS (Código Fiscal Federal) *</label>
                <input type="text" [formControl]="nbsSearchCtrl" [matAutocomplete]="autoNbs" class="field-input" placeholder="Buscar NBS...">
                <mat-autocomplete #autoNbs="matAutocomplete" [displayWith]="displayFiscal" (optionSelected)="selecionarNbs($event.option.value)">
                  <mat-option *ngFor="let n of nbsList()" [value]="n">{{ n.label }}</mat-option>
                </mat-autocomplete>
              </div>
              <div>
                <label class="field-label">Item Lista Serviço (LC 116) *</label>
                <select formControlName="codigoServicoLc116" class="field-input">
                  <option value="">Selecione...</option>
                  <option *ngFor="let lc of lc116List()" [value]="lc.id">{{ lc.label }}</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-4">
                 <div>
                   <label class="field-label">Alíq. IBS (%)</label>
                   <input type="number" formControlName="aliquotaIbsPadrao" step="0.01" class="field-input">
                 </div>
                 <div>
                   <label class="field-label">Alíq. CBS (%)</label>
                   <input type="number" formControlName="aliquotaCbsPadrao" step="0.01" class="field-input">
                 </div>
              </div>
            </div>

            <div class="mb-2.5">
              <label class="field-label">Descrição Completa na Nota (Corpo da NFS-e)</label>
              <textarea formControlName="descricaoNota" rows="4" class="field-input font-mono" placeholder="Este texto aparecerá detalhadamente no corpo da nota de serviço..."></textarea>
            </div>
          </div>
            
          <div class="p-6 bg-white border-t border-slate-100 flex justify-end gap-3">
            <button type="button" mat-stroked-button class="!rounded-lg" (click)="voltar()">Cancelar</button>
            <button type="submit" mat-flat-button color="primary" class="!rounded-lg !bg-indigo-600" [disabled]="servicoForm.invalid">
              <mat-icon class="mr-1">save</mat-icon> Salvar Serviço
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `
})
export class ServicoFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private servicoService = inject(ServicoService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fiscalDataService = inject(FiscalDataService);

  isEditMode = signal(false);
  servicoId: string | null = null;

  cnaes = signal<BuscaFiscalResultDTO[]>([]);
  nbsList = signal<BuscaFiscalResultDTO[]>([]);
  lc116List = signal<BuscaFiscalResultDTO[]>([]);

  cnaeSearchCtrl = new FormControl<string | BuscaFiscalResultDTO | null>('');
  nbsSearchCtrl = new FormControl<string | BuscaFiscalResultDTO | null>('');

  servicoForm: FormGroup = this.formBuilder.group({
    nome: ['', [Validators.required]],
    descricao: [''],
    codigoInterno: [''],
    preco: [0.00, [Validators.required, Validators.min(0)]],
    status: ['ATIVO', [Validators.required]],

    // Tributos
    cnaeCodigo: ['', [Validators.required]],
    nbsCodigo: ['', [Validators.required]],
    codigoServicoLc116: ['', [Validators.required]],
    aliquotaIss: [0],
    aliquotaIbsPadrao: [0],
    aliquotaCbsPadrao: [0],

    // Nota
    descricaoNota: ['']
  });

  ngOnInit() {
    this.carregarCombos();

    // Configurando observáveis de busca
    this.cnaeSearchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string') {
          return this.fiscalDataService.searchCnaes(value);
        }
        return [];
      })
    ).subscribe(data => this.cnaes.set(data));

    this.nbsSearchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string') {
          const cnaeSelecionado = this.servicoForm.get('cnaeCodigo')?.value;
          if (!cnaeSelecionado) {
            return this.fiscalDataService.searchNbs(value);
          } else {
            // Se tiver CNAE, deixamos a lista estática recarregada previamente
            return [];
          }
        }
        return [];
      })
    ).subscribe(data => {
      if (data.length > 0) {
        this.nbsList.set(data);
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.servicoId = id;
        this.carregarServico(id);
      }
    });
  }

  carregarCombos(): void {
    this.fiscalDataService.searchCnaes('').subscribe({
      next: (data) => this.cnaes.set(data)
    });
  }

  displayFiscal(item: BuscaFiscalResultDTO | null | undefined): string {
    return item ? item.label : '';
  }

  selecionarCnae(item: BuscaFiscalResultDTO): void {
    this.servicoForm.patchValue({ cnaeCodigo: item.id, nbsCodigo: '', codigoServicoLc116: '' });
    this.nbsSearchCtrl.setValue('');
    this.lc116List.set([]);
    this.fiscalDataService.getNbsByCnae(item.id).subscribe(res => {
      this.nbsList.set(res);
    });
  }

  selecionarNbs(item: BuscaFiscalResultDTO): void {
    this.servicoForm.patchValue({ nbsCodigo: item.id, codigoServicoLc116: '' });
    this.fiscalDataService.getLc116ByNbs(item.id).subscribe(res => {
      this.lc116List.set(res);
    });
  }

  carregarServico(id: string): void {
    this.loadingService.show();
    this.servicoService.findById(id).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (servico) => {
        this.servicoForm.patchValue(servico);
        if (servico.cnaeCodigo) {
          this.fiscalDataService.searchCnaes(servico.cnaeCodigo).subscribe(res => {
            const found = res.find(c => c.id === servico.cnaeCodigo);
            if (found) {
              this.cnaeSearchCtrl.setValue(found, { emitEvent: false });
              this.fiscalDataService.getNbsByCnae(found.id).subscribe(nbsRes => this.nbsList.set(nbsRes));
            }
          });
        }
        if (servico.nbsCodigo) {
          this.fiscalDataService.searchNbs(servico.nbsCodigo).subscribe(res => {
            const found = res.find(n => n.id === servico.nbsCodigo);
            if (found) {
              this.nbsSearchCtrl.setValue(found, { emitEvent: false });
              this.fiscalDataService.getLc116ByNbs(found.id).subscribe(lcRes => this.lc116List.set(lcRes));
            }
          });
        }
      },
      error: () => {
        this.notification.error('Erro ao carregar serviço');
        this.voltar();
      }
    });
  }

  salvar(): void {
    if (this.servicoForm.invalid) return;

    this.loadingService.show();
    const data = this.servicoForm.value;

    const request$ = this.isEditMode() && this.servicoId
      ? this.servicoService.update(this.servicoId, data)
      : this.servicoService.insert(data);

    request$.pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: () => {
        this.notification.success(`Serviço ${this.isEditMode() ? 'atualizado' : 'cadastrado'} com sucesso!`);
        this.voltar();
      },
      error: () => this.notification.error(`Erro ao ${this.isEditMode() ? 'atualizar' : 'cadastrar'} serviço`)
    });
  }

  voltar(): void {
    this.router.navigate(['/servicos']);
  }
}
