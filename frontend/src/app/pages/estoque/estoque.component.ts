import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EstoqueService, EstoqueSaldo, MovimentacaoEstoque, LocalEstoque, ProdutoAbaixoMinimo } from '../../core/services/estoque.service';
import { ProdutoService, Produto } from '../../core/services/produto.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

type Aba = 'saldos' | 'movimentacoes' | 'alertas' | 'locais';

@Component({
    selector: 'app-estoque',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatButtonModule, MatIconModule, MatSelectModule,
        MatFormFieldModule, MatInputModule, MatTooltipModule, MatDialogModule,
        PageHeaderComponent
    ],
    template: `
    <div class="estoque-container">
      <!-- Header -->
      <div class="estoque-header">
        <div class="header-content">
          <div class="header-title">
            <div class="header-icon">
              <i class="pi pi-warehouse"></i>
            </div>
            <div>
              <h1>Controle de Estoque</h1>
              <p>Gerencie saldos, movimentações e transferências entre locais</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn-outline" (click)="irParaLocais()">
              <i class="pi pi-map-marker"></i>
              Locais de Estoque
            </button>
            <button class="btn-primary" (click)="abrirTransferencia()">
              <i class="pi pi-arrows-h"></i>
              Nova Transferência
            </button>
          </div>
        </div>

        <!-- KPIs -->
        <div class="kpi-grid">
          <div class="kpi-card kpi-total">
            <div class="kpi-icon">📦</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ totalItens() }}</span>
              <span class="kpi-label">Itens no Estoque</span>
            </div>
          </div>
          <div class="kpi-card kpi-locais">
            <div class="kpi-icon">🏬</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ locais().length }}</span>
              <span class="kpi-label">Locais Ativos</span>
            </div>
          </div>
          <div class="kpi-card kpi-alertas" [class.has-alert]="alertas().length > 0">
            <div class="kpi-icon">⚠️</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ alertas().length }}</span>
              <span class="kpi-label">Abaixo do Mínimo</span>
            </div>
          </div>
          <div class="kpi-card kpi-mov">
            <div class="kpi-icon">🔄</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ movimentacoes().length }}</span>
              <span class="kpi-label">Movimentações</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Abas -->
      <div class="tabs-bar">
        <button class="tab-btn" [class.active]="abaAtiva() === 'saldos'" (click)="mudarAba('saldos')">
          <i class="pi pi-list"></i> Saldos por Local
        </button>
        <button class="tab-btn" [class.active]="abaAtiva() === 'movimentacoes'" (click)="mudarAba('movimentacoes')">
          <i class="pi pi-history"></i> Movimentações
        </button>
        <button class="tab-btn" [class.active]="abaAtiva() === 'alertas'" (click)="mudarAba('alertas')">
          <i class="pi pi-bell"></i> Alertas
          @if (alertas().length > 0) {
            <span class="badge-alert">{{ alertas().length }}</span>
          }
        </button>
      </div>

      <!-- Conteúdo -->
      <div class="tab-content">

        <!-- Filtros comuns -->
        <div class="filters-row">
          <div class="filter-group">
            <label>Local de Estoque</label>
            <select [(ngModel)]="filtroLocalId" (change)="aplicarFiltros()">
              <option value="">Todos os locais</option>
              @for (local of locais(); track local.id) {
                <option [value]="local.id">{{ local.nome }}</option>
              }
            </select>
          </div>
          <div class="filter-group">
            <label>Buscar produto</label>
            <input type="text" [(ngModel)]="filtroBusca" (input)="aplicarFiltros()" placeholder="Nome ou código...">
          </div>
          <button class="btn-ghost" (click)="limparFiltros()">
            <i class="pi pi-filter-slash"></i> Limpar
          </button>
        </div>

        <!-- ABA: Saldos -->
        @if (abaAtiva() === 'saldos') {
          @if (carregando()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Carregando saldos...</p>
            </div>
          } @else if (saldosFiltrados().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">📋</span>
              <h3>Nenhum saldo encontrado</h3>
              <p>Ajuste os filtros ou realize uma entrada de estoque em um produto.</p>
            </div>
          } @else {
            <div class="saldos-table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Variação</th>
                    <th>Local</th>
                    <th class="text-right">Qtd. Atual</th>
                    <th class="text-right">Mínimo</th>
                    <th class="text-center">Status</th>
                    <th class="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  @for (saldo of saldosFiltrados(); track saldo.id) {
                    <tr [class.row-alerta]="saldo.abaixoMinimo">
                      <td>
                        <div class="produto-info">
                          <span class="produto-nome">{{ saldo.produtoNome }}</span>
                          @if (saldo.produtoCodigo) {
                            <span class="produto-codigo">{{ saldo.produtoCodigo }}</span>
                          }
                        </div>
                      </td>
                      <td>
                        @if (saldo.variacaoNome) {
                          <span class="variacao-badge">{{ saldo.variacaoNome }}</span>
                        } @else {
                          <span class="text-muted">—</span>
                        }
                      </td>
                      <td>
                        <span class="local-badge">{{ saldo.localEstoqueNome }}</span>
                      </td>
                      <td class="text-right">
                        <span class="qty-badge" [class.qty-low]="saldo.abaixoMinimo" [class.qty-ok]="!saldo.abaixoMinimo">
                          {{ saldo.quantidade }}
                        </span>
                      </td>
                      <td class="text-right text-muted">{{ saldo.estoqueMinimo }}</td>
                      <td class="text-center">
                        @if (saldo.abaixoMinimo) {
                          <span class="status-badge status-danger">⚠ Baixo</span>
                        } @else {
                          <span class="status-badge status-ok">✓ Normal</span>
                        }
                      </td>
                      <td class="text-center">
                        <div class="row-actions">
                          <button class="action-btn action-entrada" (click)="abrirMovimentacao(saldo, 'entrada')" matTooltip="Dar Entrada">
                            <i class="pi pi-plus-circle"></i>
                          </button>
                          <button class="action-btn action-saida" (click)="abrirMovimentacao(saldo, 'saida')" matTooltip="Dar Baixa">
                            <i class="pi pi-minus-circle"></i>
                          </button>
                          <button class="action-btn action-transfer" (click)="abrirTransferenciaComProduto(saldo)" matTooltip="Transferir">
                            <i class="pi pi-arrows-h"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }

        <!-- ABA: Movimentações -->
        @if (abaAtiva() === 'movimentacoes') {
          @if (carregandoMov()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Carregando movimentações...</p>
            </div>
          } @else if (movimentacoesFiltradas().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">📜</span>
              <h3>Nenhuma movimentação encontrada</h3>
              <p>As movimentações de estoque aparecerão aqui.</p>
            </div>
          } @else {
            <div class="saldos-table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Tipo</th>
                    <th>Produto</th>
                    <th>Local</th>
                    <th class="text-right">Qtd.</th>
                    <th class="text-right">Saldo Ant.</th>
                    <th class="text-right">Saldo Post.</th>
                    <th>Motivo / Ref.</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  @for (mov of movimentacoesFiltradas(); track mov.id) {
                    <tr>
                      <td class="text-sm">{{ formatarData(mov.dataMovimentacao) }}</td>
                      <td>
                        <span class="tipo-badge tipo-{{ mov.tipo.toLowerCase() }}">
                          {{ tipoLabel(mov.tipo) }}
                        </span>
                      </td>
                      <td>
                        <div class="produto-info">
                          <span class="produto-nome">{{ mov.produtoNome }}</span>
                          @if (mov.variacaoNome) {
                            <span class="produto-codigo">{{ mov.variacaoNome }}</span>
                          }
                        </div>
                      </td>
                      <td>
                        <span class="local-badge">{{ mov.localEstoqueNome }}</span>
                        @if (mov.localDestinoNome) {
                          <i class="pi pi-arrow-right text-xs mx-1"></i>
                          <span class="local-badge local-destino">{{ mov.localDestinoNome }}</span>
                        }
                      </td>
                      <td class="text-right font-bold">{{ mov.quantidade }}</td>
                      <td class="text-right text-muted">{{ mov.saldoAnterior }}</td>
                      <td class="text-right font-bold">{{ mov.saldoPosterior }}</td>
                      <td class="text-sm text-muted">{{ mov.motivo || mov.referenciaTipo || '—' }}</td>
                      <td class="text-sm text-muted">{{ mov.responsavel || '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }

        <!-- ABA: Alertas -->
        @if (abaAtiva() === 'alertas') {
          @if (alertas().length === 0) {
            <div class="empty-state success-state">
              <span class="empty-icon">✅</span>
              <h3>Tudo em ordem!</h3>
              <p>Nenhum produto está abaixo do estoque mínimo.</p>
            </div>
          } @else {
            <div class="alertas-grid">
              @for (alerta of alertas(); track alerta.id) {
                <div class="alerta-card">
                  <div class="alerta-header">
                    <span class="alerta-icon">⚠️</span>
                    <span class="alerta-tipo">Estoque Baixo</span>
                  </div>
                  <div class="alerta-produto">{{ alerta.produtoNome }}</div>
                  <div class="alerta-local">{{ alerta.localEstoqueNome }}</div>
                  <div class="alerta-numeros">
                    <div class="alerta-num alerta-atual">
                      <span class="num-label">Atual</span>
                      <span class="num-value text-red">{{ alerta.quantidade }}</span>
                    </div>
                    <div class="alerta-num">
                      <span class="num-label">Mínimo</span>
                      <span class="num-value">{{ alerta.estoqueMinimo }}</span>
                    </div>
                    <div class="alerta-num">
                      <span class="num-label">Diferença</span>
                      <span class="num-value text-orange">{{ alerta.estoqueMinimo - alerta.quantidade }}</span>
                    </div>
                  </div>
                  <button class="btn-alerta-action" (click)="abrirMovimentacaoAlerta(alerta)">
                    <i class="pi pi-plus-circle"></i> Dar Entrada
                  </button>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>

    <!-- Modal de Movimentação -->
    @if (modalMovAberto()) {
      <div class="modal-overlay" (click)="fecharModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ tipoMovimentacaoModal === 'entrada' ? '📥 Dar Entrada' : '📤 Dar Baixa' }}</h2>
            <button class="modal-close" (click)="fecharModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-field">
              <label>Produto</label>
              <input type="text" [value]="saldoSelecionado()?.produtoNome || ''" readonly>
            </div>
            @if (saldoSelecionado()?.variacaoNome) {
              <div class="modal-field">
                <label>Variação</label>
                <input type="text" [value]="saldoSelecionado()?.variacaoNome || ''" readonly>
              </div>
            }
            <div class="modal-field">
              <label>Local de Estoque</label>
              <select [(ngModel)]="movLocalId">
                @for (local of locais(); track local.id) {
                  <option [value]="local.id">{{ local.nome }}</option>
                }
              </select>
            </div>
            <div class="modal-field">
              <label>Quantidade</label>
              <input type="number" [(ngModel)]="movQuantidade" min="1" placeholder="0">
            </div>
            <div class="modal-field">
              <label>Motivo / Observação</label>
              <input type="text" [(ngModel)]="movMotivo" placeholder="Ex: Compra NF 001, Ajuste inventário...">
            </div>
            @if (tipoMovimentacaoModal === 'saida') {
              <div class="saldo-info-box">
                Saldo atual neste local: <strong>{{ saldoSelecionado()?.quantidade || 0 }} un</strong>
              </div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" (click)="fecharModal()">Cancelar</button>
            <button
              [class]="tipoMovimentacaoModal === 'entrada' ? 'btn-success' : 'btn-danger'"
              (click)="confirmarMovimentacao()"
              [disabled]="!movQuantidade || movQuantidade <= 0">
              {{ tipoMovimentacaoModal === 'entrada' ? 'Confirmar Entrada' : 'Confirmar Baixa' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal de Transferência -->
    @if (modalTransferenciaAberto()) {
      <div class="modal-overlay" (click)="fecharModalTransferencia()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>🔄 Transferência de Estoque</h2>
            <button class="modal-close" (click)="fecharModalTransferencia()">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-field">
              <label>Produto *</label>
              <select [(ngModel)]="transferenciaForm.produtoId" (change)="onProdutoTransferenciaChange()">
                <option value="">Selecione um produto</option>
                @for (p of produtos(); track p.id) {
                  <option [value]="p.id">{{ p.nome }}</option>
                }
              </select>
            </div>
            <div class="transferencia-locais">
              <div class="modal-field">
                <label>Local de Origem *</label>
                <select [(ngModel)]="transferenciaForm.origemId">
                  <option value="">Selecione...</option>
                  @for (local of locais(); track local.id) {
                    <option [value]="local.id">{{ local.nome }}</option>
                  }
                </select>
              </div>
              <div class="transferencia-arrow">→</div>
              <div class="modal-field">
                <label>Local de Destino *</label>
                <select [(ngModel)]="transferenciaForm.destinoId">
                  <option value="">Selecione...</option>
                  @for (local of locais(); track local.id) {
                    <option [value]="local.id" [disabled]="local.id === transferenciaForm.origemId">
                      {{ local.nome }}
                    </option>
                  }
                </select>
              </div>
            </div>
            <div class="modal-field">
              <label>Quantidade *</label>
              <input type="number" [(ngModel)]="transferenciaForm.quantidade" min="1" placeholder="0">
            </div>
            <div class="modal-field">
              <label>Motivo</label>
              <input type="text" [(ngModel)]="transferenciaForm.motivo" placeholder="Ex: Rebalanceamento de estoque...">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" (click)="fecharModalTransferencia()">Cancelar</button>
            <button class="btn-primary" (click)="confirmarTransferencia()"
              [disabled]="!transferenciaForm.produtoId || !transferenciaForm.origemId || !transferenciaForm.destinoId || !transferenciaForm.quantidade">
              <i class="pi pi-arrows-h"></i> Transferir
            </button>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    :host { display: block; }

    .estoque-container {
      min-height: 100vh;
      background: #f0f4fb;
      font-family: 'Inter', sans-serif;
    }

    /* ─── Header ─── */
    .estoque-header {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 60%, #3b82c4 100%);
      padding: 2rem 2rem 0;
      color: white;
    }
    .header-content {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .header-title { display: flex; align-items: center; gap: 1rem; }
    .header-icon {
      width: 52px; height: 52px;
      background: rgba(255,255,255,0.15);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
      backdrop-filter: blur(10px);
    }
    .header-title h1 { font-size: 1.75rem; font-weight: 700; margin: 0; }
    .header-title p { font-size: 0.875rem; opacity: 0.75; margin: 0.25rem 0 0; }
    .header-actions { display: flex; gap: 0.75rem; align-items: center; }

    /* KPIs */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      background: rgba(255,255,255,0.15);
      border-radius: 16px 16px 0 0;
      overflow: hidden;
      margin-top: 1rem;
    }
    .kpi-card {
      background: rgba(255,255,255,0.08);
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: background 0.2s;
    }
    .kpi-card:hover { background: rgba(255,255,255,0.15); }
    .kpi-card.has-alert { background: rgba(239,68,68,0.3); }
    .kpi-icon { font-size: 1.75rem; }
    .kpi-value { font-size: 1.75rem; font-weight: 700; display: block; }
    .kpi-label { font-size: 0.75rem; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.05em; }

    /* ─── Abas ─── */
    .tabs-bar {
      background: white;
      display: flex;
      padding: 0 2rem;
      border-bottom: 2px solid #e2e8f0;
      gap: 0;
    }
    .tab-btn {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 1rem 1.5rem;
      border: none;
      background: transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
      position: relative;
    }
    .tab-btn:hover { color: #2d6a9f; }
    .tab-btn.active { color: #2d6a9f; border-bottom-color: #2d6a9f; }
    .badge-alert {
      background: #ef4444;
      color: white;
      border-radius: 9999px;
      font-size: 0.65rem;
      padding: 0.1rem 0.4rem;
      font-weight: 700;
    }

    /* ─── Tab Content ─── */
    .tab-content { padding: 1.5rem 2rem; }

    /* Filtros */
    .filters-row {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }
    .filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .filter-group label { font-size: 0.75rem; font-weight: 600; color: #475569; text-transform: uppercase; }
    .filter-group select,
    .filter-group input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.875rem;
      background: white;
      color: #1e293b;
      min-width: 180px;
    }
    .filter-group select:focus,
    .filter-group input:focus { outline: none; border-color: #2d6a9f; }

    /* ─── Tabela ─── */
    .saldos-table-wrapper {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      overflow: auto;
    }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .data-table th {
      background: #f8fafc;
      color: #475569;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.875rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table td {
      padding: 0.875rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: middle;
    }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tbody tr:hover { background: #f8fafc; }
    .data-table tr.row-alerta { background: #fff5f5; }
    .data-table tr.row-alerta:hover { background: #fee2e2; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-muted { color: #94a3b8; }
    .text-sm { font-size: 0.8rem; }
    .font-bold { font-weight: 600; }

    /* Badges */
    .produto-info { display: flex; flex-direction: column; gap: 0.15rem; }
    .produto-nome { font-weight: 500; color: #1e293b; }
    .produto-codigo { font-size: 0.75rem; color: #94a3b8; font-family: monospace; }
    .variacao-badge {
      background: #e0e7ff; color: #4338ca;
      padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 500;
    }
    .local-badge {
      background: #dbeafe; color: #1d4ed8;
      padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem;
    }
    .local-destino { background: #dcfce7; color: #16a34a; }

    .qty-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .qty-ok { background: #dcfce7; color: #16a34a; }
    .qty-low { background: #fee2e2; color: #dc2626; }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-ok { background: #dcfce7; color: #16a34a; }
    .status-danger { background: #fee2e2; color: #dc2626; }

    .tipo-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .tipo-entrada { background: #dcfce7; color: #16a34a; }
    .tipo-saida { background: #fee2e2; color: #dc2626; }
    .tipo-transferencia { background: #dbeafe; color: #1d4ed8; }
    .tipo-ajuste { background: #fef3c7; color: #d97706; }
    .tipo-devolucao { background: #f3e8ff; color: #7c3aed; }

    /* Row actions */
    .row-actions { display: flex; gap: 0.35rem; justify-content: center; }
    .action-btn {
      width: 30px; height: 30px;
      border: none; border-radius: 6px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem;
      transition: all 0.15s;
    }
    .action-entrada { background: #dcfce7; color: #16a34a; }
    .action-entrada:hover { background: #16a34a; color: white; }
    .action-saida { background: #fee2e2; color: #dc2626; }
    .action-saida:hover { background: #dc2626; color: white; }
    .action-transfer { background: #dbeafe; color: #2d6a9f; }
    .action-transfer:hover { background: #2d6a9f; color: white; }

    /* Estados */
    .loading-state, .empty-state {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 4rem; gap: 1rem;
      background: white; border-radius: 12px;
      color: #64748b;
    }
    .empty-icon { font-size: 3rem; }
    .empty-state h3 { font-size: 1.125rem; font-weight: 600; color: #1e293b; margin: 0; }
    .empty-state p { font-size: 0.875rem; margin: 0; }
    .success-state { background: #f0fdf4; }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #2d6a9f;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ─── Alertas Grid ─── */
    .alertas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
    .alerta-card {
      background: white;
      border: 1.5px solid #fecaca;
      border-radius: 14px;
      padding: 1.25rem;
      box-shadow: 0 2px 8px rgba(239,68,68,0.1);
    }
    .alerta-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .alerta-tipo { font-size: 0.75rem; font-weight: 600; color: #dc2626; text-transform: uppercase; }
    .alerta-produto { font-size: 1rem; font-weight: 600; color: #1e293b; margin-bottom: 0.25rem; }
    .alerta-local { font-size: 0.8rem; color: #64748b; margin-bottom: 1rem; }
    .alerta-numeros { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1rem; }
    .alerta-num { text-align: center; }
    .num-label { display: block; font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .num-value { display: block; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
    .text-red { color: #dc2626 !important; }
    .text-orange { color: #d97706 !important; }
    .btn-alerta-action {
      width: 100%;
      padding: 0.6rem;
      background: linear-gradient(135deg, #16a34a, #22c55e);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      transition: all 0.2s;
    }
    .btn-alerta-action:hover { opacity: 0.9; transform: translateY(-1px); }

    /* ─── Botões ─── */
    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: white; color: #2d6a9f;
      border: none; border-radius: 10px;
      font-size: 0.875rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-primary:hover { background: #e0f0ff; }
    .btn-outline {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: rgba(255,255,255,0.15); color: white;
      border: 1px solid rgba(255,255,255,0.3); border-radius: 10px;
      font-size: 0.875rem; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-outline:hover { background: rgba(255,255,255,0.25); }
    .btn-ghost {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 1rem;
      background: transparent; color: #64748b;
      border: 1px solid #cbd5e1; border-radius: 8px;
      font-size: 0.875rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-ghost:hover { background: #f1f5f9; }

    /* ─── Modal ─── */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-box {
      background: white;
      border-radius: 16px;
      width: 100%; max-width: 500px;
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
    .modal-close {
      background: none; border: none;
      font-size: 1.125rem; color: #94a3b8;
      cursor: pointer; line-height: 1; padding: 0.25rem;
    }
    .modal-close:hover { color: #1e293b; }
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .modal-field { display: flex; flex-direction: column; gap: 0.375rem; }
    .modal-field label { font-size: 0.8rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; }
    .modal-field input,
    .modal-field select {
      padding: 0.625rem 0.875rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #1e293b;
      background: white;
    }
    .modal-field input:focus,
    .modal-field select:focus { outline: none; border-color: #2d6a9f; }
    .modal-field input[readonly] { background: #f8fafc; cursor: not-allowed; }
    .saldo-info-box {
      background: #dbeafe;
      color: #1d4ed8;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
    }
    .modal-footer {
      padding: 1.25rem 1.5rem;
      display: flex; justify-content: flex-end; gap: 0.75rem;
      border-top: 1px solid #f1f5f9;
      background: #f8fafc;
    }
    .btn-success {
      padding: 0.625rem 1.5rem;
      background: linear-gradient(135deg, #16a34a, #22c55e);
      color: white; border: none; border-radius: 8px;
      font-weight: 600; font-size: 0.9rem; cursor: pointer;
    }
    .btn-success:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-danger {
      padding: 0.625rem 1.5rem;
      background: linear-gradient(135deg, #dc2626, #ef4444);
      color: white; border: none; border-radius: 8px;
      font-weight: 600; font-size: 0.9rem; cursor: pointer;
    }
    .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Transferência */
    .transferencia-locais {
      display: flex; align-items: flex-end; gap: 0.5rem;
    }
    .transferencia-locais .modal-field { flex: 1; }
    .transferencia-arrow {
      font-size: 1.25rem; color: #2d6a9f;
      padding-bottom: 0.5rem; font-weight: bold;
    }

    /* Responsivo */
    @media (max-width: 768px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .header-content { flex-direction: column; }
      .tab-content { padding: 1rem; }
      .tabs-bar { padding: 0 1rem; overflow-x: auto; }
    }
  `]
})
export class EstoqueComponent implements OnInit {
    private estoqueService = inject(EstoqueService);
    private produtoService = inject(ProdutoService);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);

    // ─── Signals de Estado ────────────────────────────────────────────────────
    abaAtiva = signal<Aba>('saldos');
    carregando = signal(false);
    carregandoMov = signal(false);

    saldos = signal<any[]>([]);
    movimentacoes = signal<MovimentacaoEstoque[]>([]);
    alertas = signal<any[]>([]);
    locais = signal<LocalEstoque[]>([]);
    produtos = signal<Produto[]>([]);

    saldosFiltrados = signal<any[]>([]);
    movimentacoesFiltradas = signal<MovimentacaoEstoque[]>([]);

    totalItens = signal(0);

    // Filtros
    filtroLocalId = '';
    filtroBusca = '';

    // Modal Movimentação
    modalMovAberto = signal(false);
    saldoSelecionado = signal<any>(null);
    tipoMovimentacaoModal: 'entrada' | 'saida' = 'entrada';
    movLocalId = '';
    movQuantidade = 0;
    movMotivo = '';

    // Modal Transferência
    modalTransferenciaAberto = signal(false);
    transferenciaForm = {
        produtoId: '',
        origemId: '',
        destinoId: '',
        quantidade: 0,
        motivo: ''
    };

    ngOnInit(): void {
        this.carregarLocais();
        this.carregarSaldos();
        this.carregarAlertas();
        this.carregarProdutos();
    }

    mudarAba(aba: Aba): void {
        this.abaAtiva.set(aba);
        if (aba === 'movimentacoes' && this.movimentacoes().length === 0) {
            this.carregarMovimentacoes();
        }
    }

    private carregarLocais(): void {
        this.estoqueService.listarLocaisObs().subscribe({
            next: (data) => this.locais.set(data.filter(l => l.ativo))
        });
    }

    private carregarSaldos(): void {
        this.carregando.set(true);
        this.estoqueService.listarSaldos().subscribe({
            next: (data) => {
                this.saldos.set(data);
                this.saldosFiltrados.set(data);
                this.totalItens.set(data.reduce((acc, s) => acc + (s.quantidade || 0), 0));
            },
            error: () => {
                this.carregando.set(false);
                this.snackBar.open('Erro ao carregar saldos de estoque', 'OK', { duration: 3000 });
            },
            complete: () => this.carregando.set(false)
        });
    }

    private carregarMovimentacoes(): void {
        this.carregandoMov.set(true);
        this.estoqueService.listarMovimentacoes().subscribe({
            next: (data) => {
                this.movimentacoes.set(data);
                this.movimentacoesFiltradas.set(data);
            },
            error: () => this.carregandoMov.set(false),
            complete: () => this.carregandoMov.set(false)
        });
    }

    private carregarAlertas(): void {
        this.estoqueService.listarSaldos().subscribe({
            next: (data) => {
                this.alertas.set(data.filter((s: any) => s.abaixoMinimo));
            }
        });
    }

    private carregarProdutos(): void {
        this.produtoService.listarAtivos().subscribe({
            next: (data) => this.produtos.set(data)
        });
    }

    aplicarFiltros(): void {
        let filtrado = this.saldos();
        if (this.filtroLocalId) {
            filtrado = filtrado.filter(s => s.localEstoqueId === this.filtroLocalId);
        }
        if (this.filtroBusca) {
            const termo = this.filtroBusca.toLowerCase();
            filtrado = filtrado.filter(s =>
                (s.produtoNome || '').toLowerCase().includes(termo) ||
                (s.produtoCodigo || '').toLowerCase().includes(termo) ||
                (s.variacaoNome || '').toLowerCase().includes(termo)
            );
        }
        this.saldosFiltrados.set(filtrado);

        // Também filtrar movimentações se estiver na aba
        let filtradoMov = this.movimentacoes();
        if (this.filtroLocalId) {
            filtradoMov = filtradoMov.filter(m => m.localEstoqueId === this.filtroLocalId || m.localDestinoId === this.filtroLocalId);
        }
        if (this.filtroBusca) {
            const termo = this.filtroBusca.toLowerCase();
            filtradoMov = filtradoMov.filter(m => (m.produtoNome || '').toLowerCase().includes(termo));
        }
        this.movimentacoesFiltradas.set(filtradoMov);
    }

    limparFiltros(): void {
        this.filtroLocalId = '';
        this.filtroBusca = '';
        this.saldosFiltrados.set(this.saldos());
        this.movimentacoesFiltradas.set(this.movimentacoes());
    }

    irParaLocais(): void {
        this.router.navigate(['/estoque/locais']);
    }

    // ─── Modal Movimentação ─────────────────────────────────────────────────────

    abrirMovimentacao(saldo: any, tipo: 'entrada' | 'saida'): void {
        this.saldoSelecionado.set(saldo);
        this.tipoMovimentacaoModal = tipo;
        this.movLocalId = saldo.localEstoqueId || '';
        this.movQuantidade = 0;
        this.movMotivo = '';
        this.modalMovAberto.set(true);
    }

    abrirMovimentacaoAlerta(alerta: any): void {
        this.abrirMovimentacao(alerta, 'entrada');
    }

    fecharModal(): void {
        this.modalMovAberto.set(false);
    }

    confirmarMovimentacao(): void {
        const saldo = this.saldoSelecionado();
        if (!saldo || !this.movQuantidade || this.movQuantidade <= 0) return;

        const obs$ = this.tipoMovimentacaoModal === 'entrada'
            ? this.estoqueService.darEntrada(saldo.produtoId, this.movQuantidade, this.movLocalId || undefined, saldo.variacaoId || undefined, this.movMotivo)
            : this.estoqueService.darBaixa(saldo.produtoId, this.movQuantidade, this.movLocalId || undefined, saldo.variacaoId || undefined, this.movMotivo);

        obs$.subscribe({
            next: () => {
                const msg = this.tipoMovimentacaoModal === 'entrada'
                    ? `✅ Entrada de ${this.movQuantidade} unidades registrada`
                    : `✅ Baixa de ${this.movQuantidade} unidades registrada`;
                this.snackBar.open(msg, 'OK', { duration: 3000 });
                this.fecharModal();
                this.carregarSaldos();
                this.carregarAlertas();
                if (this.abaAtiva() === 'movimentacoes') this.carregarMovimentacoes();
            },
            error: (err) => {
                const msg = err?.error?.message || 'Erro ao registrar movimentação';
                this.snackBar.open(msg, 'OK', { duration: 4000 });
            }
        });
    }

    // ─── Modal Transferência ─────────────────────────────────────────────────────

    abrirTransferencia(): void {
        this.transferenciaForm = { produtoId: '', origemId: '', destinoId: '', quantidade: 0, motivo: '' };
        this.modalTransferenciaAberto.set(true);
    }

    abrirTransferenciaComProduto(saldo: any): void {
        this.transferenciaForm = {
            produtoId: saldo.produtoId || '',
            origemId: saldo.localEstoqueId || '',
            destinoId: '',
            quantidade: 0,
            motivo: ''
        };
        this.modalTransferenciaAberto.set(true);
    }

    fecharModalTransferencia(): void {
        this.modalTransferenciaAberto.set(false);
    }

    onProdutoTransferenciaChange(): void {
        this.transferenciaForm.origemId = '';
        this.transferenciaForm.destinoId = '';
    }

    confirmarTransferencia(): void {
        const f = this.transferenciaForm;
        if (!f.produtoId || !f.origemId || !f.destinoId || !f.quantidade) return;
        if (f.origemId === f.destinoId) {
            this.snackBar.open('Origem e destino não podem ser iguais', 'OK', { duration: 3000 });
            return;
        }

        this.estoqueService.transferir(f.produtoId, f.origemId, f.destinoId, f.quantidade, undefined, f.motivo).subscribe({
            next: () => {
                this.snackBar.open(`✅ Transferência de ${f.quantidade} unidades realizada com sucesso`, 'OK', { duration: 3000 });
                this.fecharModalTransferencia();
                this.carregarSaldos();
                if (this.abaAtiva() === 'movimentacoes') this.carregarMovimentacoes();
            },
            error: (err) => {
                const msg = err?.error?.message || 'Erro ao realizar transferência';
                this.snackBar.open(msg, 'OK', { duration: 4000 });
            }
        });
    }

    // ─── Utilitários ─────────────────────────────────────────────────────────────

    formatarData(data?: string): string {
        if (!data) return '—';
        return new Date(data).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    tipoLabel(tipo: string): string {
        const labels: any = {
            'ENTRADA': '↑ Entrada',
            'SAIDA': '↓ Saída',
            'TRANSFERENCIA': '⇄ Transferência',
            'AJUSTE': '✎ Ajuste',
            'DEVOLUCAO': '↩ Devolução'
        };
        return labels[tipo] || tipo;
    }
}
