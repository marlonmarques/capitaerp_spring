import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ContaBancariaService, ContaBancaria, BANCOS_DISPONIVEIS } from '../../../core/services/financeiro/conta-bancaria.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-contas-bancarias',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 p-4 md:p-6">
      <header class="flex items-center justify-between mb-8 pb-5 border-b border-slate-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <mat-icon class="text-orange-600 !text-xl">account_balance</mat-icon>
          </div>
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">Contas Bancárias</h1>
            <p class="text-slate-500 font-medium text-sm">Gerencie contas, bancos, saldos e integrações com gateways.</p>
          </div>
        </div>
        <button mat-flat-button color="primary" class="!rounded-xl !h-10 !px-6 !bg-orange-600" routerLink="/financeiro/contas-bancarias/new">
          <mat-icon class="mr-1">add</mat-icon> Nova Conta
        </button>
      </header>

      <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden w-full mx-auto">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 class="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
            <mat-icon class="text-slate-400 text-[18px]">list</mat-icon> Listagem de Contas
          </h2>
          <button mat-icon-button (click)="carregar()" matTooltip="Atualizar lista">
            <mat-icon class="text-slate-400 hover:text-orange-500">refresh</mat-icon>
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr class="bg-white border-b border-slate-100/80 text-xs text-slate-500 font-bold tracking-widest uppercase">
                <th class="py-4 pl-6 pr-3 w-1/4">Nome da Conta</th>
                <th class="py-4 px-3 w-1/4">Banco / Gateway</th>
                <th class="py-4 px-3 text-center w-1/6">Agência/Conta</th>
                <th class="py-4 px-3 text-right">Saldo Inicial</th>
                <th class="py-4 pr-6 pl-3 text-center w-28">Status</th>
                <th class="py-4 pr-6 pl-3 text-right w-24">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 bg-white">
              <tr *ngFor="let conta of contas()" class="hover:bg-slate-50/60 transition-colors group">
                <td class="py-3 pl-6 pr-3">
                  <div class="font-bold text-slate-800 text-sm flex items-center gap-2">
                    {{ conta.nome }}
                    <mat-icon *ngIf="conta.padrao" class="!text-xs text-amber-500" matTooltip="Conta Padrão">star</mat-icon>
                  </div>
                </td>
                <td class="py-3 px-3">
                  <span class="text-sm text-slate-600 font-medium bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {{ getBancoLabel(conta.codigoBanco) }}
                  </span>
                  <mat-icon *ngIf="conta.viaApi" class="!text-sm text-emerald-500 ml-2 align-middle" matTooltip="Integração via API Ativa">api</mat-icon>
                </td>
                <td class="py-3 px-3 text-center">
                  <span *ngIf="conta.agencia && conta.numeroConta" class="text-sm text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded">
                    {{ conta.agencia }} / {{ conta.numeroConta }}
                  </span>
                  <span *ngIf="!conta.agencia && !conta.numeroConta" class="text-xs text-slate-400 italic">Via Gateway/Sem Ag/Cc</span>
                </td>
                <td class="py-3 px-3 text-right">
                  <span class="text-sm font-bold" [ngClass]="conta.saldoInicial! >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                    {{ conta.saldoInicial | currency:'BRL' }}
                  </span>
                </td>
                <td class="py-3 pr-6 pl-3 text-center">
                  <span class="px-3 py-1 text-xs font-bold rounded-full"
                        [ngClass]="conta.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                    {{ conta.ativo ? 'ATIVO' : 'INATIVO' }}
                  </span>
                </td>
                <td class="py-3 pr-6 pl-3 text-right">
                  <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button mat-icon-button class="text-amber-500 scale-90" [routerLink]="['/financeiro/contas-bancarias', conta.id, 'edit']" matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button class="text-rose-400 scale-90" (click)="removerConta(conta)" matTooltip="Excluir">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="contas().length === 0 && !(loadingService.loading$ | async)">
                <td colspan="6" class="py-12 text-center text-slate-400">
                  Nenhuma conta bancária encontrada. <br>
                  <a routerLink="/financeiro/contas-bancarias/new" class="text-orange-500 font-medium hover:underline mt-2 inline-block">Criar primeira conta</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </mat-card>
    </div>
  `
})
export class ContasBancariasComponent implements OnInit {
  private service = inject(ContaBancariaService);
  private notification = inject(NotificationService);
  protected loadingService = inject(LoadingService);

  contas = signal<ContaBancaria[]>([]);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loadingService.show();
    this.service.findAll().pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (data) => this.contas.set(data),
      error: () => this.notification.error('Erro ao carregar contas bancárias.')
    });
  }

  removerConta(conta: ContaBancaria): void {
    if (confirm(`Tem certeza que deseja excluir a conta '${conta.nome}'?`)) {
      this.service.delete(conta.id!).subscribe({
        next: () => {
          this.notification.success('Conta excluída com sucesso!');
          this.carregar();
        },
        error: () => this.notification.error('Erro ao excluir conta.')
      });
    }
  }

  getBancoLabel(codigo: string): string {
    const b = BANCOS_DISPONIVEIS.find(x => x.value === codigo);
    return b ? b.label : codigo;
  }
}
