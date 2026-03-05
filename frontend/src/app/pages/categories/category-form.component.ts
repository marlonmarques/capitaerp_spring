import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService, Categoria } from '../../core/services/cadastros/categoria.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="p-6 md:p-8 font-sans bg-slate-50 min-h-screen">
      <header class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
            {{ isEditMode() ? 'Editar Categoria' : 'Nova Categoria' }}
          </h1>
          <p class="text-slate-500 font-medium">
            {{ isEditMode() ? 'Atualize as informações da categoria' : 'Preencha os dados para uma nova categoria' }}
          </p>
        </div>
        <button mat-stroked-button color="primary" class="!rounded-xl !h-12 !px-6" (click)="voltar()">
          <mat-icon class="mr-2">arrow_back</mat-icon> Voltar
        </button>
      </header>

      <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden mb-8 max-w-5xl mx-auto">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 class="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
            <mat-icon [class]="isEditMode() ? \'text-amber-500 text-[18px]\' : \'text-indigo-500 text-[18px]\'">
              {{ isEditMode() ? 'edit' : 'add_circle' }}
            </mat-icon>
            Dados da Categoria
          </h2>
        </div>
        <div class="p-6 bg-white">
          <form [formGroup]="categoriaForm" (ngSubmit)="salvarCategoria()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="mb-2.5">
                <label class="field-label">Nome da Categoria</label>
                <input type="text" formControlName="nome" class="field-input" placeholder="Ex: Eletrônicos">
                <div *ngIf="categoriaForm.get('nome')?.invalid && categoriaForm.get('nome')?.touched" class="field-error">
                  O nome é obrigatório
                </div>
              </div>
              <div class="mb-2.5">
                <label class="field-label">Tipo</label>
                <select formControlName="tipo" class="field-input">
                  <option value="PRODUTO">Produto</option>
                  <option value="SERVICO">Serviço</option>
                  <option value="FINANCEIRA">Financeira</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2.5">
              <div>
                <label class="field-label">Categoria Pai</label>
                <select formControlName="categoriaPaiId" class="field-input">
                  <option [ngValue]="null">Nenhuma</option>
                  <option *ngFor="let cat of categoriasPaiFiltradas()" [value]="cat.id">{{cat.nome}}</option>
                </select>
              </div>

              <div *ngIf="categoriaForm.get('tipo')?.value === 'PRODUTO'">
                <label class="field-label">Margem de Lucro Padrão (%)</label>
                <div class="relative">
                  <input type="number" formControlName="porcentagemLucroPadrao" step="0.01" class="field-input pr-8" placeholder="Ex: 30.00">
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
                <p class="text-[10px] text-slate-500 mt-1">Sugerido para calcular precificação de novos produtos.</p>
              </div>
            </div>

            <div class="mb-2.5">
              <label class="field-label">Descrição</label>
              <textarea formControlName="descricao" rows="2" class="field-input" placeholder="Ex: Categoria para produtos eletrônicos em geral"></textarea>
            </div>

            <div *ngIf="isEditMode() && categoriaAtualInfo" class="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between text-sm text-slate-500">
              <div class="flex items-center gap-2 mb-2 md:mb-0">
                <mat-icon class="text-slate-400 text-sm h-4 w-4 leading-none">history</mat-icon>
                <span><b>Criado em:</b> {{ formatDate(categoriaAtualInfo.criadoEm) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <mat-icon class="text-slate-400 text-sm h-4 w-4 leading-none">edit_calendar</mat-icon>
                <span><b>Atualizado em:</b> {{ formatDate(categoriaAtualInfo.atualizadoEm) }}</span>
              </div>
            </div>
            
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" mat-stroked-button class="!rounded-lg" (click)="voltar()">Cancelar</button>
              <button type="submit" mat-flat-button color="primary" class="!rounded-lg !bg-indigo-600" [disabled]="categoriaForm.invalid">
                <mat-icon class="mr-1">save</mat-icon> Salvar
              </button>
            </div>
          </form>
        </div>
      </mat-card>
    </div>
  `
})
export class CategoryFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  categoriaId: string | null = null;
  todasCategorias = signal<Categoria[]>([]);
  categoriaAtualInfo: { criadoEm?: string, atualizadoEm?: string } | null = null;

  categoriaForm: FormGroup = this.formBuilder.group({
    nome: ['', [Validators.required]],
    descricao: [''],
    tipo: ['PRODUTO', [Validators.required]],
    porcentagemLucroPadrao: [null],
    categoriaPaiId: [null]
  });

  ngOnInit() {
    this.carregarCategorias();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.categoriaId = id;
        this.carregarCategoria(id);
      }
    });

    // Limpa a categoria pai selecionada se o usuário mudar o tipo da categoria
    this.categoriaForm.get('tipo')?.valueChanges.subscribe(() => {
      this.categoriaForm.patchValue({ categoriaPaiId: null }, { emitEvent: false });
    });
  }

  carregarCategorias(): void {
    this.categoriaService.findAllPaged(undefined, 0, 50).subscribe({
      next: (page) => this.todasCategorias.set(page.content)
    });
  }

  carregarCategoria(id: string): void {
    this.loadingService.show();
    this.categoriaService.findById(id).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (categoria) => {
        this.categoriaAtualInfo = {
          criadoEm: categoria.criadoEm,
          atualizadoEm: categoria.atualizadoEm
        };
        this.categoriaForm.patchValue({
          nome: categoria.nome,
          descricao: categoria.descricao,
          tipo: categoria.tipo || 'OUTROS',
          porcentagemLucroPadrao: categoria.porcentagemLucroPadrao,
          categoriaPaiId: categoria.categoriaPaiId
        });
      },
      error: () => {
        this.notification.error('Erro ao carregar categoria');
        this.voltar();
      }
    });
  }

  categoriasPaiFiltradas(): Categoria[] {
    const tipoAtual = this.categoriaForm.get('tipo')?.value;
    let filtradas = this.todasCategorias().filter(c => c.tipo === tipoAtual);

    if (this.isEditMode()) {
      filtradas = filtradas.filter(c => c.id !== this.categoriaId);
    }
    return filtradas;
  }

  salvarCategoria(): void {
    if (this.categoriaForm.invalid) return;

    this.loadingService.show();
    const data = this.categoriaForm.value;

    const request$ = this.isEditMode() && this.categoriaId
      ? this.categoriaService.update(this.categoriaId, data)
      : this.categoriaService.insert(data);

    request$.pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: () => {
        this.notification.success(`Categoria ${this.isEditMode() ? 'atualizada' : 'cadastrada'} com sucesso!`);
        this.voltar();
      },
      error: () => this.notification.error(`Erro ao ${this.isEditMode() ? 'atualizar' : 'cadastrar'} categoria`)
    });
  }

  voltar(): void {
    this.router.navigate(['/categories']);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  }
}
