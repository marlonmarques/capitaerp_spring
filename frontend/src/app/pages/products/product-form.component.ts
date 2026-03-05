import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, finalize, takeUntil } from 'rxjs/operators';

import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import {
  ProdutoService, Produto, ProdutoVariacao, ProdutoVariacaoAtributo,
  UNIDADES_MEDIDA, ORIGENS_PRODUTO, TIPOS_ATRIBUTO_VARIACAO
} from '../../core/services/produto.service';
import { CategoriaService, Categoria } from '../../core/services/cadastros/categoria.service';
import { FornecedorService } from '../../core/services/cadastros/fornecedor.service';
import { GrupoTributarioService, GrupoTributario } from '../../core/services/grupo-tributario.service';
import { FiscalDataService, NcmResultDTO, CestResultDTO } from '../../core/services/fiscal-data.service';

// ─── Utilitário: Máscara de moeda BRL ─────────────────────────────────────────

function parseBrl(raw: string | number | null | undefined): number {
  if (raw == null) return 0;
  const s = String(raw).replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(s) || 0;
}

function formatBrl(value: number | null | undefined): string {
  if (value == null) return '';
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatTooltipModule, MatProgressSpinnerModule
  ],
  template: `
<div class="min-h-screen bg-slate-50 p-4 md:p-6">

  <!-- ── Header ── -->
  <header class="flex items-center justify-between mb-6 pb-5 border-b border-slate-200">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
        <mat-icon class="text-indigo-600 !text-xl">inventory_2</mat-icon>
      </div>
      <div>
        <h1 class="text-xl font-extrabold text-slate-900">
          {{ isEditMode() ? 'Editar Produto' : 'Novo Produto' }}
        </h1>
        <p class="text-slate-500 text-sm">Identificação, preços, fiscal e variações</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button type="button" mat-icon-button
              [class]="form.get('favorito')?.value ? '!text-amber-500' : '!text-slate-300 hover:!text-amber-400'"
              (click)="toggleFavorito()"
              [matTooltip]="form.get('favorito')?.value ? 'Favorito PDV ativo — clique para remover' : 'Marcar como favorito no PDV'">
        <mat-icon>{{ form.get('favorito')?.value ? 'star' : 'star_border' }}</mat-icon>
      </button>
      <button mat-stroked-button color="primary" class="!rounded-xl !h-10" (click)="voltar()">
        <mat-icon class="mr-1">arrow_back</mat-icon> Voltar
      </button>
    </div>
  </header>

  <form [formGroup]="form" (ngSubmit)="salvar()" class="max-w-5xl mx-auto space-y-5">

    <!-- ── 1. Identificação ── -->
    <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><div class="flex items-center gap-2">
        <mat-icon class="text-indigo-500 text-[18px]">badge</mat-icon>
        <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Identificação</h2></div>
      </div>
      <div class="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- Nome -->
        <div class="md:col-span-2">
          <label class="field-label">Nome do Produto *</label>
          <input type="text" formControlName="nome" class="field-input"
                 placeholder="Ex: Camiseta Polo Básica">
          <div *ngIf="f['nome'].invalid && f['nome'].touched" class="field-error">Nome é obrigatório</div>
        </div>

        <!-- Código de Barras -->
        <div>
          <label class="field-label">
            Código de Barras (EAN)
            <span *ngIf="!form.get('codigoBarras')?.value" class="field-hint">gerado automaticamente</span>
          </label>
          <input type="text" formControlName="codigoBarras" class="field-input" placeholder="Deixe vazio para gerar">
        </div>

        <!-- NCM com busca -->
        <div class="relative">
          <label class="field-label">NCM <span class="field-hint">Digite para buscar</span></label>
          <input type="text" formControlName="ncmBusca" class="field-input"
                 placeholder="Digite código ou descrição..."
                 (input)="onNcmInput($event)"
                 (focus)="mostrarSugestoes.ncm = true"
                 (blur)="fecharDropdown('ncm')">
          <div *ngIf="mostrarSugestoes.ncm && ncmSugestoes().length > 0"
               class="absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto mt-1">
            <button type="button" *ngFor="let ncm of ncmSugestoes()"
                    (mousedown)="selecionarNcm(ncm)"
                    class="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 border-b border-slate-50 last:border-0">
              <span class="font-mono font-bold text-indigo-600">{{ ncm.codigo }}</span>
              <span class="text-slate-600 ml-2">{{ ncm.descricao }}</span>
            </button>
          </div>
          <!-- NCM selecionado -->
          <div *ngIf="ncmSelecionado()" class="mt-1 flex items-center gap-2 text-xs">
            <span class="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">
              {{ ncmSelecionado()!.codigo }}
            </span>
            <button type="button" (click)="limparNcm()" class="text-slate-400 hover:text-red-500">
              <mat-icon class="!text-xs">close</mat-icon>
            </button>
          </div>
        </div>

        <!-- CEST — dependente do NCM -->
        <div>
          <label class="field-label">
            CEST
            <span *ngIf="!ncmSelecionado()" class="field-hint">selecione um NCM primeiro</span>
            <span *ngIf="cestCarregando()" class="field-hint">carregando...</span>
          </label>
          <select formControlName="codigoCest" class="field-input"
                  [class.opacity-50]="!ncmSelecionado()">
            <option value="">— Selecione o CEST —</option>
            <option *ngFor="let c of cestOpcoes()" [value]="c.codigo">
              {{ c.codigo }} — {{ c.descricao }}
            </option>
          </select>
          <div *ngIf="cestOpcoes().length === 0 && ncmSelecionado() && !cestCarregando()"
               class="text-xs text-amber-600 mt-1">
            Nenhum CEST encontrado para este NCM
          </div>
        </div>

        <!-- Unidade de Medida -->
        <div>
          <label class="field-label">Unidade de Medida *</label>
          <select formControlName="unidadeMedida" class="field-input">
            <option *ngFor="let u of unidades" [value]="u.valor">{{ u.label }}</option>
          </select>
        </div>

        <!-- Origem -->
        <div>
          <label class="field-label">Origem *</label>
          <select formControlName="origem" class="field-input">
            <option *ngFor="let o of origens" [value]="o.valor">{{ o.label }}</option>
          </select>
        </div>

        <!-- Categoria -->
        <div>
          <label class="field-label">Categoria</label>
          <select formControlName="categoriaId" class="field-input" (change)="onCategoriaChange()">
            <option value="">— Nenhuma —</option>
            <option *ngFor="let c of categorias()" [value]="c.id">{{ c.nome }}</option>
          </select>
        </div>

        <!-- Fornecedor -->
        <div>
          <label class="field-label">Fornecedor Principal</label>
          <select formControlName="fornecedorPrincipalId" class="field-input">
            <option value="">— Nenhum —</option>
            <option *ngFor="let f of fornecedores()" [value]="f.id">{{ f.nomeFantasia }}</option>
          </select>
        </div>

        <!-- Status -->
        <div>
          <label class="field-label">Status *</label>
          <select formControlName="status" class="field-input">
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="BLOQUEADO">Bloqueado</option>
          </select>
        </div>

        <!-- Descrição -->
        <div class="md:col-span-2">
          <label class="field-label">Descrição</label>
          <textarea formControlName="descricao" rows="2" class="field-input resize-none"
                    placeholder="Especificações, uso e aplicação..."></textarea>
        </div>
      </div>
    </mat-card>

    <!-- ── 2. Precificação ── -->
    <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><div class="flex items-center gap-2">
        <mat-icon class="text-emerald-500 text-[18px]">sell</mat-icon>
        <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Precificação</h2></div>
      </div>
      <div class="p-6 bg-white grid grid-cols-1 md:grid-cols-3 gap-4">

        <!-- Preço de Custo -->
        <div>
          <label class="field-label">Preço de Custo (R$)</label>
          <div class="field-currency-wrapper">
            <span class="field-currency-prefix">R$</span>
            <input type="text" formControlName="precoCustoDisplay" class="field-input-currency"
                   placeholder="0,00"
                   (input)="onCustoInput($event)"
                   (blur)="onCustoBlur()">
          </div>
        </div>

        <!-- Margem de Lucro -->
        <div>
          <label class="field-label">Margem de Lucro (%)</label>
          <div class="field-currency-wrapper">
            <input type="number" formControlName="margemLucro" class="field-input-currency"
                   placeholder="30" min="0" max="9999" step="0.01"
                   (input)="onMargemNumberInput($event)"
                   (blur)="recalcularPreco()"
                   (keypress)="somentNumero($event)">
            <span class="field-currency-suffix">%</span>
          </div>
        </div>

        <!-- Preço de Venda -->
        <div>
          <label class="field-label">
            Preço de Venda (R$) *
            <span *ngIf="precoCalculado()" class="field-hint text-emerald-600">✓ calculado</span>
          </label>
          <div class="field-currency-wrapper">
            <span class="field-currency-prefix">R$</span>
            <input type="text" formControlName="precoVendaDisplay" class="field-input-currency"
                   placeholder="0,00"
                   (input)="onVendaInput($event)"
                   (blur)="onVendaBlur()">
          </div>
          <div *ngIf="f['precoVenda'].invalid && f['precoVenda'].touched" class="field-error">
            Preço de venda obrigatório e deve ser &gt; 0
          </div>
        </div>

        <!-- Resumo financeiro -->
        <div *ngIf="form.get('precoCustoDisplay')?.value || form.get('precoVendaDisplay')?.value"
             class="md:col-span-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm">
          <div class="flex flex-wrap gap-6">
            <span *ngIf="form.get('precoCustoDisplay')?.value" class="text-slate-600">
              Custo: <strong class="text-slate-800">R$ {{ form.get('precoCustoDisplay')?.value }}</strong>
            </span>
            <span *ngIf="form.get('precoVendaDisplay')?.value" class="text-slate-600">
              Venda: <strong class="text-emerald-700">R$ {{ form.get('precoVendaDisplay')?.value }}</strong>
            </span>
            <span *ngIf="form.get('margemLucro')?.value" class="text-slate-600">
              Margem: <strong class="text-indigo-700">{{ form.get('margemLucro')?.value }}%</strong>
            </span>
            <span *ngIf="form.get('precoCusto')?.value && form.get('precoVenda')?.value && form.get('precoCusto')?.value > 0" class="text-slate-600">
              Lucro: <strong class="text-emerald-600">R$ {{ lucroAbsoluto() }}</strong>
            </span>
          </div>
        </div>
      </div>
    </mat-card>

    <!-- ── 3. Estoque ── -->
    <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><div class="flex items-center gap-2">
        <mat-icon class="text-orange-500 text-[18px]">inventory</mat-icon>
        <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Estoque</h2></div>
      </div>
      <div class="p-6 bg-white grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label class="field-label">Estoque Atual</label>
          <input type="number" formControlName="estoqueAtual" min="0" class="field-input" placeholder="0">
        </div>
        <div>
          <label class="field-label">Estoque Mínimo</label>
          <input type="number" formControlName="estoqueMinimo" min="0" class="field-input" placeholder="0">
        </div>
        <!-- Alerta de estoque -->
        <div class="md:col-span-2 flex items-center">
          <div *ngIf="estoqueAbaixoMinimo()"
               class="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm">
            <mat-icon class="text-[18px]">warning</mat-icon>
            Estoque atual está abaixo do mínimo
          </div>
        </div>
      </div>
    </mat-card>

    <!-- ── 4. Tributação ── -->
    <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><div class="flex items-center gap-2">
        <mat-icon class="text-amber-500 text-[18px]">account_balance</mat-icon>
        <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Tributação Fiscal</h2></div>
      </div>
      <div class="p-6 bg-white">
        <div class="mb-2.5">
          <label class="field-label">
            Grupo Tributário
            <span class="field-hint">Centraliza regras de ICMS, PIS, COFINS</span>
          </label>
          <select formControlName="grupoTributarioId" class="field-input">
            <option value="">— Sem grupo tributário —</option>
            <optgroup *ngFor="let regime of gruposAgrupados()" [label]="regime.label">
              <option *ngFor="let g of regime.grupos" [value]="g.id">{{ g.nome }}</option>
            </optgroup>
          </select>
        </div>

        <details class="border border-slate-200 rounded-xl">
          <summary class="cursor-pointer px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl select-none">
            Campos tributários avançados (ICMS/PIS/COFINS individuais)
          </summary>
          <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label class="field-label">CST ICMS</label>
              <input type="text" formControlName="cstIcms" class="field-input" placeholder="Ex: 400">
            </div>
            <div>
              <label class="field-label">Alíq. ICMS (%)</label>
              <input type="number" formControlName="aliquotaIcms" step="0.01" class="field-input">
            </div>
            <div>
              <label class="field-label">CFOP</label>
              <input type="text" formControlName="cfop" maxlength="6" class="field-input" placeholder="5102">
            </div>
            <div>
              <label class="field-label">CST PIS</label>
              <input type="text" formControlName="cstPis" maxlength="3" class="field-input" placeholder="07">
            </div>
            <div>
              <label class="field-label">Alíq. PIS (%)</label>
              <input type="number" formControlName="aliquotaPis" step="0.01" class="field-input">
            </div>
            <div>
              <label class="field-label">CST COFINS</label>
              <input type="text" formControlName="cstCofins" maxlength="3" class="field-input" placeholder="07">
            </div>
            <div>
              <label class="field-label">Alíq. COFINS (%)</label>
              <input type="number" formControlName="aliquotaCofins" step="0.01" class="field-input">
            </div>
          </div>
        </details>
      </div>
    </mat-card>

    <!-- ── 5. Dimensões & Peso ── -->
    <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><div class="flex items-center gap-2">
        <mat-icon class="text-sky-500 text-[18px]">straighten</mat-icon>
        <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Dimensões e Peso</h2></div>
      </div>
      <div class="p-6 bg-white grid grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label class="field-label">Peso Bruto (kg)</label>
          <input type="number" formControlName="pesoBruto" step="0.001" min="0" class="field-input" placeholder="0,000">
        </div>
        <div>
          <label class="field-label">Peso Líquido (kg)</label>
          <input type="number" formControlName="pesoLiquido" step="0.001" min="0" class="field-input" placeholder="0,000">
        </div>
        <div>
          <label class="field-label">Largura (cm)</label>
          <input type="number" formControlName="larguraCm" step="0.01" min="0" class="field-input" placeholder="0,00">
        </div>
        <div>
          <label class="field-label">Altura (cm)</label>
          <input type="number" formControlName="alturaCm" step="0.01" min="0" class="field-input" placeholder="0,00">
        </div>
        <div>
          <label class="field-label">Profundidade (cm)</label>
          <input type="number" formControlName="profundidadeCm" step="0.01" min="0" class="field-input" placeholder="0,00">
        </div>
      </div>
    </mat-card>

    <!-- ── 6. Variações ── -->
    <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-2">
          <mat-icon class="text-violet-500 text-[18px]">tune</mat-icon>
          <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Variações</h2>
          <span *ngIf="variacoes.length > 0"
                class="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {{ variacoes.length }}
          </span>
        </div>
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" formControlName="temVariacoes" class="sr-only peer">
          <div class="relative w-10 h-5">
            <div class="w-10 h-5 bg-slate-300 rounded-full peer-checked:bg-indigo-600 transition-colors"></div>
            <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
          </div>
          <span class="text-sm text-slate-600">{{ form.get('temVariacoes')?.value ? 'Ativado' : 'Desativado' }}</span>
        </label>
      </div>

      <div *ngIf="form.get('temVariacoes')?.value" class="p-6 bg-white">

        <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4 text-xs text-indigo-800 flex items-start gap-2">
          <mat-icon class="!text-sm mt-0.5 flex-shrink-0">info</mat-icon>
          <span>Adicione atributos como <strong>COR</strong>, <strong>TAMANHO</strong> ou <strong>VOLTAGEM</strong>.
          Preços/estoque por variação são opcionais — herdam do produto se não informados.</span>
        </div>

        <div *ngFor="let v of variacoes.controls; let vi = index"
             [formArrayName]="'variacoes'"
             class="border border-slate-200 rounded-xl mb-3 overflow-hidden">

          <div class="flex items-center justify-between bg-slate-50 px-4 py-2 border-b border-slate-200">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold">{{ vi + 1 }}</span>
              <span class="font-semibold text-sm text-slate-700">{{ getNomeVariacao(vi) || 'Variação ' + (vi + 1) }}</span>
            </div>
            <button type="button" mat-icon-button (click)="removerVariacao(vi)" matTooltip="Remover">
              <mat-icon class="text-red-400">delete</mat-icon>
            </button>
          </div>

          <div [formGroupName]="vi" class="p-4">
            <!-- Atributos -->
            <div class="mb-3">
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-bold text-slate-600">Atributos</label>
                <button type="button" (click)="adicionarAtributo(vi)"
                        class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
                  <mat-icon class="!text-xs">add</mat-icon> Adicionar
                </button>
              </div>
              <div formArrayName="atributos" class="space-y-2">
                <div *ngFor="let a of getAtributos(vi).controls; let ai = index"
                     [formGroupName]="ai" class="flex gap-2 items-center">
                  <select formControlName="tipo" class="field-input-sm flex-1" (change)="atualizarNomeVariacao(vi)">
                    <option *ngFor="let t of tiposAtributo" [value]="t">{{ t }}</option>
                  </select>
                  <input type="text" formControlName="valor" class="field-input-sm flex-2"
                         placeholder="Ex: Azul, P, 110V" (input)="atualizarNomeVariacao(vi)">
                  <button type="button" (click)="removerAtributo(vi, ai)" class="text-slate-400 hover:text-red-500">
                    <mat-icon class="!text-sm">close</mat-icon>
                  </button>
                </div>
                <p *ngIf="getAtributos(vi).length === 0" class="text-xs text-slate-400 italic">
                  Nenhum atributo adicionado
                </p>
              </div>
            </div>

            <!-- SKU + Código de Barras -->
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label class="field-label">SKU</label>
                <input type="text" formControlName="sku" class="field-input" placeholder="Ex: CAM-AZL-P">
              </div>
              <div>
                <label class="field-label">EAN da Variação</label>
                <input type="text" formControlName="codigoBarras" class="field-input" placeholder="Opcional">
              </div>
            </div>

            <!-- Preço + Estoque da variação -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label class="field-label">Preço Custo</label>
                <div class="field-currency-wrapper">
                  <span class="field-currency-prefix">R$</span>
                  <input type="text" formControlName="precoCustoDisplay" class="field-input-currency"
                         placeholder="Herda produto" (blur)="atualizarCampoNumerico(vi, 'precoCusto', 'precoCustoDisplay')">
                </div>
              </div>
              <div>
                <label class="field-label">Preço Venda</label>
                <div class="field-currency-wrapper">
                  <span class="field-currency-prefix">R$</span>
                  <input type="text" formControlName="precoVendaDisplay" class="field-input-currency"
                         placeholder="Herda produto" (blur)="atualizarCampoNumerico(vi, 'precoVenda', 'precoVendaDisplay')">
                </div>
              </div>
              <div>
                <label class="field-label">Estoque Mín.</label>
                <input type="number" formControlName="estoqueMinimo" min="0" class="field-input" placeholder="0">
              </div>
              <div>
                <label class="field-label">Estoque Atual</label>
                <input type="number" formControlName="estoqueAtual" min="0" class="field-input" placeholder="0">
              </div>
            </div>
          </div>
        </div>

        <button type="button" (click)="adicionarVariacao()"
                class="w-full border-2 border-dashed border-indigo-300 rounded-xl py-3 text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 font-semibold text-sm">
          <mat-icon>add_circle</mat-icon> Adicionar Nova Variação
        </button>
      </div>

      <div *ngIf="!form.get('temVariacoes')?.value"
           class="p-5 text-center text-slate-400 text-sm py-6">
        <mat-icon class="!text-3xl mb-2 opacity-30">category</mat-icon>
        <p>Ative o switch para gerenciar variações (cor, tamanho, etc.)</p>
      </div>
    </mat-card>

    <!-- ── Ações ── -->
    <div class="flex justify-end gap-3 pb-6">
      <button type="button" mat-stroked-button class="!rounded-xl !h-10 !px-5" (click)="voltar()">Cancelar</button>
      <button type="submit" mat-flat-button color="primary"
              class="!rounded-xl !h-10 !px-7 !bg-indigo-600 !font-bold"
              [disabled]="form.invalid || salvando()">
        <mat-spinner *ngIf="salvando()" diameter="18" class="mr-2"></mat-spinner>
        <mat-icon *ngIf="!salvando()" class="mr-1">save</mat-icon>
        {{ isEditMode() ? 'Salvar Alterações' : 'Cadastrar Produto' }}
      </button>
    </div>

  </form>
</div>
  `,
  styles: [`
    :host { display: block; }
    .flex-2 { flex: 2; }
    details summary::-webkit-details-marker { display:none; }
  `]
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private produtoService = inject(ProdutoService);
  private categoriaService = inject(CategoriaService);
  private fornecedorService = inject(FornecedorService);
  private grupoTributarioService = inject(GrupoTributarioService);
  private fiscalDataService = inject(FiscalDataService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private destroy$ = new Subject<void>();
  private ncmSearch$ = new Subject<string>();

  isEditMode = signal(false);
  produtoId: string | null = null;
  salvando = signal(false);
  precoCalculado = signal(false);

  readonly unidades = UNIDADES_MEDIDA;
  readonly origens = ORIGENS_PRODUTO;
  readonly tiposAtributo = TIPOS_ATRIBUTO_VARIACAO;

  categorias = signal<Categoria[]>([]);
  fornecedores = signal<any[]>([]);
  gruposAgrupados = signal<{ label: string; grupos: GrupoTributario[] }[]>([]);

  // NCM / CEST
  ncmSugestoes = signal<NcmResultDTO[]>([]);
  ncmSelecionado = signal<NcmResultDTO | null>(null);
  cestOpcoes = signal<CestResultDTO[]>([]);
  cestCarregando = signal(false);
  mostrarSugestoes = { ncm: false };

  // Form
  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    descricao: [''],
    codigoBarras: [''],
    ncmBusca: [''],
    codigoNcm: [''],
    codigoCest: [''],
    unidadeMedida: ['UN', Validators.required],
    origem: ['NACIONAL', Validators.required],
    status: ['ATIVO', Validators.required],

    // Preços (display separado de valor numérico)
    precoCustoDisplay: [''],
    precoCusto: [null],
    margemLucroDisplay: [''],
    margemLucro: [null],
    precoVendaDisplay: [''],
    precoVenda: [null, [Validators.required, Validators.min(0.01)]],

    estoqueAtual: [0, Validators.min(0)],
    estoqueMinimo: [0, Validators.min(0)],

    grupoTributarioId: [''],
    cstIcms: [''], aliquotaIcms: [null],
    cstPis: [''], aliquotaPis: [null],
    cstCofins: [''], aliquotaCofins: [null],
    cfop: [''],

    pesoBruto: [null], pesoLiquido: [null],
    larguraCm: [null], alturaCm: [null], profundidadeCm: [null],

    categoriaId: [''],
    fornecedorPrincipalId: [''],

    temVariacoes: [false],
    variacoes: this.fb.array([]),

    favorito: [false]
  });

  get f() { return this.form.controls; }
  get variacoes(): FormArray { return this.form.get('variacoes') as FormArray; }

  estoqueAbaixoMinimo(): boolean {
    const atual = this.form.get('estoqueAtual')?.value ?? 0;
    const minimo = this.form.get('estoqueMinimo')?.value ?? 0;
    return minimo > 0 && atual < minimo;
  }

  ngOnInit(): void {
    this.carregarCombos();
    this.configurarNcmSearch();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.produtoId = id;
        this.carregarProduto(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Combos ──────────────────────────────────────────────────────────────────

  carregarCombos(): void {
    this.categoriaService.findAllPaged('PRODUTO', 0, 200).subscribe({
      next: res => this.categorias.set(res.content ?? [])
    });

    this.fornecedorService.findAllPaged(0, 200).subscribe({
      next: res => this.fornecedores.set(res.content ?? [])
    });

    this.grupoTributarioService.findAll().subscribe({
      next: res => this.gruposAgrupados.set(this.agruparGrupos(res))
    });
  }

  private agruparGrupos(grupos: GrupoTributario[]): { label: string; grupos: GrupoTributario[] }[] {
    const mapa = new Map<string, GrupoTributario[]>();
    const labels: Record<string, string> = {
      SIMPLES_NACIONAL: 'Simples Nacional', LUCRO_PRESUMIDO: 'Lucro Presumido',
      LUCRO_REAL: 'Lucro Real', MEI: 'MEI', ISENTO: 'Isento'
    };
    for (const g of grupos) {
      const regime = g.regime ?? 'OUTROS';
      if (!mapa.has(regime)) mapa.set(regime, []);
      mapa.get(regime)!.push(g);
    }
    return Array.from(mapa.entries()).map(([r, gs]) => ({ label: labels[r] ?? r, grupos: gs }));
  }

  // ─── NCM / CEST ──────────────────────────────────────────────────────────────

  configurarNcmSearch(): void {
    this.ncmSearch$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(term => this.fiscalDataService.searchNcm(term)),
      takeUntil(this.destroy$)
    ).subscribe(res => this.ncmSugestoes.set(res));
  }

  onNcmInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (val.length >= 2) {
      this.ncmSearch$.next(val);
    } else {
      this.ncmSugestoes.set([]);
    }
  }

  selecionarNcm(ncm: NcmResultDTO): void {
    this.ncmSelecionado.set(ncm);
    this.form.patchValue({ codigoNcm: ncm.codigo, ncmBusca: ncm.codigo + ' - ' + ncm.descricao });
    this.ncmSugestoes.set([]);
    this.mostrarSugestoes.ncm = false;
    this.carregarCest(ncm.codigo);

    // Auto-preencher alíquotas do NCM
    if (ncm.pisCofinsNacional) this.form.patchValue({ aliquotaPis: ncm.pisCofinsNacional, aliquotaCofins: ncm.pisCofinsNacional });
    if (ncm.icmsEstadual) this.form.patchValue({ aliquotaIcms: ncm.icmsEstadual });
  }

  limparNcm(): void {
    this.ncmSelecionado.set(null);
    this.cestOpcoes.set([]);
    this.form.patchValue({ codigoNcm: '', ncmBusca: '', codigoCest: '' });
  }

  fecharDropdown(tipo: 'ncm'): void {
    setTimeout(() => { this.mostrarSugestoes[tipo] = false; }, 200);
  }

  private carregarCest(ncmCodigo: string): void {
    this.cestCarregando.set(true);
    this.cestOpcoes.set([]);
    this.fiscalDataService.getCestByNcm(ncmCodigo).pipe(
      finalize(() => this.cestCarregando.set(false))
    ).subscribe({
      next: res => this.cestOpcoes.set(res),
      error: () => this.cestOpcoes.set([])
    });
  }

  // ─── Máscara Moeda ───────────────────────────────────────────────────────────

  onCustoInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const num = parseBrl(raw);
    this.form.patchValue({ precoCusto: num || null }, { emitEvent: false });
  }

  onCustoBlur(): void {
    const val = this.form.get('precoCusto')?.value;
    this.form.patchValue({ precoCustoDisplay: val ? formatBrl(val) : '' }, { emitEvent: false });
    this.recalcularPreco();
  }

  /** Aplica a margem de lucro padrão caso a categoria selecionada possua uma */
  onCategoriaChange(): void {
    const catId = this.form.get('categoriaId')?.value;
    if (catId) {
      const cat = this.categorias().find(c => c.id === catId);
      if (cat && cat.porcentagemLucroPadrao) {
        this.form.patchValue({ margemLucro: cat.porcentagemLucroPadrao });
        this.recalcularPreco();
        this.notification.success(`Margem de ${cat.porcentagemLucroPadrao}% aplicada da categoria ${cat.nome}`);
      }
    }
  }

  /** Handler para o campo margem (type=number — já recebe número diretamente). */
  onMargemNumberInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.form.patchValue({ margemLucro: isNaN(val) ? null : val }, { emitEvent: false });
  }

  /** Mantido para compatibilidade (não usado no template mas pode existir). */
  onMargemInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.replace(',', '.');
    const num = parseFloat(raw);
    this.form.patchValue({ margemLucro: isNaN(num) ? null : num }, { emitEvent: false });
  }

  /** Bloqueia qualquer tecla que não seja dígito, ponto ou vírgula no keypress. */
  somentNumero(event: KeyboardEvent): boolean {
    const allow = /[0-9.,]/.test(event.key) || event.key === 'Backspace' || event.key === 'Tab';
    if (!allow) event.preventDefault();
    return allow;
  }

  /** Lucro absoluto calculado para o resumo financeiro. */
  lucroAbsoluto(): string {
    const custo = this.form.get('precoCusto')?.value ?? 0;
    const venda = this.form.get('precoVenda')?.value ?? 0;
    const lucro = venda - custo;
    return formatBrl(lucro > 0 ? lucro : 0);
  }

  onVendaInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const num = parseBrl(raw);
    this.form.patchValue({ precoVenda: num || null }, { emitEvent: false });
    this.precoCalculado.set(false);
  }

  onVendaBlur(): void {
    const val = this.form.get('precoVenda')?.value;
    this.form.patchValue({ precoVendaDisplay: val ? formatBrl(val) : '' }, { emitEvent: false });
  }

  recalcularPreco(): void {
    const custo = this.form.get('precoCusto')?.value;
    const margem = this.form.get('margemLucro')?.value;
    if (custo > 0 && margem != null && margem >= 0) {
      const preco = custo * (1 + margem / 100);
      const rounded = Math.round(preco * 100) / 100;
      this.form.patchValue({ precoVenda: rounded, precoVendaDisplay: formatBrl(rounded) }, { emitEvent: false });
      this.precoCalculado.set(true);
    }
  }

  atualizarCampoNumerico(vi: number, campoBd: string, campoDisplay: string): void {
    const control = this.variacoes.at(vi);
    const raw = control.get(campoDisplay)?.value;
    const num = parseBrl(raw);
    control.patchValue({ [campoBd]: num || null, [campoDisplay]: num ? formatBrl(num) : '' });
  }

  // ─── Carregar produto para edição ────────────────────────────────────────────

  carregarProduto(id: string): void {
    this.loadingService.show();
    this.produtoService.buscarPorId(id).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (produto) => {
        this.form.patchValue({
          ...produto,
          categoriaId: produto.categoriaId ?? '',
          fornecedorPrincipalId: produto.fornecedorPrincipalId ?? '',
          grupoTributarioId: produto.grupoTributarioId ?? '',
          precoCustoDisplay: produto.precoCusto ? formatBrl(produto.precoCusto) : '',
          precoVendaDisplay: produto.precoVenda ? formatBrl(produto.precoVenda) : '',
          margemLucro: produto.margemLucro ?? null,   // ← número direto para o input type=number
          favorito: produto.favorito ?? false
        });

        // NCM
        if (produto.codigoNcm) {
          this.form.patchValue({ ncmBusca: produto.codigoNcm, codigoNcm: produto.codigoNcm });
          // Buscar nome do NCM
          this.fiscalDataService.searchNcm(produto.codigoNcm).subscribe(res => {
            if (res.length > 0) {
              this.ncmSelecionado.set(res[0]);
              this.form.patchValue({ ncmBusca: res[0].codigo + ' - ' + res[0].descricao });
            }
            this.carregarCest(produto.codigoNcm!);
          });
        }

        if (produto.temVariacoes && produto.variacoes) {
          produto.variacoes.forEach(v => this.adicionarVariacaoComDados(v));
        }
      },
      error: () => {
        this.notification.error('Erro ao carregar produto');
        this.voltar();
      }
    });
  }

  // ─── Variações ───────────────────────────────────────────────────────────────

  novaVariacaoGroup(): FormGroup {
    return this.fb.group({
      id: [null], nomeVariacao: [''], sku: [''], codigoBarras: [''],
      precoCustoDisplay: [''], precoCusto: [null],
      precoVendaDisplay: [''], precoVenda: [null],
      margemLucro: [null], estoqueMinimo: [0], estoqueAtual: [0], ativo: [true],
      atributos: this.fb.array([])
    });
  }

  adicionarVariacao(): void {
    const g = this.novaVariacaoGroup();
    this.variacoes.push(g);
  }

  adicionarVariacaoComDados(v: ProdutoVariacao): void {
    const grupo = this.novaVariacaoGroup();
    grupo.patchValue({
      ...v,
      precoCustoDisplay: v.precoCusto ? formatBrl(v.precoCusto) : '',
      precoVendaDisplay: v.precoVenda ? formatBrl(v.precoVenda) : ''
    });
    const atributosArray = grupo.get('atributos') as FormArray;
    (v.atributos ?? []).forEach(a => {
      atributosArray.push(this.fb.group({ tipo: [a.tipo], valor: [a.valor] }));
    });
    this.variacoes.push(grupo);
  }

  removerVariacao(index: number): void { this.variacoes.removeAt(index); }

  getAtributos(vi: number): FormArray {
    return this.variacoes.at(vi).get('atributos') as FormArray;
  }

  adicionarAtributo(vi: number): void {
    this.getAtributos(vi).push(this.fb.group({ tipo: ['COR'], valor: [''] }));
  }

  removerAtributo(vi: number, ai: number): void {
    this.getAtributos(vi).removeAt(ai);
    this.atualizarNomeVariacao(vi);
  }

  atualizarNomeVariacao(vi: number): void {
    const atributos = this.getAtributos(vi).value as ProdutoVariacaoAtributo[];
    const nome = atributos.filter(a => a.valor?.trim()).map(a => a.valor).join(' / ');
    this.variacoes.at(vi).patchValue({ nomeVariacao: nome });
  }

  getNomeVariacao(vi: number): string {
    return this.variacoes.at(vi).get('nomeVariacao')?.value ?? '';
  }

  // ─── Salvar ──────────────────────────────────────────────────────────────────

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const dto: Produto = {
      nome: raw.nome,
      descricao: raw.descricao,
      codigoBarras: raw.codigoBarras || undefined,
      codigoNcm: raw.codigoNcm || undefined,
      codigoCest: raw.codigoCest || undefined,
      unidadeMedida: raw.unidadeMedida,
      origem: raw.origem,
      status: raw.status,
      precoCusto: raw.precoCusto,
      margemLucro: raw.margemLucro,
      precoVenda: raw.precoVenda,
      estoqueAtual: raw.estoqueAtual,
      estoqueMinimo: raw.estoqueMinimo,
      grupoTributarioId: raw.grupoTributarioId || undefined,
      cstIcms: raw.cstIcms || undefined,
      aliquotaIcms: raw.aliquotaIcms,
      cstPis: raw.cstPis || undefined,
      aliquotaPis: raw.aliquotaPis,
      cstCofins: raw.cstCofins || undefined,
      aliquotaCofins: raw.aliquotaCofins,
      cfop: raw.cfop || undefined,
      pesoBruto: raw.pesoBruto,
      pesoLiquido: raw.pesoLiquido,
      larguraCm: raw.larguraCm,
      alturaCm: raw.alturaCm,
      profundidadeCm: raw.profundidadeCm,
      categoriaId: raw.categoriaId || undefined,
      fornecedorPrincipalId: raw.fornecedorPrincipalId || undefined,
      temVariacoes: raw.temVariacoes,
      favorito: raw.favorito ?? false,
      variacoes: raw.temVariacoes ? raw.variacoes.map((v: any) => ({
        id: v.id,
        sku: v.sku,
        codigoBarras: v.codigoBarras,
        precoCusto: v.precoCusto,
        precoVenda: v.precoVenda,
        margemLucro: v.margemLucro,
        estoqueMinimo: v.estoqueMinimo,
        estoqueAtual: v.estoqueAtual,
        ativo: v.ativo,
        atributos: v.atributos
      })) : []
    };

    this.salvando.set(true);
    const req$ = this.isEditMode() && this.produtoId
      ? this.produtoService.atualizar(this.produtoId, dto)
      : this.produtoService.inserir(dto);

    req$.pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: (res) => {
        this.notification.success(
          `Produto ${this.isEditMode() ? 'atualizado' : 'cadastrado'} com sucesso!` +
          (res.codigoBarras && !this.form.get('codigoBarras')?.value ? ` EAN: ${res.codigoBarras}` : '')
        );
        this.voltar();
      },
      error: (err) => {
        const msg = err?.error?.message ?? `Erro ao ${this.isEditMode() ? 'atualizar' : 'cadastrar'} produto`;
        this.notification.error(msg);
      }
    });
  }

  toggleFavorito(): void {
    const atual = this.form.get('favorito')?.value;
    this.form.patchValue({ favorito: !atual });
  }

  voltar(): void { this.router.navigate(['/products']); }
}
