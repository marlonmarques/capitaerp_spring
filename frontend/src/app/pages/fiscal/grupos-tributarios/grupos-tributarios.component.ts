import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
    GrupoTributarioService, GrupoTributario, TipoImposto, RegimeTributario
} from '../../../core/services/grupo-tributario.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-grupos-tributarios',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
    template: `
    <div class="p-6 md:p-8 font-sans bg-slate-50 min-h-screen">
      <!-- Header -->
      <header class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">Grupos Tributários</h1>
          <p class="text-slate-500 font-medium">Pre-configure regras fiscais para produtos e serviços</p>
        </div>
        <div class="flex gap-3 items-center">
          <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input type="checkbox" class="rounded" [checked]="mostrarInativos()" (change)="toggleInativos()">
            Mostrar inativos
          </label>
          <button mat-flat-button class="!bg-indigo-600 !text-white !rounded-xl !h-11 !px-6"
            (click)="novo()">
            <mat-icon class="mr-1">add</mat-icon> Novo Grupo Tributário
          </button>
        </div>
      </header>

      <!-- Filtros de tipo -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button *ngFor="let filtro of filtrosTipo"
          class="px-4 py-1.5 rounded-full text-sm font-semibold transition-all border"
          [ngClass]="filtroAtivo() === filtro.valor
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'"
          (click)="setFiltro(filtro.valor)">
          {{ filtro.label }}
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="flex justify-center items-center py-20">
        <span class="text-slate-400 animate-pulse">Carregando...</span>
      </div>

      <!-- Grid de cards -->
      <div *ngIf="!loading()" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div *ngFor="let gt of gruposFiltrados()"
          class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-3 hover:shadow-md hover:border-indigo-200 transition-all"
          [class.opacity-50]="!gt.ativo">

          <!-- Cabeçalho do card -->
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-bold text-slate-800 text-base leading-tight">{{ gt.nome }}</p>
              <p *ngIf="gt.descricao" class="text-xs text-slate-400 mt-0.5">{{ gt.descricao }}</p>
            </div>
            <div class="flex gap-1 shrink-0">
              <button mat-icon-button class="!w-8 !h-8 text-slate-400 hover:text-indigo-600" (click)="editar(gt)">
                <mat-icon class="text-[18px]">edit</mat-icon>
              </button>
              <button mat-icon-button class="!w-8 !h-8 text-slate-400 hover:text-red-500" (click)="excluir(gt)">
                <mat-icon class="text-[18px]">delete</mat-icon>
              </button>
            </div>
          </div>

          <!-- Badges -->
          <div class="flex flex-wrap gap-1.5">
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold" [ngClass]="badgeRegime(gt.regime)">
              {{ labelRegime(gt.regime) }}
            </span>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold" [ngClass]="badgeTipo(gt.tipoImposto)">
              {{ labelTipo(gt.tipoImposto) }}
            </span>
            <span *ngIf="!gt.ativo" class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
              Inativo
            </span>
          </div>

          <!-- Alíquotas resumo -->
          <div class="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
            <div *ngIf="gt.aliquotaIcms != null" class="flex justify-between text-xs text-slate-600">
              <span class="font-medium">ICMS</span>
              <span class="font-bold text-slate-800">{{ gt.aliquotaIcms }}%</span>
            </div>
            <div *ngIf="gt.aliquotaIpi != null" class="flex justify-between text-xs text-slate-600">
              <span class="font-medium">IPI</span>
              <span class="font-bold text-slate-800">{{ gt.aliquotaIpi }}%</span>
            </div>
            <div *ngIf="gt.aliquotaPis != null" class="flex justify-between text-xs text-slate-600">
              <span class="font-medium">PIS</span>
              <span class="font-bold text-slate-800">{{ gt.aliquotaPis }}%</span>
            </div>
            <div *ngIf="gt.aliquotaCofins != null" class="flex justify-between text-xs text-slate-600">
              <span class="font-medium">COFINS</span>
              <span class="font-bold text-slate-800">{{ gt.aliquotaCofins }}%</span>
            </div>
            <div *ngIf="gt.aliquotaIss != null" class="flex justify-between text-xs text-slate-600">
              <span class="font-medium">ISS</span>
              <span class="font-bold text-slate-800">{{ gt.aliquotaIss }}%</span>
            </div>
            <div *ngIf="gt.aliquotaSt != null" class="flex justify-between text-xs text-slate-600">
              <span class="font-medium text-amber-600">ST</span>
              <span class="font-bold text-amber-700">{{ gt.aliquotaSt }}%</span>
            </div>
            <!-- Reforma Tributária -->
            <div *ngIf="gt.aliquotaIbs != null" class="flex justify-between text-xs text-slate-600">
              <span class="font-medium text-purple-600">IBS</span>
              <span class="font-bold text-purple-700">{{ gt.aliquotaIbs }}%</span>
            </div>
            <div *ngIf="gt.aliquotaCbs != null" class="flex justify-between text-xs text-slate-600">
              <span class="font-medium text-purple-600">CBS</span>
              <span class="font-bold text-purple-700">{{ gt.aliquotaCbs }}%</span>
            </div>
          </div>

          <!-- CFOP resumo -->
          <div *ngIf="gt.cfopSaida || gt.cfopEntrada" class="flex gap-4 text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span *ngIf="gt.cfopSaida">Saída: <b class="text-slate-700">{{ gt.cfopSaida }}</b></span>
            <span *ngIf="gt.cfopEntrada">Entrada: <b class="text-slate-700">{{ gt.cfopEntrada }}</b></span>
            <span *ngIf="gt.cstCsosn">CST/CSOSN: <b class="text-slate-700">{{ gt.cstCsosn }}</b></span>
          </div>
        </div>

        <!-- Empty -->
        <div *ngIf="gruposFiltrados().length === 0"
          class="col-span-3 text-center py-16 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-2xl">
          <mat-icon class="text-5xl text-slate-300 mb-2">receipt_long</mat-icon>
          <p>Nenhum grupo tributário encontrado.</p>
          <button mat-stroked-button class="!mt-4 !rounded-xl" (click)="novo()">Criar primeiro grupo</button>
        </div>
      </div>
    </div>
  `
})
export class GruposTributariosComponent implements OnInit {
    private service = inject(GrupoTributarioService);
    private notification = inject(NotificationService);
    private loadingService = inject(LoadingService);
    private router = inject(Router);

    grupos = signal<GrupoTributario[]>([]);
    loading = signal(false);
    mostrarInativos = signal(false);
    filtroAtivo = signal<TipoImposto | 'TODOS'>('TODOS');

    filtrosTipo: { valor: TipoImposto | 'TODOS'; label: string }[] = [
        { valor: 'TODOS', label: 'Todos' },
        { valor: 'SIMPLES', label: 'Simples Nacional' },
        { valor: 'ICMS', label: 'ICMS' },
        { valor: 'ICMS_ST', label: 'ICMS ST' },
        { valor: 'IPI', label: 'IPI' },
        { valor: 'ISS', label: 'ISS' },
        { valor: 'PIS_COFINS', label: 'PIS/COFINS' },
        { valor: 'IBS_CBS', label: 'Reforma Tributária' },
        { valor: 'ISENTO', label: 'Isento' },
    ];

    ngOnInit(): void {
        this.carregar();
    }

    carregar(): void {
        this.loading.set(true);
        this.service.findAll(this.mostrarInativos())
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: data => this.grupos.set(data),
                error: () => this.notification.error('Erro ao carregar grupos tributários')
            });
    }

    gruposFiltrados(): GrupoTributario[] {
        if (this.filtroAtivo() === 'TODOS') return this.grupos();
        return this.grupos().filter(g => g.tipoImposto === this.filtroAtivo());
    }

    setFiltro(v: TipoImposto | 'TODOS') { this.filtroAtivo.set(v); }

    toggleInativos() {
        this.mostrarInativos.set(!this.mostrarInativos());
        this.carregar();
    }

    novo() { this.router.navigate(['/fiscal/grupos-tributarios/new']); }

    editar(g: GrupoTributario) {
        if (g.id) this.router.navigate(['/fiscal/grupos-tributarios', g.id, 'edit']);
    }

    excluir(g: GrupoTributario) {
        if (!g.id || !confirm(`Desativar o grupo "${g.nome}"?`)) return;
        this.loadingService.show();
        this.service.delete(g.id).pipe(finalize(() => this.loadingService.hide())).subscribe({
            next: () => { this.notification.success('Grupo desativado!'); this.carregar(); },
            error: () => this.notification.error('Erro ao excluir grupo tributário')
        });
    }

    badgeRegime(r?: string): string {
        const map: Record<string, string> = {
            SIMPLES_NACIONAL: 'bg-green-100 text-green-700',
            LUCRO_PRESUMIDO: 'bg-blue-100 text-blue-700',
            LUCRO_REAL: 'bg-indigo-100 text-indigo-700',
            MEI: 'bg-emerald-100 text-emerald-700',
            ISENTO: 'bg-slate-100 text-slate-500',
        };
        return map[r ?? ''] ?? 'bg-slate-100 text-slate-600';
    }

    badgeTipo(t?: string): string {
        const map: Record<string, string> = {
            ICMS: 'bg-orange-100 text-orange-700',
            ICMS_ST: 'bg-amber-100 text-amber-700',
            IPI: 'bg-yellow-100 text-yellow-700',
            ISS: 'bg-teal-100 text-teal-700',
            PIS_COFINS: 'bg-cyan-100 text-cyan-700',
            SIMPLES: 'bg-green-100 text-green-700',
            IBS_CBS: 'bg-purple-100 text-purple-700',
            ISENTO: 'bg-slate-100 text-slate-500',
        };
        return map[t ?? ''] ?? 'bg-slate-100 text-slate-600';
    }

    labelRegime(r?: RegimeTributario): string {
        const map: Record<string, string> = {
            SIMPLES_NACIONAL: 'Simples Nacional',
            LUCRO_PRESUMIDO: 'Lucro Presumido',
            LUCRO_REAL: 'Lucro Real',
            MEI: 'MEI',
            ISENTO: 'Isento',
        };
        return map[r ?? ''] ?? r ?? '';
    }

    labelTipo(t?: TipoImposto): string {
        const map: Record<string, string> = {
            ICMS: 'ICMS', ICMS_ST: 'ICMS ST', IPI: 'IPI',
            ISS: 'ISS', PIS_COFINS: 'PIS/COFINS', SIMPLES: 'Simples',
            IBS_CBS: 'IBS/CBS', ISENTO: 'Isento',
        };
        return map[t ?? ''] ?? t ?? '';
    }
}
