import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpParams } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { InputNumberModule } from 'primeng/inputnumber';

import { NfseService, NotaFiscalServico } from '../../core/services/nfse.service';
import { ClienteService, Cliente } from '../../core/services/cadastros/cliente.service';
import { environment } from '../../../environments/environment';

interface FiscalOpt { codigo: string; descricao: string; }
interface ServicoOpt { id: string; nome: string; codigoCnae?: string; itemLc116?: string; codigoNbs?: string; aliquotaIss?: number; descricaoNota?: string; preco?: number; }

@Component({
  selector: 'app-nfse-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputNumberModule],
  template: `
    <div class="form-page">

      <!-- ── Topbar ── -->
      <div class="form-topbar">
        <div>
          <div class="breadcrumb">
            <a (click)="voltar()">Fatura NFS-e</a>
            <span class="sep">›</span>
            <span>{{ readonlyMode() ? 'Visualizar NFS-e' : (editMode ? 'Editar NFS-e' : 'Criar Fatura Nfse') }}</span>
          </div>
          <h1>{{ readonlyMode() ? 'Visualizando Nota Fiscal de Serviço' : (editMode ? 'Editar Nota Fiscal de Serviço' : 'Criar Fatura Nfse') }}</h1>
        </div>
        
        @if (!readonlyMode()) {
          <button class="btn-criar" (click)="salvarEEmitir()" [disabled]="salvando()">
            <i class="pi pi-check"></i>
            {{ salvando() ? 'Processando...' : (editMode ? 'Salvar e Emitir' : '✓ Criar Nota') }}
          </button>
        } @else {
          <div class="status-badge-top status-{{form.status?.toLowerCase()}}">
            {{ form.status }}
          </div>
        }
      </div>

      @if (carregando()) {
        <div class="loading-page">
          <div class="spinner-lg"></div><p>Carregando...</p>
        </div>
      } @else {

      <fieldset [disabled]="readonlyMode()" style="border:none; padding:0; margin:0; min-width:0;">

      <!-- ══ SEÇÃO 1: Tomador ══ -->
      <div class="form-card">
        <div class="card-title">Dados do Tomador e Emissão</div>
        <div class="fields-row">
          <div class="field" style="flex:0 0 190px">
            <label>Identificação Interna</label>
            <input class="input-readonly" readonly [value]="'RPS: ' + (form.numeroRps || 'Auto')">
          </div>
          <div class="field" style="flex:0 0 220px">
            <label>Natureza da Operação <span class="req">*</span></label>
            <select [(ngModel)]="form.naturezaOperacao">
              <option value="1">1 – Exigível</option>
              <option value="2">2 – Não Incidência</option>
              <option value="3">3 – Isenção</option>
              <option value="4">4 – Exportação</option>
              <option value="5">5 – Imunidade</option>
              <option value="6">6 – Susp. Decisão Judicial</option>
              <option value="7">7 – Susp. Proc. Administrativo</option>
            </select>
          </div>
          <div class="field flex-grow">
            <label>Cliente (Tomador) <span class="req">*</span></label>
            <div class="input-combo">
              <div class="search-wrapper">
                <input type="text" [(ngModel)]="clienteBusca"
                  (input)="onClienteBusca($event)"
                  placeholder="Buscar cliente..."
                  [class.has-val]="form.clienteId">
                @if (clienteSelecionadoNome()) {
                  <div class="selected-client">
                    <span class="client-tag">{{ clienteSelecionadoNome() }}</span>
                    <button class="clear-btn" (click)="limparCliente()">✕</button>
                  </div>
                }
                @if (clientesDropdown().length > 0 && !form.clienteId) {
                  <div class="dropdown-list">
                    @for (c of clientesDropdown(); track c.id) {
                      <div class="dropdown-item" (click)="selecionarCliente(c)">
                        <span class="item-nome">{{ c.razaoSocial || c.name + ' ' + (c.lastName || '') }}</span>
                        <span class="item-doc">{{ c.cpf }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
              <button class="btn-add-inline" (click)="novoCliente()" title="Novo Cliente">+</button>
            </div>
          </div>
        </div>

        <div class="field mt-1" style="max-width: 500px;">
          <label>E-mails de Envio</label>
          <div class="emails-tags">
            @for (email of emailsCliente(); track email) {
              <label class="email-opt">
                <input type="checkbox" [value]="email" (change)="toggleEmail(email, $event)">
                {{ email }}
              </label>
            }
            @if (emailsCliente().length === 0) {
              <span class="empty-emails">Selecione um cliente para ver e-mails disponíveis</span>
            }
          </div>
        </div>
      </div>

      <!-- ══ SEÇÃO 2: Serviço ══ -->
      <div class="form-card">
        <div class="card-title">Detalhes do Serviço</div>

        <!-- Busca autocomplete de serviço -->
        <div class="field mb-2" style="max-width: 560px">
          <label>🔍 Buscar Serviço no Catálogo</label>
          <div class="search-wrapper">
            <input type="text" [(ngModel)]="servicoBusca"
              (input)="onServicoBusca()"
              placeholder="Digite o nome do serviço..."
              [class.has-val]="servicoSelecionadoId()"
              [disabled]="!!servicoSelecionadoId()">
            @if (servicoSelecionadoId()) {
              <div class="selected-client" style="background:#f0fdf4">
                <span class="client-tag">✓ {{ servicoBusca }}</span>
                <button class="clear-btn" (click)="limparServico()" title="Limpar serviço">✕</button>
              </div>
            }
            @if (servicoDropdown().length > 0 && !servicoSelecionadoId()) {
              <div class="dropdown-list">
                @for (s of servicoDropdown(); track s.id) {
                  <div class="dropdown-item" (click)="selecionarServico(s)">
                    <span class="item-nome">{{ s.nome }}</span>
                    @if (s.aliquotaIss) {
                      <span class="item-doc">ISS {{ s.aliquotaIss }}% · LC116: {{ s.itemLc116 || '—' }}</span>
                    }
                  </div>
                }
              </div>
            }
          </div>
          <span class="hint">💡 Preenche automaticamente: discriminação, CNAE, NBS, LC116 e alíquota ISS</span>
        </div>

        <div class="fields-row">
          <div class="field flex-grow">
            <label>Discriminação do Serviço <span class="req">*</span></label>
            <textarea [(ngModel)]="form.discriminacaoServico" rows="5"
              placeholder="Descreva detalhadamente o serviço prestado..." id="discriminacao-servico"></textarea>
          </div>
          <div class="field flex-grow">
            <label>Informações Complementares</label>
            <textarea [(ngModel)]="form.informacoesComplementares" rows="5"
              placeholder="Informações adicionais sobre o serviço..."></textarea>
          </div>
        </div>
      </div>

      <!-- ══ SEÇÃO 3: Datas e Local ══ -->
      <div class="form-card">
        <div class="card-title">Datas e Local</div>
        <div class="fields-row">
          <div class="field">
            <label>Vencimento <span class="req">*</span></label>
            <input type="date" [(ngModel)]="form.dataVencimento">
          </div>
          <div class="field">
            <label>Competência <span class="req">*</span></label>
            <input type="date" [(ngModel)]="form.dataCompetencia">
          </div>
          <div class="field">
            <label>Condição Pagamento</label>
            <select [(ngModel)]="condicaoPagamento">
              <option value="outros">Outros</option>
              <option value="a_vista">À Vista</option>
              <option value="30">30 dias</option>
              <option value="60">60 dias</option>
              <option value="parcelado">Parcelado</option>
            </select>
          </div>
          <div class="field">
            <label>UF Prestação</label>
            <select [(ngModel)]="form.ufPrestacao" (change)="onUfChange()">
              @for (uf of ufs; track uf) {
                <option [value]="uf">{{ uf }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Cidade como autocomplete IBGE -->
        <div class="field mt-1" style="max-width: 400px">
          <label>Cidade Prestação <span class="req">*</span></label>
          <div class="autocomplete-field">
            @if (!form.municipioIbge) {
              <input type="text" [(ngModel)]="cidadeBusca"
                (input)="onCidadeBusca()"
                placeholder="Buscar cidade..."
                id="cidade-input">
              @if (cidadeDropdown().length > 0) {
                <div class="dropdown-list">
                  @for (m of cidadeDropdown(); track m.codigo) {
                    <div class="dropdown-item" (click)="selecionarCidade(m)">
                      <span class="item-nome">{{ m.nome }}</span>
                      <span class="item-doc small">{{ m.uf }}</span>
                    </div>
                  }
                </div>
              }
            } @else {
              <div class="selected-tag">
                <span>🏙️ {{ cidadeNomeSelecionado }}</span>
                <button (click)="limparCidade()" title="Trocar cidade">✕</button>
              </div>
            }
          </div>
          @if (!form.municipioIbge) {
            <span class="hint">💡 Selecione o cliente primeiro — a cidade será preenchida automaticamente</span>
          }
        </div>
      </div>

      <!-- ══ SEÇÃO 4: Tributação ══ -->
      <div class="form-card">
        <div class="card-title">Tributação e Totais</div>

        <!-- CNAE → NBS → LC116 (cascata) -->
        <div class="fields-row mb-2">
          <div class="field flex-grow" style="position:relative">
            <label>CNAE <span class="req">*</span></label>
            <div class="autocomplete-field">
              @if (!form.codigoCnae) {
                <input type="text" [(ngModel)]="cnaeBusca"
                  (input)="onCnaeBusca()"
                  placeholder="Buscar CNAE (código ou descrição)..."
                  id="cnae-input">
                @if (cnaeDropdown().length > 0) {
                  <div class="dropdown-list">
                    @for (c of cnaeDropdown(); track c.codigo) {
                      <div class="dropdown-item" (click)="selecionarCnae(c)">
                        <span class="item-nome">{{ c.codigo }}</span>
                        <span class="item-doc small">{{ c.descricao | slice:0:70 }}</span>
                      </div>
                    }
                  </div>
                }
              } @else {
                <div class="selected-tag">
                  <span>📋 {{ form.codigoCnae }} — {{ cnaeSelecionadoDesc }}</span>
                  <button (click)="limparCnae()" title="Limpar CNAE">✕</button>
                </div>
              }
            </div>
          </div>

          <div class="field flex-grow">
            <label>Item LC 116 (Serviço) <span class="req">*</span></label>
            <select [(ngModel)]="form.itemLc116" (change)="onLc116Change()">
              <option value="" disabled>Selecione uma opção</option>
              @if (lc116Opts().length === 0) {
                <option value="" disabled>Selecione o NBS primeiro...</option>
              }
              @for (item of lc116Opts(); track item.codigo) {
                <option [value]="item.codigo">{{ item.codigo }} — {{ item.descricao | slice:0:70 }}</option>
              }
            </select>
          </div>

          <div class="field flex-grow">
            <label>Código NBS (Padrão Nacional) <span class="req">*</span></label>
            <div class="autocomplete-field">
              @if (!form.codigoNbs) {
                <input type="text" [(ngModel)]="nbsBusca"
                  (input)="onNbsBusca()"
                  placeholder="Buscar NBS (código ou descrição)..."
                  id="nbs-input">
                @if (nbsDropdown().length > 0) {
                  <div class="dropdown-list">
                    @for (n of nbsDropdown(); track n.codigo) {
                      <div class="dropdown-item" (click)="selecionarNbs(n)">
                        <span class="item-nome">{{ n.codigo }}</span>
                        <span class="item-doc small">{{ n.descricao | slice:0:70 }}</span>
                      </div>
                    }
                  </div>
                }
              } @else {
                <div class="selected-tag">
                  <span>📋 {{ form.codigoNbs }} — {{ nbsSelecionadoDesc }}</span>
                  <button (click)="limparNbs()" title="Limpar NBS">✕</button>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Reter ISS -->
        <div class="iss-row">
          <span class="iss-label">Reter ISS?</span>
          <label class="radio-pill" [class.on]="form.issRetido === true">
            <input type="radio" [value]="true" [(ngModel)]="form.issRetido" (change)="recalcular()">
            Sim
          </label>
          <label class="radio-pill" [class.on]="!form.issRetido">
            <input type="radio" [value]="false" [(ngModel)]="form.issRetido" (change)="recalcular()">
            Não
          </label>
        </div>

        <!-- Totais -->
        <div class="totais-grid">
          <div class="total-col">
            <label>Valor Serviço (R$) <span class="req">*</span></label>
            <div class="money-box p-inputnumber-wrapper">
              <p-inputNumber [(ngModel)]="form.valorServicos" (ngModelChange)="recalcular()"
                mode="currency" currency="BRL" locale="pt-BR"
                styleClass="w-full" inputStyleClass="money-p-input" placeholder="R$ 0,00">
              </p-inputNumber>
            </div>
          </div>
          <div class="total-col">
            <label>Desconto (R$)</label>
            <div class="money-box p-inputnumber-wrapper">
              <p-inputNumber [(ngModel)]="form.valorDesconto" (ngModelChange)="recalcular()"
                mode="currency" currency="BRL" locale="pt-BR"
                styleClass="w-full" inputStyleClass="money-p-input" placeholder="R$ 0,00">
              </p-inputNumber>
            </div>
          </div>
          <div class="total-col">
            <label>Alíquota ISS (%)</label>
            <div class="money-box">
              <input type="text" inputmode="decimal"
                [value]="form.aliquotaIss || ''"
                (input)="onAliquotaInput($event)"
                placeholder="0,00"
                maxlength="6">
              <span class="suffix">%</span>
            </div>
          </div>
          <div class="total-col result-col">
            <label>Valor ISS</label>
            <div class="money-box p-inputnumber-wrapper readonly">
              <p-inputNumber [ngModel]="valorIssCalc" mode="currency" currency="BRL" locale="pt-BR"
                styleClass="w-full" inputStyleClass="money-p-input readonly-input" [readonly]="true">
              </p-inputNumber>
            </div>
          </div>
          <div class="total-col highlight-col">
            <label>LÍQUIDO A RECEBER</label>
            <div class="money-box p-inputnumber-wrapper liquido">
              <p-inputNumber [ngModel]="valorLiquidoCalc" mode="currency" currency="BRL" locale="pt-BR"
                styleClass="w-full" inputStyleClass="money-p-input liquido-input" [readonly]="true">
              </p-inputNumber>
            </div>
          </div>
        </div>

        <!-- Resumo -->
        @if ((form.valorServicos || 0) > 0) {
          <div class="resumo">
            <div class="resumo-row">
              <span>Valor dos Serviços</span>
              <span>{{ (form.valorServicos || 0) | currency: 'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="resumo-row" *ngIf="(form.valorDesconto || 0) > 0">
              <span>(-) Desconto</span>
              <span class="val-red">- {{ (form.valorDesconto || 0) | currency: 'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="resumo-row">
              <span>Base de Cálculo ISS</span>
              <span>{{ baseCalculo | currency: 'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="resumo-row" [class.val-red]="form.issRetido">
              <span>ISS {{ form.aliquotaIss }}% {{ form.issRetido ? '(Retido pelo tomador)' : '' }}</span>
              <span>{{ valorIssCalc | currency: 'BRL':'symbol':'1.2-2' }}</span>
            </div>
            <div class="resumo-row resumo-total">
              <span>Líquido a Receber</span>
              <span>{{ valorLiquidoCalc | currency: 'BRL':'symbol':'1.2-2' }}</span>
            </div>
          </div>
        }
      </div> <!-- /form-card Tributação -->
      </fieldset>

      <!-- ── Ações ── -->
      <div class="form-actions">
        <button class="btn-cancelar" (click)="voltar()">← {{ readonlyMode() ? 'Voltar' : 'Cancelar' }}</button>
        @if (!readonlyMode()) {
          <div class="actions-right">
            <button class="btn-rascunho" (click)="salvar()" [disabled]="salvando()">
              💾 Salvar Rascunho
            </button>
            <button class="btn-emitir-now" (click)="salvarEEmitir()" [disabled]="salvando()">
              🚀 {{ editMode ? 'Salvar e Emitir' : 'Criar e Emitir' }}
            </button>
          </div>
        }
      </div>

      } <!-- /!carregando -->
    </div>
  `,
  styles: [`
    :host { display: block; }

    .form-page {
      min-height: 100vh; background: #f0f4fb;
      padding: 1.75rem 2rem 3rem; font-family: 'Inter', sans-serif;
    }

    /* ── Topbar ── */
    .form-topbar {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 1.75rem; gap: 1rem; flex-wrap: wrap;
    }
    .breadcrumb { font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.35rem; display: flex; gap: 0.4rem; align-items: center; }
    .breadcrumb a { cursor: pointer; color: #2d6a9f; }
    .breadcrumb a:hover { text-decoration: underline; }
    .sep { color: #cbd5e1; }
    h1 { font-size: 1.6rem; font-weight: 700; color: #1e293b; margin: 0; }
    .btn-criar {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1.75rem;
      background: #f59e0b; color: white; border: none; border-radius: 10px;
      font-size: 0.95rem; font-weight: 700; cursor: pointer; white-space: nowrap;
    }
    .btn-criar:hover { background: #d97706; }
    .btn-criar:disabled { opacity: 0.6; cursor: not-allowed; }

    /* ── Card ── */
    .form-card {
      background: white; border-radius: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      padding: 1.75rem; margin-bottom: 1.25rem;
    }
    .card-title {
      font-size: 1rem; font-weight: 700; color: #1e293b;
      padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; margin-bottom: 1.25rem;
    }

    /* ── Fields ── */
    .fields-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .flex-grow { flex: 1 1 200px; min-width: 0; }
    .field { display: flex; flex-direction: column; gap: 0.375rem; }
    .field label { font-size: 0.77rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; }
    .req { color: #ef4444; }
    .hint { font-size: 0.73rem; color: #94a3b8; margin-top: 0.2rem; }
    .mb-1 { margin-bottom: 1rem; }
    .mb-2 { margin-bottom: 1.25rem; }
    .mt-1 { margin-top: 1rem; }

    .field input, .field select, .field textarea {
      padding: 0.6rem 0.875rem;
      border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-size: 0.9rem; color: #1e293b; background: white;
      transition: border-color 0.15s; width: 100%; box-sizing: border-box; resize: vertical;
    }
    .field input:focus, .field select:focus, .field textarea:focus {
      outline: none; border-color: #2d6a9f; box-shadow: 0 0 0 3px rgba(45,106,159,0.1);
    }
    .input-readonly { background: #f8fafc; color: #64748b; cursor: default; }

    /* ── Cliente autocomplete ── */
    .input-combo { display: flex; gap: 0.4rem; position: relative; }
    .search-wrapper { flex: 1; position: relative; }
    .search-wrapper input {
      width: 100%; padding: 0.6rem 0.875rem;
      border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-size: 0.9rem; background: white; box-sizing: border-box;
    }
    .search-wrapper input:focus { outline: none; border-color: #2d6a9f; }
    .search-wrapper input.has-val { border-color: #22c55e; }
    .selected-client {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; align-items: center; padding: 0 0.875rem;
      background: #f0fdf4; border-radius: 8px; gap: 0.5rem;
    }
    .client-tag { font-size: 0.875rem; font-weight: 600; color: #16a34a; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .clear-btn { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 0.9rem; }
    .clear-btn:hover { color: #dc2626; }

    .dropdown-list {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0;
      background: white; border: 1.5px solid #e2e8f0; border-radius: 10px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.12); z-index: 100;
      max-height: 220px; overflow-y: auto;
    }
    .dropdown-item {
      padding: 0.6rem 1rem; cursor: pointer;
      display: flex; flex-direction: column; gap: 0.15rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .dropdown-item:last-child { border-bottom: none; }
    .dropdown-item:hover { background: #f0f9ff; }
    .item-nome { font-size: 0.875rem; font-weight: 600; color: #1e293b; }
    .item-doc { font-size: 0.75rem; color: #64748b; }
    .item-doc.small { font-size: 0.72rem; }

    .btn-add-inline {
      width: 36px; height: 36px; background: #2d6a9f; color: white;
      border: none; border-radius: 8px; font-size: 1.2rem;
      cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    }
    .btn-add-inline:hover { background: #1e3a5f; }

    /* E-mails */
    .emails-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; padding: 0.5rem 0; }
    .email-opt {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.35rem 0.75rem; background: #f8fafc;
      border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 0.8rem; color: #475569; cursor: pointer;
    }
    .email-opt:hover { border-color: #2d6a9f; }
    .empty-emails { font-size: 0.8rem; color: #94a3b8; padding: 0.5rem 0; }

    /* ── Autocomplete fields (CNAE/NBS) ── */
    .autocomplete-field { position: relative; }
    .autocomplete-field input {
      width: 100%; padding: 0.6rem 0.875rem;
      border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-size: 0.9rem; background: white; box-sizing: border-box;
    }
    .autocomplete-field input:focus { outline: none; border-color: #2d6a9f; }
    .autocomplete-field input.selected { border-color: #22c55e; color: #16a34a; }
    .selected-tag {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.5rem 0.875rem; background: #f0fdf4;
      border: 1.5px solid #22c55e; border-radius: 8px;
      font-size: 0.875rem; font-weight: 600; color: #16a34a;
      margin-top: 0.35rem;
    }
    .selected-tag button { background: none; border: none; color: #94a3b8; cursor: pointer; }
    .selected-tag button:hover { color: #dc2626; }

    /* ── ISS ── */
    .iss-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .iss-label { font-size: 0.875rem; font-weight: 600; color: #475569; }
    .radio-pill {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.4rem 1rem; border: 1.5px solid #e2e8f0;
      border-radius: 8px; font-size: 0.875rem; color: #64748b; cursor: pointer;
    }
    .radio-pill input { display: none; }
    .radio-pill.on { background: #dbeafe; border-color: #2d6a9f; color: #1d4ed8; font-weight: 600; }

    /* ── Totais ── */
    .totais-grid { display: flex; gap: 1rem; flex-wrap: wrap; }
    .total-col { display: flex; flex-direction: column; gap: 0.375rem; flex: 1; min-width: 120px; }
    .total-col label { font-size: 0.72rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; }
    .result-col label { color: #d97706; }
    .highlight-col label { color: #1d4ed8; font-weight: 700; }
    .money-box {
      display: flex; align-items: center;
      border: 1.5px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: white;
    }
    .money-box.readonly { background: #fefce8; }
    .money-box.liquido { border-color: #2d6a9f; background: #f0f9ff; }
    .prefix, .suffix {
      padding: 0 0.5rem; background: #f8fafc; color: #64748b;
      font-size: 0.8rem; font-weight: 600; border-right: 1px solid #e2e8f0; white-space: nowrap;
    }
    .suffix { border-right: none; border-left: 1px solid #e2e8f0; }
    .money-box input {
      flex: 1; padding: 0.6rem 0.5rem; border: none; outline: none;
      font-size: 0.9rem; color: #1e293b; background: transparent; min-width: 0;
    }
    .money-box.liquido .prefix { background: #dbeafe; }
    .money-box.liquido input { color: #1d4ed8; font-weight: 700; font-size: 1rem; }
    
    .p-inputnumber-wrapper { padding: 0 !important; background: transparent !important; border: none !important; box-shadow: none !important; }
    ::ng-deep .money-p-input { width: 100%; border: none !important; background: transparent; font-weight: 600; font-size: 1.05rem; padding: 0.75rem !important; color: #1e293b; box-shadow: none !important; border-radius: 8px; }
    ::ng-deep .money-p-input:focus { outline: none; }
    ::ng-deep .readonly-input { background: #fefce8 !important; color: #64748b !important; }
    ::ng-deep .liquido-input { background: #dbeafe !important; color: #1d4ed8 !important; font-size: 1.15rem !important; }

    /* ── Resumo ── */
    .resumo {
      margin-top: 1.25rem; background: #f8fafc; border-radius: 10px;
      padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;
    }
    .resumo-row { display: flex; justify-content: space-between; font-size: 0.875rem; color: #475569; }
    .val-red { color: #dc2626; }
    .resumo-total {
      padding-top: 0.5rem; border-top: 1.5px solid #e2e8f0;
      font-weight: 700; font-size: 1rem; color: #1e293b;
    }

    /* ── Loading ── */
    .loading-page { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem; gap: 1rem; color: #64748b; }
    .spinner-lg { width: 48px; height: 48px; border: 4px solid #e2e8f0; border-top-color: #2d6a9f; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Form Actions ── */
    .form-actions {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 1.5rem; flex-wrap: wrap; gap: 1rem;
    }
    .actions-right { display: flex; gap: 0.75rem; }
    .btn-cancelar {
      padding: 0.625rem 1.25rem; background: white; color: #64748b;
      border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.875rem; cursor: pointer;
    }
    .btn-cancelar:hover { background: #f1f5f9; }
    .btn-rascunho {
      padding: 0.625rem 1.25rem; background: white; color: #1e3a5f;
      border: 1.5px solid #1e3a5f; border-radius: 10px;
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
    }
    .btn-rascunho:hover { background: #e0f0ff; }
    .btn-rascunho:disabled, .btn-emitir-now:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-emitir-now {
      padding: 0.625rem 1.5rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white; border: none; border-radius: 10px;
      font-size: 0.9rem; font-weight: 700; cursor: pointer;
    }
    .btn-emitir-now:hover { opacity: 0.9; transform: translateY(-1px); }

    /* ── Readonly e Badges ── */
    .status-badge-top {
      padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 700;
      font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em;
      display: flex; align-items: center; justify-content: center;
    }
    .status-badge-top.status-rascunho { background: #f8fafc; color: #475569; border: 1.5px solid #cbd5e1; }
    .status-badge-top.status-processando { background: #fef3c7; color: #d97706; border: 1.5px solid #fcd34d; }
    .status-badge-top.status-autorizada { background: #dcfce7; color: #16a34a; border: 1.5px solid #86efac; }
    .status-badge-top.status-rejeitada { background: #fee2e2; color: #dc2626; border: 1.5px solid #fca5a5; }
    .status-badge-top.status-cancelada { background: #f1f5f9; color: #64748b; border: 1.5px solid #cbd5e1; }

    fieldset:disabled .clear-btn, fieldset:disabled .btn-add-inline, fieldset:disabled .hint { display: none; }
    fieldset:disabled input, fieldset:disabled select, fieldset:disabled textarea {
      background: #f8fafc; color: #64748b; border-color: #cbd5e1; cursor: not-allowed;
    }
    fieldset:disabled .autocomplete-field input.selected,
    fieldset:disabled .search-wrapper input.has-val,
    fieldset:disabled .selected-client,
    fieldset:disabled .selected-tag {
      background: #f8fafc; border-color: #cbd5e1; color: #475569;
    }

    @media (max-width: 768px) {
      .form-page { padding: 1rem; }
      .fields-row { flex-direction: column; }
      .totais-grid { flex-direction: column; }
    }
  `]
})
export class NfseFormComponent implements OnInit {
  private nfseService = inject(NfseService);
  private clienteService = inject(ClienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);

  private fiscalUrl = `${environment.apiUrl}/api/v1/fiscal-data`;
  private servicosUrl = `${environment.apiUrl}/api/v1/servicos`;

  editMode = false;
  readonlyMode = signal(false);
  notaId: string | null = null;
  nota = signal<NotaFiscalServico | null>(null);
  carregando = signal(false);
  salvando = signal(false);

  // Catálogos
  servicos = signal<ServicoOpt[]>([]);
  clientesDropdown = signal<Cliente[]>([]);
  servicoDropdown = signal<ServicoOpt[]>([]);
  cnaeDropdown = signal<FiscalOpt[]>([]);
  nbsDropdown = signal<FiscalOpt[]>([]);
  lc116Opts = signal<FiscalOpt[]>([]);
  emailsCliente = signal<string[]>([]);

  // Busca digitada
  clienteBusca = '';
  servicoBusca = '';
  servicoSelecionadoId = signal('');
  cnaeBusca = '';
  cnaeSelecionadoDesc = '';
  nbsBusca = '';
  nbsSelecionadoDesc = '';
  clienteSelecionadoNome = signal('');
  condicaoPagamento = 'outros';

  // Timers de debounce
  private _clienteTimer: any;
  private _servicoTimer: any;
  private _cnaeTimer: any;
  private _nbsTimer: any;

  // Emails selecionados
  private emailsSelecionados: string[] = [];

  form: NotaFiscalServico = {
    naturezaOperacao: '1',
    dataEmissao: new Date().toISOString().split('T')[0],
    dataCompetencia: new Date().toISOString().split('T')[0],
    dataVencimento: new Date().toISOString().split('T')[0],
    ufPrestacao: 'DF',
    aliquotaIss: 2.01,
    valorServicos: 0,
    valorDesconto: 0,
    issRetido: false,
    exigibilidadeIss: 1,
  };

  valorIssCalc = 0;
  valorLiquidoCalc = 0;
  baseCalculo = 0;

  ufs = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

  // Cidade autocomplete
  cidadeBusca = '';
  cidadeNomeSelecionado = '';
  cidadeDropdown = signal<{ codigo: string; nome: string; uf: string }[]>([]);
  private _cidadeTimer: any;
  private municipiosPorUf: { codigo: string; nome: string; uf: string }[] = [];
  private _municipiosCarregados = false;

  ngOnInit(): void {
    this.notaId = this.route.snapshot.paramMap.get('id');
    this.editMode = !!this.notaId;

    // Se estivermos visualizando (rota com ID mas sem "editar"), entra em readonly
    if (this.notaId && !this.router.url.includes('editar')) {
      this.readonlyMode.set(true);
    }

    this.carregarServicos();
    this.carregarMunicipiosPorUf(this.form.ufPrestacao || 'DF');
    if (this.notaId) {
      this.carregarNota();
    }
  }

  // ─── Carregamento ─────────────────────────────────────────────────────────

  private carregarServicos(): void {
    // Carrega todos para o autocomplete local (rápido)
    this.http.get<any>(`${this.servicosUrl}?size=200&status=ATIVO`).subscribe({
      next: (p) => {
        const lista = p.content || p;
        this.servicos.set(lista.map((s: any) => ({
          id: s.id, nome: s.nome,
          codigoCnae: s.cnaeCodigo, itemLc116: s.codigoServicoLc116,
          codigoNbs: s.nbsCodigo, aliquotaIss: s.aliquotaIss,
          descricaoNota: s.descricaoNota, preco: s.preco
        })));
      }
    });
  }

  private carregarNota(): void {
    this.carregando.set(true);
    this.nfseService.buscarPorId(this.notaId!).subscribe({
      next: (n) => {
        this.nota.set(n);
        this.form = { ...n };
        if (n.clienteId) {
          this.clienteService.findById(n.clienteId.toString()).subscribe({
            next: (c) => {
              const nome = c.razaoSocial || `${c.name || ''} ${c.lastName || ''}`.trim();
              this.clienteSelecionadoNome.set(nome);
              this.carregarEmailsCliente(c);
            }
          });
        }
        // Restaura campos de autocomplete
        if (n.codigoCnae) {
          this.cnaeBusca = n.codigoCnae;
          this.cnaeSelecionadoDesc = n.codigoCnae;
          // Busca descrição real na API fiscal
          const params = new HttpParams().set('search', n.codigoCnae);
          this.http.get<any[]>(`${this.fiscalUrl}/cnaes`, { params }).subscribe({
            next: (res) => {
              if (res.length > 0) {
                this.cnaeSelecionadoDesc = res[0].label || res[0].descricao || res[0].description || n.codigoCnae;
              }
            }
          });
        }

        if (n.codigoNbs) {
          this.nbsBusca = n.codigoNbs;
          this.nbsSelecionadoDesc = n.codigoNbs;
          // Busca descrição real na API fiscal
          const params = new HttpParams().set('search', n.codigoNbs);
          this.http.get<any[]>(`${this.fiscalUrl}/nbs`, { params }).subscribe({
            next: (res) => {
              if (res.length > 0) {
                this.nbsSelecionadoDesc = res[0].label || res[0].descricao || res[0].description || n.codigoNbs;
              }
            }
          });
        }
        // Restaura nome da cidade pelo código IBGE
        if (n.municipioIbge && n.ufPrestacao) {
          this.carregarMunicipiosPorUf(n.ufPrestacao).then(() => {
            const m = this.municipiosPorUf.find(x => x.codigo === n.municipioIbge);
            if (m) {
              this.cidadeNomeSelecionado = m.nome + ' - ' + n.ufPrestacao;
            } else {
              // Fallback: busca na API IBGE pelo ID
              this.http.get<any>(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${n.municipioIbge}`).subscribe({
                next: (mib) => {
                  this.cidadeNomeSelecionado = (mib.nome || n.municipioIbge) + ' - ' + n.ufPrestacao;
                }
              });
            }
          });
        }
        // Carrega opções do LC116 para exibir corretamente no select
        if (n.itemLc116) {
          const paramsLc = new HttpParams().set('search', n.itemLc116);
          this.http.get<any[]>(`${this.fiscalUrl}/lc116`, { params: paramsLc }).subscribe({
            next: (res) => {
              const opts = res.map((r: any) => ({ codigo: r.id || r.codigo || r.code, descricao: r.label || r.descricao || r.description || '' }));
              if (!opts.find((o: any) => o.codigo === n.itemLc116)) {
                opts.unshift({ codigo: n.itemLc116!, descricao: 'Item selecionado' });
              }
              this.lc116Opts.set(opts);
            },
            error: () => this.lc116Opts.set([{ codigo: n.itemLc116!, descricao: 'Item LC116' }])
          });
        }
        this.recalcular();

        // Verifica status imutável
        const statusImutaveis = ['AUTORIZADA', 'PROCESSANDO', 'CANCELADA'];
        if (n.status && statusImutaveis.includes(n.status)) {
          this.readonlyMode.set(true);
          // Se o usuário entrou por uma rota desatualizada de edição, avisa e resolve:
          if (this.router.url.includes('editar')) {
            this.snackBar.open(`⚠️ Nota em status ${n.status} não pode ser editada. Alterando para visualização...`, 'OK', { duration: 6000 });
            this.router.navigate(['/contabilidade/nfse', this.notaId]);
          }
        }
      },
      error: () => this.snackBar.open('Erro ao carregar nota', 'OK', { duration: 3000 }),
      complete: () => this.carregando.set(false)
    });
  }

  // ─── Cliente ──────────────────────────────────────────────────────────────

  onClienteBusca(event: Event): void {
    clearTimeout(this._clienteTimer);
    const termo = (event.target as HTMLInputElement).value;
    if (termo.length < 2) { this.clientesDropdown.set([]); return; }
    this._clienteTimer = setTimeout(() => {
      this.clienteService.findAllPaged(0, 8, termo).subscribe({
        next: (p) => this.clientesDropdown.set(p.content)
      });
    }, 350);
  }

  selecionarCliente(c: Cliente): void {
    this.form.clienteId = c.id as any;
    const nome = c.razaoSocial || `${c.name || ''} ${c.lastName || ''}`.trim();
    this.clienteSelecionadoNome.set(nome);
    this.clienteBusca = nome;
    this.clientesDropdown.set([]);
    this.carregarEmailsCliente(c);

    // Auto-preenche UF e cidade a partir do endereço principal do cliente
    const endPrincipal = c.enderecos?.find(e => e.principal) || c.enderecos?.[0];
    if (endPrincipal?.estado) {
      const uf = endPrincipal.estado.toUpperCase().substring(0, 2);
      if (this.ufs.includes(uf)) {
        this.form.ufPrestacao = uf;
        this.carregarMunicipiosPorUf(uf).then(() => {
          if (endPrincipal.cidade) {
            // Busca cidade por nome
            const nomeCidade = endPrincipal.cidade.toLowerCase();
            const encontrada = this.municipiosPorUf.find(m =>
              m.nome.toLowerCase().includes(nomeCidade) || nomeCidade.includes(m.nome.toLowerCase())
            );
            if (encontrada) {
              this.form.municipioIbge = encontrada.codigo;
              this.cidadeNomeSelecionado = encontrada.nome + ' - ' + uf;
            } else {
              // Permite busca manual se não encontrou
              this.cidadeBusca = endPrincipal.cidade;
            }
          }
        });
      }
    }
  }

  limparCliente(): void {
    this.form.clienteId = undefined;
    this.clienteSelecionadoNome.set('');
    this.clienteBusca = '';
    this.emailsCliente.set([]);
  }

  private carregarEmailsCliente(c: Cliente): void {
    const emails = (c.emails || []).map(e => e.email || '').filter(Boolean);
    this.emailsCliente.set(emails);
  }

  toggleEmail(email: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.emailsSelecionados = [...this.emailsSelecionados, email];
    } else {
      this.emailsSelecionados = this.emailsSelecionados.filter(e => e !== email);
    }
    this.form.emailsEnvio = JSON.stringify(this.emailsSelecionados);
  }

  // ─── CNAE ─────────────────────────────────────────────────────────────────

  onCnaeBusca(): void {
    clearTimeout(this._cnaeTimer);
    if (!this.cnaeBusca || this.cnaeBusca.length < 2) { this.cnaeDropdown.set([]); return; }
    this._cnaeTimer = setTimeout(() => {
      const params = new HttpParams().set('search', this.cnaeBusca);
      this.http.get<any[]>(`${this.fiscalUrl}/cnaes`, { params }).subscribe({
        next: (res) => {
          // Normaliza os campos independente do formato da API
          const opts = res.map(r => ({
            codigo: r.id || r.codigo || r.code || '',
            descricao: r.label || r.descricao || r.description || r.nome || r.name || ''
          })).filter(r => r.codigo);
          this.cnaeDropdown.set(opts);
        }
      });
    }, 350);
  }

  selecionarCnae(c: FiscalOpt): void {
    this.form.codigoCnae = c.codigo;
    this.cnaeBusca = c.codigo;
    this.cnaeSelecionadoDesc = c.descricao;
    this.cnaeDropdown.set([]);
    // Buscar NBS sugeridos pelo CNAE automaticamente
    const params = new HttpParams().set('cnaeMascara', c.codigo);
    this.http.get<any[]>(`${this.fiscalUrl}/nbs-by-cnae`, { params }).subscribe({
      next: (res) => {
        if (res.length > 0) {
          this.nbsDropdown.set(res.map(r => ({ codigo: r.id || r.codigo || r.code, descricao: r.label || r.descricao || r.description || '' })));
          // Auto-seleciona NBS se só tiver um resultado
          if (res.length === 1) { this.selecionarNbs({ codigo: res[0].id || res[0].codigo || res[0].code, descricao: res[0].label || res[0].descricao || '' }); }
        }
      }
    });
  }

  limparCnae(): void {
    this.form.codigoCnae = '';
    this.cnaeBusca = '';
    this.cnaeSelecionadoDesc = '';
    this.cnaeDropdown.set([]);
    this.nbsDropdown.set([]);
    this.lc116Opts.set([]);
    // Limpa NBS e LC116 em cascata
    this.limparNbs();
  }

  // ─── NBS ──────────────────────────────────────────────────────────────────

  onNbsBusca(): void {
    clearTimeout(this._nbsTimer);
    if (!this.nbsBusca || this.nbsBusca.length < 2) { this.nbsDropdown.set([]); return; }
    this._nbsTimer = setTimeout(() => {
      const params = new HttpParams().set('search', this.nbsBusca);
      this.http.get<any[]>(`${this.fiscalUrl}/nbs`, { params }).subscribe({
        next: (res) => {
          const opts = res.map(r => ({
            codigo: r.id || r.codigo || r.code || '',
            descricao: r.label || r.descricao || r.description || r.nome || ''
          })).filter(r => r.codigo);
          this.nbsDropdown.set(opts);
        }
      });
    }, 350);
  }

  selecionarNbs(n: FiscalOpt): void {
    this.form.codigoNbs = n.codigo;
    this.nbsBusca = n.codigo;
    this.nbsSelecionadoDesc = n.descricao;
    this.nbsDropdown.set([]);
    // Buscar LC116 relacionado automaticamente
    const params = new HttpParams().set('nbsCodigo', n.codigo);
    this.http.get<any[]>(`${this.fiscalUrl}/lc116-by-nbs`, { params }).subscribe({
      next: (res) => {
        this.lc116Opts.set(res.map(r => ({ codigo: r.id || r.codigo || r.code, descricao: r.label || r.descricao || r.description || '' })));
        // Auto-seleciona LC116 se só tiver um resultado
        if (res.length === 1) { this.form.itemLc116 = res[0].id || res[0].codigo || res[0].code; }
      }
    });
  }

  limparNbs(): void {
    this.form.codigoNbs = '';
    this.nbsBusca = '';
    this.nbsSelecionadoDesc = '';
    this.nbsDropdown.set([]);
  }

  onAliquotaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remove tudo que não for número ou ponto/vírgula decimal
    let raw = input.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    // Garante só uma vírgula decimal
    const parts = raw.split('.');
    if (parts.length > 2) raw = parts[0] + '.' + parts.slice(1).join('');
    // Limita a 2 casas decimais e max 100
    const parsed = parseFloat(raw);
    if (!isNaN(parsed) && parsed > 100) raw = '100';
    input.value = raw;
    this.form.aliquotaIss = parseFloat(raw) || 0;
    this.recalcular();
  }

  onLc116Change(): void {
    // Ao selecionar LC116, podemos buscar descrição adicional se necessário
  }

  // ─── Serviço do Catálogo (autocomplete) ──────────────────────────────────

  onServicoBusca(): void {
    clearTimeout(this._servicoTimer);
    const termo = this.servicoBusca.toLowerCase().trim();
    if (!termo || termo.length < 1) { this.servicoDropdown.set([]); return; }
    this._servicoTimer = setTimeout(() => {
      const filtrado = this.servicos().filter(s =>
        s.nome.toLowerCase().includes(termo)
      ).slice(0, 10);
      this.servicoDropdown.set(filtrado);
    }, 200);
  }

  selecionarServico(s: ServicoOpt): void {
    this.servicoSelecionadoId.set(s.id);
    this.servicoBusca = s.nome;
    this.servicoDropdown.set([]);

    // Preenche Discriminação: usa descricaoNota se tiver, senão usa o nome do serviço
    const discriminacao = (s.descricaoNota && s.descricaoNota.trim())
      ? s.descricaoNota
      : `Prestação de serviços de ${s.nome}.`;
    this.form.discriminacaoServico = discriminacao;

    // Preenche CNAE
    if (s.codigoCnae) {
      this.form.codigoCnae = s.codigoCnae;
      this.cnaeBusca = s.codigoCnae;
      this.cnaeSelecionadoDesc = s.codigoCnae; // fallback imediato: mostra o código enquanto busca
      // Busca a descrição do CNAE para exibição
      const paramsCnae = new HttpParams().set('search', s.codigoCnae);
      this.http.get<any[]>(`${this.fiscalUrl}/cnaes`, { params: paramsCnae }).subscribe({
        next: (res) => {
          if (res.length > 0) {
            this.cnaeSelecionadoDesc = res[0].label || res[0].descricao || res[0].description || s.codigoCnae;
          }
        }
      });
    }

    // Preenche NBS
    if (s.codigoNbs) {
      this.form.codigoNbs = s.codigoNbs;
      this.nbsBusca = s.codigoNbs;
      this.nbsSelecionadoDesc = s.codigoNbs; // fallback imediato
      const paramsNbs = new HttpParams().set('search', s.codigoNbs);
      this.http.get<any[]>(`${this.fiscalUrl}/nbs`, { params: paramsNbs }).subscribe({
        next: (res) => {
          if (res.length > 0) {
            this.nbsSelecionadoDesc = res[0].label || res[0].descricao || res[0].description || s.codigoNbs;
          }
        }
      });
    }

    // Preenche LC116
    if (s.itemLc116) {
      this.form.itemLc116 = s.itemLc116;
      // Carrega a descrição do LC116 para exibir no select
      const params = new HttpParams().set('search', s.itemLc116);
      this.http.get<any[]>(`${this.fiscalUrl}/lc116`, { params }).subscribe({
        next: (res) => {
          const opts = res.map(r => ({ codigo: r.id || r.codigo || r.code, descricao: r.label || r.descricao || r.description || '' }));
          // Garante que o item selecionado apareça no select
          if (!opts.find(o => o.codigo === s.itemLc116)) {
            opts.unshift({ codigo: s.itemLc116!, descricao: 'Serviço selecionado' });
          }
          this.lc116Opts.set(opts);
        },
        error: () => {
          this.lc116Opts.set([{ codigo: s.itemLc116!, descricao: 'Item LC116' }]);
        }
      });
    }

    // Preenche alíquota ISS
    if (s.aliquotaIss) {
      this.form.aliquotaIss = Number(s.aliquotaIss);
    }

    // Sugere valor se o serviço tiver preço
    if (s.preco && !this.form.valorServicos) {
      this.form.valorServicos = Number(s.preco);
    }

    this.recalcular();
  }

  limparServico(): void {
    this.servicoSelecionadoId.set('');
    this.servicoBusca = '';
    this.servicoDropdown.set([]);
  }

  // ─── UF ───────────────────────────────────────────────────────────────────

  onUfChange(): void {
    // Ao trocar UF, limpa cidade e recarrega municípios da nova UF
    this.limparCidade();
    if (this.form.ufPrestacao) {
      this.carregarMunicipiosPorUf(this.form.ufPrestacao);
    }
  }

  // ─── Cidade (IBGE autocomplete) ───────────────────────────────────────────

  private carregarMunicipiosPorUf(uf: string): Promise<void> {
    return new Promise((resolve) => {
      const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`;
      this.http.get<any[]>(url).subscribe({
        next: (res) => {
          this.municipiosPorUf = res.map(m => ({
            codigo: String(m.id),
            nome: m.nome,
            uf
          }));
          this._municipiosCarregados = true;
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  onCidadeBusca(): void {
    clearTimeout(this._cidadeTimer);
    const termo = this.cidadeBusca.toLowerCase().trim();
    if (!termo || termo.length < 2) { this.cidadeDropdown.set([]); return; }

    this._cidadeTimer = setTimeout(() => {
      if (this._municipiosCarregados) {
        // Filtra localmente se já carregou
        const filtrado = this.municipiosPorUf
          .filter(m => m.nome.toLowerCase().includes(termo))
          .slice(0, 12);
        this.cidadeDropdown.set(filtrado);
      } else {
        // Busca na API IBGE diretamente por nome
        const uf = this.form.ufPrestacao || '';
        const url = `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?nome=${encodeURIComponent(this.cidadeBusca)}&orderBy=nome`;
        this.http.get<any[]>(url).subscribe({
          next: (res) => {
            this.cidadeDropdown.set(res.slice(0, 12).map(m => ({
              codigo: String(m.id),
              nome: m.nome,
              uf: m['municipio-regiao-imediata']?.['regiao-imediata']?.['regiao-intermediaria']?.['UF']?.sigla || uf
            })));
          }
        });
      }
    }, 300);
  }

  selecionarCidade(m: { codigo: string; nome: string; uf: string }): void {
    this.form.municipioIbge = m.codigo;
    this.cidadeNomeSelecionado = m.nome + (m.uf ? ' - ' + m.uf : '');
    // Atualiza UF se diferente
    if (m.uf && this.ufs.includes(m.uf)) {
      this.form.ufPrestacao = m.uf;
    }
    this.cidadeDropdown.set([]);
    this.cidadeBusca = '';
  }

  limparCidade(): void {
    this.form.municipioIbge = '';
    this.cidadeNomeSelecionado = '';
    this.cidadeBusca = '';
    this.cidadeDropdown.set([]);
  }

  // ─── Cálculo ──────────────────────────────────────────────────────────────

  recalcular(): void {
    const v = Number(this.form.valorServicos) || 0;
    const d = Number(this.form.valorDesconto) || 0;
    const al = Number(this.form.aliquotaIss) || 0;
    this.baseCalculo = Math.max(0, v - d);
    this.valorIssCalc = parseFloat((this.baseCalculo * al / 100).toFixed(2));
    this.valorLiquidoCalc = this.form.issRetido
      ? parseFloat((this.baseCalculo - this.valorIssCalc).toFixed(2))
      : this.baseCalculo;
  }

  // ─── Salvar / Emitir ──────────────────────────────────────────────────────

  salvar(): void {
    if (!this.validar()) return;
    this.salvando.set(true);
    const obs$ = this.editMode
      ? this.nfseService.atualizar(this.notaId!, this.form)
      : this.nfseService.criar(this.form);

    obs$.subscribe({
      next: (n) => {
        this.snackBar.open(`✅ Nota salva como rascunho — RPS #${n.numeroRps}`, 'OK', { duration: 3000 });
        this.router.navigate(['/contabilidade/nfse']);
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Erro ao salvar nota', 'OK', { duration: 4000 });
        this.salvando.set(false);
      },
      complete: () => this.salvando.set(false)
    });
  }

  salvarEEmitir(): void {
    if (!this.validar()) return;
    this.salvando.set(true);

    const obs$ = this.editMode
      ? this.nfseService.atualizar(this.notaId!, this.form)
      : this.nfseService.criar(this.form);

    obs$.subscribe({
      next: (notaSalva) => {
        this.snackBar.open('Nota salva. Enviando à prefeitura...', 'OK', { duration: 2000 });
        this.nfseService.emitir(notaSalva.id!).subscribe({
          next: (emitida) => {
            const msg = emitida.status === 'AUTORIZADA'
              ? `✅ NFS-e ${emitida.numeroNfse} autorizada com sucesso!`
              : '⏳ NFS-e enviada. A prefeitura está processando...';
            this.snackBar.open(msg, 'OK', { duration: 6000 });
            this.router.navigate(['/contabilidade/nfse']);
          },
          error: (err) => {
            const msg = err?.error?.message || 'Nota criada mas falha ao emitir. Acesse a lista para tentar novamente.';
            this.snackBar.open(msg, 'OK', { duration: 6000 });
            this.router.navigate(['/contabilidade/nfse']);
          },
          complete: () => this.salvando.set(false)
        });
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Erro ao salvar', 'OK', { duration: 4000 });
        this.salvando.set(false);
      }
    });
  }

  private validar(): boolean {
    if (!this.form.clienteId) {
      this.snackBar.open('⚠️ Selecione o cliente (tomador)', 'OK', { duration: 3000 }); return false;
    }
    if (!this.form.discriminacaoServico?.trim()) {
      this.snackBar.open('⚠️ A discriminação do serviço é obrigatória', 'OK', { duration: 3000 }); return false;
    }
    if (!this.form.valorServicos || this.form.valorServicos <= 0) {
      this.snackBar.open('⚠️ Informe o valor do serviço', 'OK', { duration: 3000 }); return false;
    }
    if (!this.form.dataCompetencia) {
      this.snackBar.open('⚠️ Informe a data de competência', 'OK', { duration: 3000 }); return false;
    }
    return true;
  }

  novoCliente(): void {
    this.router.navigate(['/clientes/new'], { queryParams: { retorno: '/contabilidade/nfse/criar' } });
  }

  voltar(): void {
    this.router.navigate(['/contabilidade/nfse']);
  }
}
