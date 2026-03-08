import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NfseService, NotaFiscalServico, StatusNFSe } from '../../core/services/nfse.service';
import { NfseEmissaoStatusComponent } from './nfse-emissao-status.component';

@Component({
  selector: 'app-nfse-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, NfseEmissaoStatusComponent],
  template: `
    <div class="nfse-container">

      <!-- Header -->
      <div class="nfse-header">
        <div class="header-text">
          <h1>🧾 Fatura NFS-e (Serviços)</h1>
          <p>Emissão, acompanhamento e cancelamento de Notas Fiscais de Serviço</p>
        </div>
        <button class="btn-primary" (click)="novaNota()">
          <i class="pi pi-plus"></i> Criar Nota
        </button>
      </div>

      <!-- KPIs -->
      <div class="kpi-row">
        <div class="kpi kpi-total">
          <span class="kpi-val">{{ totalNotas() }}</span>
          <span class="kpi-lbl">Total</span>
        </div>
        <div class="kpi kpi-auth">
          <span class="kpi-val">{{ contarStatus('AUTORIZADA') }}</span>
          <span class="kpi-lbl">Autorizadas</span>
        </div>
        <div class="kpi kpi-proc">
          <span class="kpi-val">{{ contarStatus('PROCESSANDO') }}</span>
          <span class="kpi-lbl">Processando</span>
        </div>
        <div class="kpi kpi-rej">
          <span class="kpi-val">{{ contarStatus('REJEITADA') }}</span>
          <span class="kpi-lbl">Rejeitadas</span>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-search">
          <i class="pi pi-search"></i>
          <input type="text" [(ngModel)]="busca" (input)="onBusca()" placeholder="Buscar por RPS, número NFS-e, cliente...">
        </div>
        <div class="filter-status">
          @for (s of statusList; track s.value) {
            <button class="status-filter" [class.active]="filtroStatus === s.value"
              (click)="filtrarStatus(s.value)">
              {{ s.label }}
            </button>
          }
        </div>
      </div>

      <!-- Tabela -->
      @if (carregando()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Carregando notas...</p>
        </div>
      } @else if (notas().length === 0) {
        <div class="empty-state">
          <span>🧾</span>
          <h3>Nenhuma NFS-e encontrada</h3>
          <p>Crie sua primeira nota fiscal de serviço.</p>
          <button class="btn-primary" (click)="novaNota()">Criar NFS-e</button>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>RPS / NFS-e</th>
                <th>Tomador</th>
                <th>Data Emissão</th>
                <th>Discriminação</th>
                <th class="text-right">Valor</th>
                <th class="text-center">Status</th>
                <th class="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (nota of notas(); track nota.id) {
                <tr (click)="abrirNota(nota)" class="clickable-row">
                  <td>
                    <div class="rps-info">
                      <span class="rps-num">RPS #{{ nota.numeroRps }}</span>
                      @if (nota.numeroNfse) {
                        <span class="nfse-num">NFS-e {{ nota.numeroNfse }}</span>
                      }
                    </div>
                  </td>
                  <td>
                    <div class="tomador-info">
                      @if (nota.clienteNome) {
                        <span class="tomador-nome">{{ nota.clienteNome }}</span>
                      } @else {
                        <span class="tomador-nome text-warn" title="Cliente não identificado — verifique o cadastro">⚠️ Sem nome</span>
                      }
                      @if (nota.clienteCpfCnpj) {
                        <span class="tomador-doc">{{ nota.clienteCpfCnpj }}</span>
                      }
                    </div>
                  </td>
                  <td class="text-sm">{{ formatarData(nota.dataEmissao) }}</td>
                  <td class="discriminacao-cell">{{ truncar(nota.discriminacaoServico, 60) }}</td>
                  <td class="text-right font-bold">
                    {{ nota.valorServicos | currency: 'BRL' }}
                  </td>
                  <td class="text-center">
                    <span class="status-badge status-{{ nota.status?.toLowerCase() }}">
                      {{ statusLabel(nota.status) }}
                    </span>
                  </td>
                  <td class="text-center" (click)="$event.stopPropagation()">
                    <div class="actions-row">

                      <!-- RASCUNHO e REJEITADA: editar + emitir + excluir -->
                      @if (nota.status === 'RASCUNHO') {
                        <button class="btn-action btn-edit" (click)="editarNota(nota)" [matTooltip]="'Editar rascunho'" id="btn-editar-{{nota.id}}">
                          <i class="pi pi-pencil"></i>
                        </button>
                        <button class="btn-action btn-emitir" (click)="emitir(nota)" [matTooltip]="'Emitir NFS-e'" id="btn-emitir-{{nota.id}}">
                          <i class="pi pi-send"></i>
                        </button>
                        <button class="btn-action btn-del" (click)="excluir(nota)" [matTooltip]="'Excluir rascunho'" id="btn-del-{{nota.id}}">
                          <i class="pi pi-trash"></i>
                        </button>
                      }

                      @if (nota.status === 'REJEITADA') {
                        <button class="btn-action btn-edit" (click)="editarNota(nota)" [matTooltip]="'Corrigir e editar'">
                          <i class="pi pi-pencil"></i>
                        </button>
                        <button class="btn-action btn-emitir" (click)="emitir(nota)" [matTooltip]="'Tentar novamente'">
                          <i class="pi pi-refresh"></i>
                        </button>
                        <button class="btn-action btn-del" (click)="excluir(nota)" [matTooltip]="'Excluir'">
                          <i class="pi pi-trash"></i>
                        </button>
                      }

                      <!-- PROCESSANDO: consultar status (sem editar/excluir) -->
                      @if (nota.status === 'PROCESSANDO') {
                        <button class="btn-action btn-consultar" (click)="consultar(nota)" [matTooltip]="'Consultar status na prefeitura'">
                          <i class="pi pi-sync"></i>
                        </button>
                        <button class="btn-action btn-info" (click)="verMensagem(nota)" [matTooltip]="nota.mensagemRetorno || 'Ver detalhes'">
                          <i class="pi pi-info-circle"></i>
                        </button>
                      }

                      <!-- AUTORIZADA: XML + imprimir + cancelar -->
                      @if (nota.status === 'AUTORIZADA') {
                        <button class="btn-action btn-xml" [disabled]="!nota.temXml" [matTooltip]="nota.temXml ? 'Baixar XML' : 'XML ainda não disponível'" (click)="baixarXml(nota)">
                          <i class="pi pi-download"></i>
                        </button>
                        <button class="btn-action btn-imprimir" [matTooltip]="'Imprimir DANFSE'" (click)="imprimir(nota)">
                          <i class="pi pi-print"></i>
                        </button>
                        <button class="btn-action btn-cancelar-nota" (click)="cancelar(nota)" [matTooltip]="'Cancelar NFS-e'">
                          <i class="pi pi-times-circle"></i>
                        </button>
                      }

                      <!-- CANCELADA: somente visualização -->
                      @if (nota.status === 'CANCELADA') {
                        <button class="btn-action btn-view" (click)="abrirNota(nota)" [matTooltip]="'Ver detalhes (nota cancelada)'">
                          <i class="pi pi-eye"></i>
                        </button>
                        <span class="badge-immutable" [matTooltip]="'Esta nota não pode ser alterada ou excluída'">🔒</span>
                      }

                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Paginação -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="page-btn" [disabled]="paginaAtual() === 0" (click)="mudarPagina(paginaAtual() - 1)">‹</button>
            @for (p of paginas(); track p) {
              <button class="page-btn" [class.active]="p === paginaAtual()" (click)="mudarPagina(p)">{{ p + 1 }}</button>
            }
            <button class="page-btn" [disabled]="paginaAtual() === totalPages() - 1" (click)="mudarPagina(paginaAtual() + 1)">›</button>
          </div>
        }
      }
    </div>

    <!-- Modal Cancelamento -->
    @if (modalCancelamentoAberto()) {
      <div class="modal-overlay" (click)="fecharModalCancelamento()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>❌ Cancelar NFS-e</h2>
            <button class="modal-close" (click)="fecharModalCancelamento()">✕</button>
          </div>
          <div class="modal-body">
            <p class="modal-warn">⚠️ O cancelamento é irreversível. Confirme o motivo:</p>
            <div class="form-field">
              <label>Código de Cancelamento</label>
              <select [(ngModel)]="cancelamentoForm.codigo">
                <option value="1">1 — Erro na emissão</option>
                <option value="2">2 — Serviço não prestado</option>
                <option value="3">3 — Duplicidade da nota</option>
              </select>
            </div>
            <div class="form-field">
              <label>Motivo *</label>
              <textarea [(ngModel)]="cancelamentoForm.motivo" rows="3" placeholder="Descreva o motivo do cancelamento..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" (click)="fecharModalCancelamento()">Voltar</button>
            <button class="btn-danger" (click)="confirmarCancelamento()" [disabled]="!cancelamentoForm.motivo.trim()">
              Confirmar Cancelamento
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Painel SSE: progresso de emissão em tempo real -->
    @if (modalEmissaoAberto()) {
      <app-nfse-emissao-status
        #painelSse
        [nfseId]="notaEmitindo()?.id!"
        [nomeCliente]="notaEmitindo()?.clienteNome || ''"
        [numeroRps]="notaEmitindo()?.numeroRps"
        (finalizado)="onEmissaoFinalizada($event)"
        (fechar)="fecharModalEmissao()"
      />
    }
  `,
  styles: [`
    :host { display: block; }

    .nfse-container {
      min-height: 100vh;
      background: #f0f4fb;
      padding: 2rem;
      font-family: 'Inter', sans-serif;
    }

    /* Header */
    .nfse-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
    }
    .header-text h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .header-text p { font-size: 0.875rem; color: #64748b; margin: 0.25rem 0 0; }

    /* KPIs */
    .kpi-row {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 1rem; margin-bottom: 1.5rem;
    }
    .kpi {
      background: white; border-radius: 12px; padding: 1.25rem 1.5rem;
      display: flex; flex-direction: column; gap: 0.25rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
      border-left: 4px solid transparent;
    }
    .kpi-total { border-left-color: #3b82f6; }
    .kpi-auth  { border-left-color: #22c55e; }
    .kpi-proc  { border-left-color: #f59e0b; }
    .kpi-rej   { border-left-color: #ef4444; }
    .kpi-val { font-size: 1.75rem; font-weight: 700; color: #1e293b; }
    .kpi-lbl { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Filtros */
    .filters-bar {
      display: flex; gap: 1rem; align-items: center;
      margin-bottom: 1.25rem; flex-wrap: wrap;
    }
    .filter-search {
      flex: 1; min-width: 250px;
      display: flex; align-items: center; gap: 0.6rem;
      background: white; border: 1.5px solid #e2e8f0;
      border-radius: 10px; padding: 0.5rem 0.875rem;
    }
    .filter-search input {
      border: none; outline: none; flex: 1;
      font-size: 0.9rem; color: #1e293b; background: transparent;
    }
    .filter-status { display: flex; gap: 0.35rem; flex-wrap: wrap; }
    .status-filter {
      padding: 0.4rem 0.875rem;
      background: white; color: #64748b;
      border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
    }
    .status-filter:hover, .status-filter.active {
      background: #1e3a5f; color: white; border-color: #1e3a5f;
    }

    /* Tabela */
    .table-wrapper {
      background: white; border-radius: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07); overflow: auto;
      margin-bottom: 1rem;
    }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th {
      background: #f8fafc; color: #475569;
      font-size: 0.75rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.05em;
      padding: 0.875rem 1rem; text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table td { padding: 0.875rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr.clickable-row { cursor: pointer; transition: background 0.15s; }
    .data-table tr.clickable-row:hover { background: #f8fafc; }

    .rps-info { display: flex; flex-direction: column; gap: 0.15rem; }
    .rps-num { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
    .nfse-num { font-size: 0.75rem; color: #2d6a9f; font-weight: 500; }
    .tomador-info { display: flex; flex-direction: column; gap: 0.15rem; }
    .tomador-nome { font-weight: 500; color: #1e293b; }
    .tomador-doc { font-size: 0.75rem; color: #94a3b8; font-family: monospace; }
    .discriminacao-cell { max-width: 280px; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-sm { font-size: 0.8rem; color: #64748b; }
    .font-bold { font-weight: 600; }

    /* Status badges */
    .status-badge {
      display: inline-block; padding: 0.25rem 0.75rem;
      border-radius: 9999px; font-size: 0.75rem; font-weight: 600;
    }
    .status-rascunho   { background: #f1f5f9; color: #475569; }
    .status-processando { background: #fef3c7; color: #d97706; }
    .status-autorizada  { background: #dcfce7; color: #16a34a; }
    .status-rejeitada   { background: #fee2e2; color: #dc2626; }
    .status-cancelada   { background: #f1f5f9; color: #94a3b8; text-decoration: line-through; }

    /* Actions */
    .actions-row { display: flex; gap: 0.3rem; justify-content: center; }
    .btn-action {
      width: 30px; height: 30px;
      border: none; border-radius: 6px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; transition: all 0.15s;
    }
    .btn-action:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-emitir   { background: #dbeafe; color: #1d4ed8; } .btn-emitir:hover   { background: #1d4ed8; color: white; }
    .btn-consultar{ background: #fef3c7; color: #d97706; } .btn-consultar:hover{ background: #d97706; color: white; }
    .btn-xml      { background: #dcfce7; color: #16a34a; } .btn-xml:hover      { background: #16a34a; color: white; }
    .btn-edit     { background: #f0f9ff; color: #0369a1; } .btn-edit:hover     { background: #0369a1; color: white; }
    /* Botões extras por status */
    .btn-del      { background: #fee2e2; color: #dc2626; } .btn-del:hover      { background: #dc2626; color: white; }
    .btn-info     { background: #f0f9ff; color: #0284c7; } .btn-info:hover     { background: #0284c7; color: white; }
    .btn-view     { background: #f5f3ff; color: #7c3aed; } .btn-view:hover     { background: #7c3aed; color: white; }
    .btn-imprimir { background: #ecfdf5; color: #059669; } .btn-imprimir:hover { background: #059669; color: white; }
    .btn-cancelar-nota { background: #fff7ed; color: #c2410c; } .btn-cancelar-nota:hover { background: #c2410c; color: white; }
    .badge-immutable {
      display: inline-flex; align-items: center; justify-content: center;
      width: 30px; height: 30px; font-size: 0.875rem;
      background: #f1f5f9; border-radius: 6px; cursor: help; color: #64748b;
    }


    /* States */
    .loading-state, .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 4rem; gap: 1rem; background: white; border-radius: 14px; color: #64748b;
    }
    .empty-state span { font-size: 3rem; }
    .empty-state h3 { margin: 0; font-size: 1.125rem; font-weight: 600; color: #1e293b; }
    .empty-state p { margin: 0; font-size: 0.875rem; }
    .spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #2d6a9f; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Paginação */
    .pagination { display: flex; gap: 0.4rem; justify-content: center; margin-top: 1rem; }
    .page-btn {
      min-width: 36px; height: 36px; padding: 0 0.5rem;
      background: white; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 0.875rem; cursor: pointer; transition: all 0.15s;
    }
    .page-btn:hover, .page-btn.active { background: #1e3a5f; color: white; border-color: #1e3a5f; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Botões Globais */
    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: linear-gradient(135deg, #1e3a5f, #2d6a9f);
      color: white; border: none; border-radius: 10px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 9999;
    }
    .modal-box { background: white; border-radius: 16px; width: 100%; max-width: 480px; overflow: hidden; animation: slideUp 0.2s ease; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header { padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; }
    .modal-header h2 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
    .modal-close { background: none; border: none; font-size: 1.1rem; color: #94a3b8; cursor: pointer; }
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .modal-warn { background: #fff7ed; color: #c2410c; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.875rem; margin: 0; }
    .form-field { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-field label { font-size: 0.8rem; font-weight: 600; color: #475569; text-transform: uppercase; }
    .form-field select, .form-field textarea {
      padding: 0.625rem 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-size: 0.9rem; color: #1e293b; background: white; resize: vertical;
    }
    .form-field select:focus, .form-field textarea:focus { outline: none; border-color: #2d6a9f; }
    .modal-footer { padding: 1.25rem 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #f1f5f9; background: #f8fafc; }
    .btn-ghost { padding: 0.625rem 1.25rem; background: transparent; color: #64748b; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; cursor: pointer; }
    .btn-danger { padding: 0.625rem 1.5rem; background: linear-gradient(135deg, #dc2626, #ef4444); color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; }
    .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 768px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .nfse-container { padding: 1rem; }
    }
  `]
})
export class NfseListComponent implements OnInit {
  private nfseService = inject(NfseService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  notas = signal<NotaFiscalServico[]>([]);
  carregando = signal(false);
  totalNotas = signal(0);
  paginaAtual = signal(0);
  totalPages = signal(0);

  busca = '';
  filtroStatus = '';
  buscaTimeout: any;

  modalCancelamentoAberto = signal(false);
  notaParaCancelar: NotaFiscalServico | null = null;
  cancelamentoForm = { motivo: '', codigo: '1' };

  // ─── SSE Emissão ────────────────────────────────────────────────────────────
  @ViewChild('painelSse') painelSse?: NfseEmissaoStatusComponent;
  modalEmissaoAberto = signal(false);
  notaEmitindo = signal<NotaFiscalServico | null>(null);

  statusList = [
    { value: '', label: 'Todas' },
    { value: 'RASCUNHO', label: 'Rascunho' },
    { value: 'AUTORIZADA', label: 'Autorizadas' },
    { value: 'PROCESSANDO', label: 'Processando' },
    { value: 'REJEITADA', label: 'Rejeitadas' },
    { value: 'CANCELADA', label: 'Canceladas' },
  ];

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.carregando.set(true);
    this.nfseService.listar(this.busca || undefined, this.filtroStatus || undefined, this.paginaAtual()).subscribe({
      next: (page) => {
        this.notas.set(page.content);
        this.totalNotas.set(page.totalElements);
        this.totalPages.set(page.totalPages);
      },
      error: () => this.carregando.set(false),
      complete: () => this.carregando.set(false)
    });
  }

  onBusca(): void {
    clearTimeout(this.buscaTimeout);
    this.buscaTimeout = setTimeout(() => { this.paginaAtual.set(0); this.carregar(); }, 400);
  }

  filtrarStatus(status: string): void {
    this.filtroStatus = status;
    this.paginaAtual.set(0);
    this.carregar();
  }

  mudarPagina(p: number): void {
    this.paginaAtual.set(p);
    this.carregar();
  }

  paginas(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  contarStatus(status: StatusNFSe): number {
    return this.notas().filter(n => n.status === status).length;
  }

  novaNota(): void { this.router.navigate(['/contabilidade/nfse/criar']); }
  abrirNota(nota: NotaFiscalServico): void { this.router.navigate(['/contabilidade/nfse', nota.id]); }
  editarNota(nota: NotaFiscalServico): void { this.router.navigate(['/contabilidade/nfse', nota.id, 'editar']); }

  emitir(nota: NotaFiscalServico): void {
    if (!confirm(`Emitir NFS-e RPS #${nota.numeroRps} para ${nota.clienteNome}?`)) return;

    this.nfseService.emitir(nota.id!).subscribe({
      next: (notaAtualizada) => {
        this.notaEmitindo.set(notaAtualizada.id ? notaAtualizada : nota);
        this.modalEmissaoAberto.set(true);
        setTimeout(() => this.painelSse?.iniciarStreaming(), 50);
      },
      error: (err) => this.snackBar.open(
        err?.error?.message || 'Erro ao enfileirar emissão', 'OK', { duration: 4000 }
      )
    });
  }

  onEmissaoFinalizada(result: { sucesso: boolean; mensagem: string }): void {
    if (result.sucesso) {
      this.snackBar.open('✅ NFS-e autorizada com sucesso!', 'OK', { duration: 5000 });
    } else {
      this.snackBar.open('❌ Emissão rejeitada. Verifique os detalhes.', 'OK', { duration: 6000 });
    }
    // Recarrega a lista para refletir o novo status
    setTimeout(() => this.carregar(), 1000);
  }

  fecharModalEmissao(): void {
    this.modalEmissaoAberto.set(false);
    this.notaEmitindo.set(null);
    // Recarrega para pegar status atualizado
    this.carregar();
  }

  consultar(nota: NotaFiscalServico): void {
    this.nfseService.consultar(nota.id!).subscribe({
      next: (n) => {
        this.snackBar.open(`Status atualizado: ${this.statusLabel(n.status)}`, 'OK', { duration: 3000 });
        this.carregar();
      },
      error: () => this.snackBar.open('Erro ao consultar', 'OK', { duration: 3000 })
    });
  }

  verMensagem(nota: NotaFiscalServico): void {
    const msg = nota.mensagemRetorno || 'Nenhuma mensagem disponível.';
    this.snackBar.open(msg, 'OK', { duration: 8000 });
  }

  baixarXml(nota: NotaFiscalServico): void {
    this.snackBar.open('ℹ️ Download XML em desenvolvimento', 'OK', { duration: 3000 });
  }

  imprimir(nota: NotaFiscalServico): void {
    this.snackBar.open('ℹ️ Impressão DANFSE em desenvolvimento', 'OK', { duration: 3000 });
  }

  /**
   * Exclui a nota apenas se for RASCUNHO ou REJEITADA.
   * Notas AUTORIZADA, PROCESSANDO ou CANCELADA são imutáveis.
   */
  excluir(nota: NotaFiscalServico): void {
    const statusImutaveis: string[] = ['AUTORIZADA', 'PROCESSANDO', 'CANCELADA'];
    if (statusImutaveis.includes(nota.status || '')) {
      this.snackBar.open(
        `🔒 Notas ${this.statusLabel(nota.status)} não podem ser excluídas. Status imutável por lei.`,
        'OK', { duration: 5000 }
      );
      return;
    }
    if (!confirm(`Excluir RPS #${nota.numeroRps}? Esta ação não pode ser desfeita.`)) return;

    this.nfseService.excluir(nota.id!).subscribe({
      next: () => {
        this.snackBar.open('✔ Nota excluída com sucesso.', 'OK', { duration: 3000 });
        this.carregar();
      },
      error: (err) => this.snackBar.open(
        err?.error?.message || 'Erro ao excluir nota', 'OK', { duration: 4000 }
      )
    });
  }

  cancelar(nota: NotaFiscalServico): void {
    this.notaParaCancelar = nota;
    this.cancelamentoForm = { motivo: '', codigo: '1' };
    this.modalCancelamentoAberto.set(true);
  }

  fecharModalCancelamento(): void { this.modalCancelamentoAberto.set(false); }

  confirmarCancelamento(): void {
    if (!this.notaParaCancelar || !this.cancelamentoForm.motivo?.trim()) return;
    this.nfseService.cancelar(this.notaParaCancelar.id!, this.cancelamentoForm.motivo, this.cancelamentoForm.codigo).subscribe({
      next: () => {
        this.snackBar.open('NFS-e cancelada com sucesso', 'OK', { duration: 3000 });
        this.fecharModalCancelamento();
        this.carregar();
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Erro ao cancelar', 'OK', { duration: 4000 })
    });
  }

  formatarData(data?: string): string {
    if (!data) return '—';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  truncar(s?: string, max = 60): string {
    if (!s) return '—';
    return s.length > max ? s.substring(0, max) + '...' : s;
  }

  statusLabel(s?: StatusNFSe | null): string {
    const map: Record<string, string> = {
      RASCUNHO: 'Rascunho', PROCESSANDO: 'Processando',
      AUTORIZADA: 'Autorizada', REJEITADA: 'Rejeitada', CANCELADA: 'Cancelada'
    };
    return s ? (map[s] || s) : '—';
  }
}

