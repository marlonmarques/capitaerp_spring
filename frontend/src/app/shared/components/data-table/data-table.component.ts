import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, TemplateRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ChipModule } from 'primeng/chip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'currency' | 'date' | 'status' | 'boolean' | 'numeric';
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  pipe?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    TooltipModule,
    MultiSelectModule,
    FormsModule,
    FloatLabelModule,
    ChipModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="card shadow-sm border border-slate-200 rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 flex flex-col h-full relative z-1">
      <p-table #dt 
        [value]="value" 
        [columns]="columns" 
        [paginator]="true" 
        [rows]="rows" 
        [showCurrentPageReport]="true"
        [tableStyle]="{ 'min-width': minWidth || '50rem' }"
        currentPageReportTemplate="Exibindo {first} a {last} de {totalRecords} registros"
        [rowsPerPageOptions]="[10, 25, 50, 100]"
        [loading]="loading"
        [globalFilterFields]="globalFilterFields"
        [responsiveLayout]="'scroll'"
        [rowHover]="true"
        [showGridlines]="false"
        styleClass="p-datatable-sm p-datatable-striped">
        
        <!-- Header / Toolbar -->
        <ng-template pTemplate="caption">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 border-b border-slate-100 dark:border-slate-700/50">
            <div class="flex items-center space-x-2 w-full md:w-auto">
              <div class="relative w-full md:w-64">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10"></i>
                <input pInputText type="text" 
                       (input)="onGlobalFilter(dt, $event)" 
                       placeholder="Busca rápida..." 
                       style="padding-left: 2.5rem !important;"
                       class="w-full text-sm border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 rounded-lg pr-4 py-2 hover:border-blue-300 transition-colors relative"/>
              </div>
              <button pButton type="button" icon="pi pi-filter-slash" 
                      class="h-[38px] w-[38px] p-0 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all flex-shrink-0" 
                      pTooltip="Limpar"
                      (click)="clearFilters(dt)"></button>
            </div>
            
            <div class="flex items-center space-x-2">
               <button pButton type="button" icon="pi pi-file-excel" 
                       class="p-button-rounded p-button-success p-button-text hover:bg-emerald-50" 
                       pTooltip="Exportar Excel" (click)="dt.exportCSV()"></button>
               <button pButton type="button" icon="pi pi-refresh" 
                       class="p-button-rounded p-button-info p-button-text" 
                       pTooltip="Atualizar" (click)="refresh.emit()"></button>
               <ng-content select="[extraActions]"></ng-content>
            </div>
          </div>
        </ng-template>

        <!-- Columns Header -->
        <ng-template pTemplate="header" let-columns>
          <tr class="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
            <th *ngFor="let col of columns; let first = first" 
                [pSortableColumn]="col.field" 
                [style.width]="col.width"
                class="text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] py-4 px-6 whitespace-nowrap text-left"
                [ngClass]="{'pl-8': first}">
              <div class="flex items-center justify-start gap-2">
                <span>{{ col.header }}</span>
                <div class="flex items-center">
                  <p-sortIcon *ngIf="col.sortable !== false" [field]="col.field" class="opacity-50 hover:opacity-100 overflow-hidden ml-1"></p-sortIcon>
                  <p-columnFilter *ngIf="col.filterable !== false" 
                                  [type]="getFilterType(col)" 
                                  [field]="col.field" 
                                  display="menu" 
                                  class="ml-1"></p-columnFilter>
                </div>
              </div>
            </th>
            <th *ngIf="showActions" class="w-24 px-6 text-center text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">Ações</th>
          </tr>
        </ng-template>

        <!-- Body -->
        <ng-template pTemplate="body" let-rowData let-columns="columns">
          <tr class="hover:bg-blue-50/50 dark:hover:bg-indigo-900/30 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0 h-14 bg-white dark:bg-slate-800">
            <td *ngFor="let col of columns; let first = first" class="px-6 py-3 text-sm text-slate-700 dark:text-slate-300 font-medium text-left align-middle" [ngClass]="{'pl-8': first}">
              <!-- Custom template per columns if provided -->
              <ng-container *ngIf="columnTemplates[col.field]">
                <ng-container *ngTemplateOutlet="columnTemplates[col.field]; context: { $implicit: rowData[col.field], row: rowData }"></ng-container>
              </ng-container>
              
              <!-- Default renderer if no template -->
              <ng-container *ngIf="!columnTemplates[col.field]">
                <ng-container [ngSwitch]="col.type">
                  <span *ngSwitchCase="'currency'">{{ rowData[col.field] | currency:'BRL':'symbol':'1.2-2' }}</span>
                  <span *ngSwitchCase="'date'">{{ rowData[col.field] | date:'dd/MM/yyyy' }}</span>
                  <span *ngSwitchCase="'boolean'">
                    <i class="pi" [ngClass]="rowData[col.field] ? 'pi-check text-green-500' : 'pi-times text-red-500'"></i>
                  </span>
                  <span *ngSwitchDefault>{{ rowData[col.field] }}</span>
                </ng-container>
              </ng-container>
            </td>
            
            <td *ngIf="showActions" class="px-6 py-2 text-center">
              <div class="flex items-center justify-center gap-1">
                <button mat-icon-button 
                        class="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors w-10 h-10 flex items-center justify-center rounded-full" 
                        title="Editar" (click)="edit.emit(rowData)">
                        <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button 
                        class="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/50 transition-colors w-10 h-10 flex items-center justify-center rounded-full" 
                        title="Excluir" (click)="delete.emit(rowData)">
                        <mat-icon>delete</mat-icon>
                </button>
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- Empty State -->
        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="columns.length + (showActions ? 1 : 0)" class="text-center py-12 bg-slate-50/50 dark:bg-slate-800/50 relative">
              <div class="flex flex-col items-center">
                <i class="pi pi-database text-6xl text-slate-200 dark:text-slate-700 mb-4 animate-bounce"></i>
                <h4 class="text-lg font-bold text-slate-800 dark:text-slate-200">Nenhum registro encontrado</h4>
                <p class="text-slate-400 dark:text-slate-500 max-w-xs">Tente ajustar seus filtros ou cadastre um novo item.</p>
              </div>
            </td>
          </tr>
        </ng-template>

      </p-table>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-datatable .p-datatable-header {
        background: transparent;
        border: none;
        padding: 0.75rem 1.25rem;
      }
      .p-paginator {
        border-top: 1px solid #e2e8f0;
        background: rgba(248, 250, 252, 0.5); /* #f8fafc com 50% de opacidade */
        padding: 0.5rem;
        font-size: 0.875rem;
      }
      .p-datatable .p-column-filter-menu-button:hover,
      .p-datatable .p-column-header-content p-sorticon:hover {
        background: #f1f5f9;
        border-radius: 4px;
      }
    }
  `]
})
export class DataTableComponent {
  @Input() value: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() rows = 10;
  @Input() minWidth = '';
  @Input() loading = false;
  @Input() globalFilterFields: string[] = [];
  @Input() showActions = true;

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() refresh = new EventEmitter<void>();

  // Dicionário de templates injetados externamente
  columnTemplates: { [key: string]: TemplateRef<any> } = {};

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clearFilters(table: any) {
    table.clear();
  }

  getFilterType(col: TableColumn): string {
    switch (col.type) {
      case 'numeric': return 'numeric';
      case 'date': return 'date';
      case 'boolean': return 'boolean';
      default: return 'text';
    }
  }

  // Método opcional para injetar templates
  registerTemplate(name: string, template: TemplateRef<any>) {
    this.columnTemplates[name] = template;
  }
}
