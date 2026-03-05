import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MensagemFiscalService, MensagemFiscal } from '../../../core/services/mensagem-fiscal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-mensagem-fiscal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatCardModule],
  template: `
    <div class="p-6 md:p-8 font-sans bg-slate-50 min-h-screen">
      <header class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
            {{ isEditMode() ? 'Editar Mensagem Fiscal' : 'Nova Mensagem Fiscal' }}
          </h1>
          <p class="text-slate-500 font-medium">Templates de texto para corpos de notas fiscais.</p>
        </div>
        <button mat-stroked-button color="primary" class="!rounded-xl !h-12 !px-6" (click)="voltar()">
          <mat-icon class="mr-2">arrow_back</mat-icon> Voltar
        </button>
      </header>

      <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden mb-8 max-w-5xl mx-auto">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center gap-2 bg-white">
          <mat-icon class="text-orange-500">message</mat-icon>
          <h2 class="text-lg font-bold text-slate-800">Dados da Mensagem</h2>
        </div>

        <form [formGroup]="form" (ngSubmit)="salvar()" class="p-6 bg-white flex flex-col gap-5">
          <div>
            <label class="field-label">Título da Mensagem *</label>
            <input type="text" formControlName="titulo"
              class="field-input"
              placeholder="Ex: Operação sujeita ao diferencial de alíquota...">
            <div *ngIf="form.get('titulo')?.invalid && form.get('titulo')?.touched" class="field-error">Campo obrigatório</div>
          </div>

          <div>
            <label class="field-label">Destino da Mensagem *</label>
            <select formControlName="destino"
              class="field-input">
              <option value="">Selecione...</option>
              <option value="FISCO">Interesse do Fisco (infAdFisco)</option>
              <option value="CONTRIBUINTE">Interesse do Contribuinte (infCpl)</option>
            </select>
            <div *ngIf="form.get('destino')?.invalid && form.get('destino')?.touched" class="field-error">Campo obrigatório</div>
          </div>

          <div>
            <label class="field-label">Texto / Template *</label>
            <p class="text-xs text-slate-400 mb-2 font-mono">{{ variaveisHint }}</p>
            <textarea formControlName="textoTemplate" rows="6"
              class="w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-mono text-sm"
              placeholder="Aqui vai o texto completo que aparecerá no campo de informações adicionais da nota fiscal..."></textarea>
            <div *ngIf="form.get('textoTemplate')?.invalid && form.get('textoTemplate')?.touched" class="field-error">Campo obrigatório</div>
          </div>

          <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" mat-stroked-button class="!rounded-lg" (click)="voltar()">Cancelar</button>
            <button type="submit" mat-flat-button color="primary" class="!rounded-lg !bg-indigo-600" [disabled]="form.invalid">
              <mat-icon class="mr-1">save</mat-icon> Salvar Mensagem
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `
})
export class MensagemFiscalFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(MensagemFiscalService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  mensagemId: string | null = null;
  readonly variaveisHint = 'Variáveis disponíveis: {{nomeCliente}}, {{nomeEmpresa}}, {{dataEmissao}}';

  form: FormGroup = this.fb.group({
    titulo: ['', Validators.required],
    destino: ['', Validators.required],
    textoTemplate: ['', Validators.required]
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.mensagemId = id;
        this.loadingService.show();
        this.service.findById(id).pipe(finalize(() => this.loadingService.hide())).subscribe({
          next: data => this.form.patchValue(data),
          error: () => { this.notification.error('Erro ao carregar mensagem'); this.voltar(); }
        });
      }
    });
  }

  salvar() {
    if (this.form.invalid) return;
    this.loadingService.show();
    const data = this.form.value as MensagemFiscal;
    const req$ = this.isEditMode() && this.mensagemId
      ? this.service.update(this.mensagemId, data)
      : this.service.insert(data);

    req$.pipe(finalize(() => this.loadingService.hide())).subscribe({
      next: () => {
        this.notification.success(`Mensagem ${this.isEditMode() ? 'atualizada' : 'cadastrada'} com sucesso!`);
        this.voltar();
      },
      error: () => this.notification.error(`Erro ao ${this.isEditMode() ? 'atualizar' : 'cadastrar'} mensagem`)
    });
  }

  voltar() {
    this.router.navigate(['/fiscal/mensagens-fiscais']);
  }
}
