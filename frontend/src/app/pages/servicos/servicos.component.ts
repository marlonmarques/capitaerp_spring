import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyBrPipe } from '../../shared/pipes/currency-br.pipe';
import { ServicoService, Servico } from '../../core/services/servico.service';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    MatButtonModule,
    MatIconModule,
    CurrencyBrPipe
  ],
  template: `
    <div class="p-8">
      <app-page-header 
        title="Gerenciamento de Serviços" 
        subtitle="Controle seus serviços prestados e tabelas de tributação (IBS/CBS/ISS)" 
        icon="engineering"
        buttonLabel="Novo Serviço"
        (buttonClick)="novo()">
        

      </app-page-header>

      <!-- Lista / Datatable Simplificada para agilizar (uma vez que shared/DataTable depende do PrimeNG que vc citou na sua v18) -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th class="p-4 font-semibold">Código</th>
                <th class="p-4 font-semibold">Nome do Serviço</th>
                <th class="p-4 font-semibold">Preço</th>
                <th class="p-4 font-semibold">CNAE / NBS</th>
                <th class="p-4 font-semibold">Status</th>
                <th class="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors" *ngFor="let serv of servicos">
                <td class="p-4 text-sm text-slate-600 font-medium">{{ serv.codigoInterno || 'N/A' }}</td>
                <td class="p-4 text-sm text-slate-800 font-bold">{{ serv.nome }}</td>
                <td class="p-4 text-sm text-blue-700 font-bold">{{ serv.preco | currencyBr }}</td>
                <td class="p-4 text-sm text-slate-600">
                  <div class="flex flex-col">
                    <span class="text-xs text-slate-500">CNAE: <span class="font-bold">{{serv.cnaeCodigo || '-'}}</span></span>
                    <span class="text-xs text-slate-500">NBS: <span class="font-bold">{{serv.nbsCodigo || '-'}}</span></span>
                  </div>
                </td>
                <td class="p-4 text-sm">
                  <app-status-badge [status]="serv.status || 'INATIVO'" [label]="serv.status === 'ATIVO' ? 'Ativo' : 'Inativo'"></app-status-badge>
                </td>
                <td class="p-4 text-right">
                  <button mat-icon-button color="primary" (click)="editar(serv)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="remover(serv)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </tr>
              <tr *ngIf="servicos.length === 0">
                <td colspan="6" class="p-8 text-center text-slate-500">
                  Nenhum serviço encontrado. Cadastre o primeiro!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background-color: #f8fafc; min-height: 100vh; }
  `]
})
export class ServicosComponent implements OnInit {
  public servicoService = inject(ServicoService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  servicos: Servico[] = [];

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.servicoService.findAllPaged(0, 50).subscribe({
      next: (page) => {
        this.servicos = page.content;
      }
    });
  }

  novo(): void {
    this.router.navigate(['/servicos/new']);
  }

  editar(servico: Servico): void {
    this.router.navigate(['/servicos', servico.id, 'edit']);
  }

  remover(servico: Servico): void {
    if (confirm(`Tem certeza que deseja remover o serviço ${servico.nome}?`)) {
      if (!servico.id) return;
      this.servicoService.delete(servico.id).subscribe({
        next: () => {
          this.snackBar.open('Serviço removido com sucesso', 'OK', { duration: 2000 });
          this.carregar();
        },
        error: () => this.snackBar.open('Erro ao remover', 'OK', { duration: 2000 })
      });
    }
  }
}
