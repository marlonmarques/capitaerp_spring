import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { FornecedorService, Fornecedor } from '../../core/services/cadastros/fornecedor.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-fornecedores',
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
        title="Fornecedores" 
        subtitle="Gerenciamento da sua rede de Fornecedores e parceiros" 
        icon="building"
        buttonLabel="Novo Fornecedor"
        (buttonClick)="novoFornecedor()">
      </app-page-header>

      <app-data-table 
        [value]="fornecedores" 
        [columns]="columns" 
        [loading]="loading"
        [globalFilterFields]="['nomeFantasia', 'razaoSocial', 'cnpj']"
        (refresh)="carregarFornecedores()"
        (edit)="editarFornecedor($event)"
        (delete)="excluirFornecedor($event)">
      </app-data-table>
    </div>
  `
})
export class FornecedoresComponent implements OnInit {
    private fornecedorService = inject(FornecedorService);
    private notification = inject(NotificationService);
    private loadingService = inject(LoadingService);
    private router = inject(Router);

    fornecedores: Fornecedor[] = [];
    loading = false;

    readonly columns: TableColumn[] = [
        { field: 'nomeFantasia', header: 'Nome Fantasia', sortable: true, filterable: true },
        { field: 'razaoSocial', header: 'Razão Social', sortable: true, filterable: true },
        { field: 'cnpj', header: 'CNPJ', sortable: true, filterable: true, width: '200px' },
        { field: 'criadoEm', header: 'Cadastrado em', type: 'date', sortable: true, width: '150px' }
    ];

    ngOnInit(): void {
        this.carregarFornecedores();
    }

    carregarFornecedores(): void {
        this.loading = true;
        this.loadingService.show();
        this.fornecedorService.findAllPaged(0, 100).pipe(
            finalize(() => {
                this.loading = false;
                this.loadingService.hide();
            })
        ).subscribe({
            next: (page) => {
                this.fornecedores = page.content;
            },
            error: () => {
                this.notification.error('Erro ao carregar lista de Fornecedores');
            }
        });
    }

    novoFornecedor(): void {
        this.router.navigate(['/fornecedores/new']);
    }

    editarFornecedor(fornecedor: Fornecedor): void {
        if (fornecedor.id) {
            this.router.navigate(['/fornecedores', fornecedor.id, 'edit']);
        }
    }

    excluirFornecedor(fornecedor: Fornecedor): void {
        if (fornecedor.id && confirm(`Tem certeza que deseja excluir ${fornecedor.nomeFantasia}?`)) {
            this.loadingService.show();
            this.fornecedorService.delete(fornecedor.id).pipe(
                finalize(() => this.loadingService.hide())
            ).subscribe({
                next: () => {
                    this.notification.success('Fornecedor excluído! Verifique os vínculos.');
                    this.carregarFornecedores();
                },
                error: () => this.notification.error('Erro ao excluir Fornecedor. Pode estar vinculado a um produto')
            });
        }
    }
}
