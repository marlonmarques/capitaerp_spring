import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { EstoqueService, LocalEstoque } from '../../core/services/estoque.service';

@Component({
    selector: 'app-locais-estoque',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
    template: `
    <div class="locais-container">

      <div class="locais-header">
        <button class="btn-back" (click)="voltar()">
          <i class="pi pi-arrow-left"></i> Voltar ao Estoque
        </button>
        <div class="header-info">
          <h1>🏬 Locais de Estoque</h1>
          <p>Gerencie os locais físicos de armazenamento (depósitos, lojas, galpões...)</p>
        </div>
        <button class="btn-primary" (click)="abrirModal()">
          <i class="pi pi-plus"></i> Novo Local
        </button>
      </div>

      <div class="locais-grid">
        @if (carregando()) {
          <div class="loading-card">
            <div class="spinner"></div>
            <p>Carregando locais...</p>
          </div>
        } @else if (locais().length === 0) {
          <div class="empty-card">
            <span>🏪</span>
            <h3>Nenhum local cadastrado</h3>
            <p>Crie um local de estoque para começar a gerenciar seu inventário.</p>
            <button class="btn-primary" (click)="abrirModal()">Criar Primeiro Local</button>
          </div>
        } @else {
          @for (local of locais(); track local.id) {
            <div class="local-card" [class.inactive]="!local.ativo">
              <div class="local-card-header">
                <div class="local-icon">🏬</div>
                <div class="local-title">
                  <h3>{{ local.nome }}</h3>
                  <span class="local-status" [class.active]="local.ativo" [class.inactive-badge]="!local.ativo">
                    {{ local.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
              </div>
              @if (local.descricao) {
                <p class="local-desc">{{ local.descricao }}</p>
              }
              <div class="local-actions">
                <button class="btn-edit" (click)="editarLocal(local)">
                  <i class="pi pi-pencil"></i> Editar
                </button>
                @if (local.ativo) {
                  <button class="btn-deactivate" (click)="desativarLocal(local)">
                    <i class="pi pi-eye-slash"></i> Desativar
                  </button>
                } @else {
                  <button class="btn-activate" (click)="ativarLocal(local)">
                    <i class="pi pi-eye"></i> Ativar
                  </button>
                }
              </div>
            </div>
          }

          <!-- Botão adicionar novo -->
          <div class="local-card add-card" (click)="abrirModal()">
            <div class="add-icon">+</div>
            <p>Adicionar Novo Local</p>
          </div>
        }
      </div>
    </div>

    <!-- Modal -->
    @if (modalAberto()) {
      <div class="modal-overlay" (click)="fecharModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editandoId ? '✏️ Editar Local' : '➕ Novo Local de Estoque' }}</h2>
            <button class="modal-close" (click)="fecharModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-field">
              <label>Nome do Local *</label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Ex: Depósito Principal, Loja Centro...">
            </div>
            <div class="form-field">
              <label>Descrição</label>
              <textarea [(ngModel)]="form.descricao" rows="3"
                placeholder="Describe the location (optional)..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" (click)="fecharModal()">Cancelar</button>
            <button class="btn-save" (click)="salvar()" [disabled]="!form.nome?.trim()">
              {{ editandoId ? 'Salvar Alterações' : 'Criar Local' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    :host { display: block; }

    .locais-container {
      min-height: 100vh;
      background: #f0f4fb;
      padding: 2rem;
      font-family: 'Inter', sans-serif;
    }

    .locais-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .header-info { flex: 1; }
    .header-info h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .header-info p { font-size: 0.875rem; color: #64748b; margin: 0.25rem 0 0; }

    .btn-back {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 1rem;
      background: white; color: #2d6a9f;
      border: 1px solid #cbd5e1; border-radius: 8px;
      font-size: 0.875rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-back:hover { background: #dbeafe; }

    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: linear-gradient(135deg, #1e3a5f, #2d6a9f);
      color: white; border: none; border-radius: 10px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

    /* Grid */
    .locais-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .local-card {
      background: white;
      border-radius: 14px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      transition: all 0.2s;
      border: 1.5px solid transparent;
    }
    .local-card:hover { border-color: #3b82f6; box-shadow: 0 4px 16px rgba(45,106,159,0.15); }
    .local-card.inactive { opacity: 0.6; }

    .local-card-header {
      display: flex; align-items: flex-start; gap: 0.875rem;
      margin-bottom: 0.75rem;
    }
    .local-icon {
      font-size: 2rem;
      width: 50px; height: 50px;
      background: #dbeafe; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .local-title h3 { font-size: 1rem; font-weight: 600; color: #1e293b; margin: 0 0 0.25rem; }
    .local-status {
      display: inline-block;
      padding: 0.15rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .local-status.active { background: #dcfce7; color: #16a34a; }
    .local-status.inactive-badge { background: #fee2e2; color: #dc2626; }

    .local-desc { font-size: 0.875rem; color: #64748b; margin: 0 0 1rem; }

    .local-actions {
      display: flex; gap: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid #f1f5f9;
    }
    .btn-edit, .btn-deactivate, .btn-activate {
      flex: 1;
      display: flex; align-items: center; justify-content: center; gap: 0.35rem;
      padding: 0.5rem;
      border: none; border-radius: 8px;
      font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
    .btn-edit { background: #dbeafe; color: #2d6a9f; }
    .btn-edit:hover { background: #2d6a9f; color: white; }
    .btn-deactivate { background: #fee2e2; color: #dc2626; }
    .btn-deactivate:hover { background: #dc2626; color: white; }
    .btn-activate { background: #dcfce7; color: #16a34a; }
    .btn-activate:hover { background: #16a34a; color: white; }

    /* Add card */
    .add-card {
      border: 2px dashed #cbd5e1;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 0.5rem;
      cursor: pointer; color: #94a3b8;
      min-height: 180px;
      transition: all 0.2s;
    }
    .add-card:hover { border-color: #2d6a9f; color: #2d6a9f; background: #f0f9ff; }
    .add-card:hover { transform: none; }
    .add-icon { font-size: 2rem; }
    .add-card p { margin: 0; font-size: 0.875rem; font-weight: 500; }

    /* Loading / Empty */
    .loading-card, .empty-card {
      grid-column: 1 / -1;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 1rem; padding: 4rem;
      background: white; border-radius: 14px;
      color: #64748b;
    }
    .empty-card span { font-size: 3rem; }
    .empty-card h3 { margin: 0; font-size: 1.125rem; color: #1e293b; }
    .empty-card p { margin: 0; font-size: 0.875rem; }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: #2d6a9f;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
    }
    .modal-box {
      background: white; border-radius: 16px;
      width: 100%; max-width: 460px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      animation: slideUp 0.2s ease;
      overflow: hidden;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header {
      padding: 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
    }
    .modal-header h2 { margin: 0; font-size: 1.125rem; font-weight: 700; color: #1e293b; }
    .modal-close { background: none; border: none; font-size: 1.1rem; color: #94a3b8; cursor: pointer; }
    .modal-close:hover { color: #1e293b; }
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-field label { font-size: 0.8rem; font-weight: 600; color: #475569; text-transform: uppercase; }
    .form-field input,
    .form-field textarea {
      padding: 0.625rem 0.875rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #1e293b;
      background: white;
      resize: vertical;
    }
    .form-field input:focus, .form-field textarea:focus { outline: none; border-color: #2d6a9f; }
    .modal-footer {
      padding: 1.25rem 1.5rem;
      display: flex; justify-content: flex-end; gap: 0.75rem;
      border-top: 1px solid #f1f5f9; background: #f8fafc;
    }
    .btn-ghost {
      padding: 0.625rem 1.25rem;
      background: transparent; color: #64748b;
      border: 1px solid #cbd5e1; border-radius: 8px;
      font-size: 0.875rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-ghost:hover { background: #f1f5f9; }
    .btn-save {
      padding: 0.625rem 1.5rem;
      background: linear-gradient(135deg, #1e3a5f, #2d6a9f);
      color: white; border: none; border-radius: 8px;
      font-weight: 600; font-size: 0.9rem; cursor: pointer;
    }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class LocaisEstoqueComponent implements OnInit {
    private estoqueService = inject(EstoqueService);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);

    locais = signal<LocalEstoque[]>([]);
    carregando = signal(false);
    modalAberto = signal(false);
    editandoId: string | null = null;

    form: Partial<LocalEstoque> = { nome: '', descricao: '' };

    ngOnInit(): void {
        this.carregar();
    }

    carregar(): void {
        this.carregando.set(true);
        this.estoqueService.listarLocaisObs().subscribe({
            next: (data) => this.locais.set(data),
            error: () => this.carregando.set(false),
            complete: () => this.carregando.set(false)
        });
    }

    abrirModal(local?: LocalEstoque): void {
        if (local) {
            this.editandoId = local.id || null;
            this.form = { nome: local.nome, descricao: local.descricao };
        } else {
            this.editandoId = null;
            this.form = { nome: '', descricao: '' };
        }
        this.modalAberto.set(true);
    }

    editarLocal(local: LocalEstoque): void {
        this.abrirModal(local);
    }

    fecharModal(): void {
        this.modalAberto.set(false);
    }

    salvar(): void {
        if (!this.form.nome?.trim()) return;

        const obs$ = this.editandoId
            ? this.estoqueService.atualizarLocal(this.editandoId, { nome: this.form.nome!, descricao: this.form.descricao })
            : this.estoqueService.criarLocal({ nome: this.form.nome!, descricao: this.form.descricao });

        obs$.subscribe({
            next: () => {
                this.snackBar.open(`✅ Local ${this.editandoId ? 'atualizado' : 'criado'} com sucesso`, 'OK', { duration: 3000 });
                this.fecharModal();
                this.carregar();
            },
            error: (err) => {
                this.snackBar.open(err?.error?.message || 'Erro ao salvar local', 'OK', { duration: 3000 });
            }
        });
    }

    desativarLocal(local: LocalEstoque): void {
        if (!confirm(`Desativar "${local.nome}"? O estoque existente será preservado.`)) return;
        this.estoqueService.excluirLocal(local.id!).subscribe({
            next: () => {
                this.snackBar.open('Local desativado', 'OK', { duration: 2500 });
                this.carregar();
            }
        });
    }

    ativarLocal(local: LocalEstoque): void {
        this.estoqueService.atualizarLocal(local.id!, { ...local, ativo: true }).subscribe({
            next: () => {
                this.snackBar.open('Local reativado com sucesso', 'OK', { duration: 2500 });
                this.carregar();
            }
        });
    }

    voltar(): void {
        this.router.navigate(['/estoque']);
    }
}
