import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { PosicaoFiscalService, PosicaoFiscal } from '../../../core/services/posicao-fiscal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { finalize } from 'rxjs';

const TIPO_NOTA_LABELS: Record<string, string> = { ENTRADA: 'Entrada', SAIDA: 'Saída' };
const FINALIDADE_LABELS: Record<string, string> = {
    NORMAL: 'Normal', COMPLEMENTAR: 'Complementar', AJUSTE: 'Ajuste', DEVOLUCAO_RETORNO: 'Devolução / Retorno'
};

@Component({
    selector: 'app-posicoes-fiscais',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule],
    template: `
    <div class="p-6 md:p-8 font-sans bg-slate-50 min-h-screen">
      <header class="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
            Posições Fiscais
          </h1>
          <p class="text-slate-500 font-medium">Defina as regras de tributação para emissão de notas fiscais.</p>
        </div>
        <button mat-flat-button color="primary" class="!rounded-xl !h-12 !px-6 !bg-indigo-600" (click)="nova()">
          <mat-icon class="mr-2">add</mat-icon> Nova Posição Fiscal
        </button>
      </header>

      <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden max-w-6xl mx-auto">
        <div *ngIf="loading()" class="p-12 flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <div *ngIf="!loading() && posicoes().length === 0" class="text-center py-16 text-slate-400">
          <mat-icon class="!text-6xl !h-16 !w-16 mb-4 text-slate-300">account_balance_wallet</mat-icon>
          <p class="text-lg font-medium">Nenhuma posição fiscal cadastrada</p>
          <p class="text-sm mt-1">Clique em "Nova Posição Fiscal" para começar.</p>
        </div>

        <div *ngIf="!loading() && posicoes().length > 0">
          <div class="px-6 py-4 bg-white border-b border-slate-100 grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div class="col-span-3">Nome</div>
            <div class="col-span-2">Tipo Nota</div>
            <div class="col-span-2">Finalidade</div>
            <div class="col-span-2">Cons. Final</div>
            <div class="col-span-2">CFOP Padrão</div>
            <div class="col-span-1"></div>
          </div>
          <div *ngFor="let pos of posicoes()"
            class="px-6 py-4 bg-white border-b border-slate-50 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
            <div class="col-span-3">
              <p class="font-semibold text-slate-800">{{ pos.nome }}</p>
            </div>
            <div class="col-span-2">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                [ngClass]="pos.tipoNota === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'">
                <mat-icon class="!text-xs !h-3 !w-3 mr-1">{{ pos.tipoNota === 'ENTRADA' ? 'arrow_downward' : 'arrow_upward' }}</mat-icon>
                {{ tipoNotaLabel(pos.tipoNota) }}
              </span>
            </div>
            <div class="col-span-2 text-sm text-slate-600">{{ finalidadeLabel(pos.finalidade) }}</div>
            <div class="col-span-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                [ngClass]="pos.consumidorFinal ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'">
                {{ pos.consumidorFinal ? 'Sim' : 'Não' }}
              </span>
            </div>
            <div class="col-span-2 text-sm font-mono text-slate-600">{{ pos.cfopPadraoCodigo || '-' }}</div>
            <div class="col-span-1 flex justify-end gap-1">
              <button mat-icon-button class="!text-slate-400 hover:!text-indigo-600" (click)="editar(pos)" title="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button class="!text-slate-400 hover:!text-red-600" (click)="deletar(pos)" title="Excluir">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </mat-card>
    </div>
  `
})
export class PosicoesFiscaisComponent implements OnInit {
    private service = inject(PosicaoFiscalService);
    private notification = inject(NotificationService);
    private loadingService = inject(LoadingService);
    private router = inject(Router);

    posicoes = signal<PosicaoFiscal[]>([]);
    loading = signal(false);

    ngOnInit() {
        this.carregar();
    }

    carregar() {
        this.loading.set(true);
        this.service.findAll().pipe(finalize(() => this.loading.set(false))).subscribe({
            next: data => this.posicoes.set(data),
            error: () => this.notification.error('Erro ao carregar posições fiscais')
        });
    }

    nova() {
        this.router.navigate(['/fiscal/posicoes-fiscais/new']);
    }

    editar(pos: PosicaoFiscal) {
        this.router.navigate([`/fiscal/posicoes-fiscais/${pos.id}/edit`]);
    }

    deletar(pos: PosicaoFiscal) {
        if (!confirm(`Excluir a posição fiscal "${pos.nome}"?`)) return;
        this.loadingService.show();
        this.service.delete(pos.id!).pipe(finalize(() => this.loadingService.hide())).subscribe({
            next: () => {
                this.notification.success('Posição fiscal excluída!');
                this.carregar();
            },
            error: () => this.notification.error('Erro ao excluir posição fiscal')
        });
    }

    tipoNotaLabel(v: string) { return TIPO_NOTA_LABELS[v] ?? v; }
    finalidadeLabel(v: string) { return FINALIDADE_LABELS[v] ?? v; }
}
