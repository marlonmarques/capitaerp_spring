import { Component, OnInit, AfterViewInit, inject, signal, viewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import { AuditService, AuditLog } from '../../core/services/audit.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [
    CommonModule, 
    DataTableComponent, 
    PageHeaderComponent,
    MatButtonModule, 
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="p-8 font-sans bg-slate-50 min-h-screen">
      <app-page-header 
        title="Logs e Auditoria Técnica" 
        subtitle="Rastreamento de transações e depuração para manutenção do sistema" 
        icon="terminal">
      </app-page-header>

      <div class="mt-6">
        <app-data-table 
          #auditTable
          [value]="logs" 
          [columns]="columns" 
          [loading]="loading"
          [showActions]="false"
          [globalFilterFields]="['autor', 'acao', 'entidade']"
          (refresh)="carregarLogs()">

          <!-- Template para Ação (Badge) -->
          <ng-template #acaoTpl let-acao let-row="row">
            <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm"
                  [ngClass]="{
                    'bg-emerald-100 text-emerald-800 border-emerald-200': acao === 'CREATE',
                    'bg-amber-100 text-amber-800 border-amber-200': acao === 'UPDATE',
                    'bg-rose-100 text-rose-800 border-rose-200': acao === 'DELETE',
                    'bg-blue-100 text-blue-800 border-blue-200': acao === 'LOGIN',
                    'bg-slate-100 text-slate-700 border-slate-200': acao !== 'CREATE' && acao !== 'UPDATE' && acao !== 'DELETE' && acao !== 'LOGIN'
                  }">
              {{ acao }}
            </span>
          </ng-template>

          <!-- Template para Ver Detalhes -->
          <ng-template #detalhesTpl let-detalhes let-row="row">
            <button mat-stroked-button color="primary" class="!text-[10px] !h-8 !px-3 !rounded-lg" (click)="verDetalhes(row)">
              <mat-icon class="!text-[14px]">visibility</mat-icon> Ver Logs
            </button>
          </ng-template>

        </app-data-table>
      </div>
    </div>

    <!-- Dialog de Detalhes (Inline para agilizar a visualização do admin) -->
    <ng-template #dialogTpl let-data>
      <div class="p-6 max-w-2xl bg-white rounded-2xl overflow-hidden">
        <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <mat-icon class="text-indigo-500">history</mat-icon>
            <h3 class="text-lg font-bold text-slate-800">Detalhes da Alteração</h3>
          </div>
          <button mat-icon-button (click)="dialog.closeAll()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div class="p-3 bg-slate-50 rounded-lg">
              <p class="text-slate-400 uppercase font-bold mb-1">Autor</p>
              <p class="text-slate-700 font-medium">{{ data.autor }}</p>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg">
              <p class="text-slate-400 uppercase font-bold mb-1">Data/Hora</p>
              <p class="text-slate-700 font-medium">{{ data.dataHora | date:'dd/MM/yyyy HH:mm:ss' }}</p>
            </div>
          </div>

          <div class="p-4 bg-slate-900 rounded-xl overflow-hidden shadow-inner">
            <p class="text-slate-400 text-[10px] uppercase font-bold mb-2">Payload (JSON)</p>
            <pre class="text-emerald-400 font-mono text-xs overflow-auto max-h-80 custom-scrollbar">{{ formatJson(data.detalhes) }}</pre>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button mat-flat-button color="primary" class="!rounded-xl !bg-blue-600 !px-8" (click)="dialog.closeAll()">
            Fechar
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
    pre { white-space: pre-wrap; word-wrap: break-word; }
  `]
})
export class AuditComponent implements OnInit, AfterViewInit {
  private auditService = inject(AuditService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  public dialog = inject(MatDialog);

  auditTable = viewChild<DataTableComponent>('auditTable');
  acaoTpl = viewChild<TemplateRef<any>>('acaoTpl');
  detalhesTpl = viewChild<TemplateRef<any>>('detalhesTpl');
  dialogTpl = viewChild<TemplateRef<any>>('dialogTpl');

  logs: AuditLog[] = [];
  loading = false;

  readonly columns: TableColumn[] = [
    { field: 'dataHora', header: 'Data/Hora', type: 'date', sortable: true, width: '180px' },
    { field: 'autor', header: 'Usuário', sortable: true, filterable: true, width: '220px' },
    { field: 'acao', header: 'Ação', sortable: true, filterable: true, width: '120px' },
    { field: 'entidade', header: 'Módulo', sortable: true, filterable: true },
    { field: 'detalhes', header: 'Logs', width: '150px' }
  ];

  ngOnInit(): void {
    this.carregarLogs();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const table = this.auditTable();
      if (table) {
        table.registerTemplate('acao', this.acaoTpl()!);
        table.registerTemplate('detalhes', this.detalhesTpl()!);
      }
    });
  }

  carregarLogs(): void {
    this.loading = true;
    this.loadingService.show();
    this.auditService.findAll().pipe(
      finalize(() => {
        this.loading = false;
        this.loadingService.hide();
      })
    ).subscribe({
      next: (page) => {
        this.logs = page.content;
      },
      error: () => {
        this.notification.error('Erro ao carregar logs de auditoria');
      }
    });
  }

  verDetalhes(log: AuditLog): void {
    this.dialog.open(this.dialogTpl()!, {
      data: log,
      width: '600px',
      panelClass: 'custom-dialog-container'
    });
  }

  formatJson(json: string): string {
    try {
      if (!json || json === 'Sem detalhes') return json;
      const obj = JSON.parse(json);
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return json;
    }
  }
}
