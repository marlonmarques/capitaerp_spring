import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { FilialService } from '../../core/services/filial.service';
import { Filial } from '../../core/models/filial.model';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-filiais',
    standalone: true,
    imports: [
        CommonModule,
        PageHeaderComponent,
        DataTableComponent,
        MatButtonModule,
        MatIconModule
    ],
    template: `
    <div class="p-8">
      <app-page-header 
        title="Filiais e Caixas" 
        subtitle="Gerencie suas lojas e pontos de venda (PDV)" 
        icon="storefront"
        buttonLabel="Nova Filial"
        (buttonClick)="novoFilial()">
      </app-page-header>

      <app-data-table 
        [value]="filiais" 
        [columns]="columns" 
        [loading]="loading"
        [globalFilterFields]="['nomeFantasia', 'razaoSocial', 'cnpj']"
        (refresh)="carregarFiliais()"
        (edit)="editarFilial($event)">
      </app-data-table>
    </div>
  `
})
export class FiliaisComponent implements OnInit {
    private filialService = inject(FilialService);
    private notification = inject(NotificationService);
    private loadingService = inject(LoadingService);
    private router = inject(Router);

    filiais: Filial[] = [];
    loading = false;

    readonly columns: TableColumn[] = [
        { field: 'nomeExibicao', header: 'Nome / Nome Fantasia', sortable: true, filterable: true },
        { field: 'cnpj', header: 'CNPJ', sortable: true, filterable: true, width: '180px' },
        { field: 'matrizLabel', header: 'Matriz', sortable: true, filterable: false, width: '120px' },
        { field: 'statusLabel', header: 'Status', sortable: true, filterable: false, width: '120px' }
    ];

    ngOnInit(): void {
        this.carregarFiliais();
    }

    carregarFiliais(): void {
        this.loading = true;
        this.loadingService.show();
        this.filialService.listarTodas().pipe(
            finalize(() => {
                this.loading = false;
                this.loadingService.hide();
            })
        ).subscribe({
            next: (res) => {
                this.filiais = res.map(f => ({
                    ...f,
                    nomeExibicao: f.nomeFantasia || f.razaoSocial,
                    matrizLabel: f.isMatriz ? 'Sim' : 'Não',
                    statusLabel: f.ativo ? 'Ativo' : 'Inativo'
                }));
            },
            error: () => {
                this.notification.error('Erro ao carregar lista de Filiais');
            }
        });
    }

    novoFilial(): void {
        this.router.navigate(['/filiais/new']);
    }

    editarFilial(filial: any): void {
        if (filial.id) {
            this.router.navigate(['/filiais', filial.id, 'edit']);
        }
    }
}
