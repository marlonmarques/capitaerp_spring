import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ClienteService, Cliente } from '../../core/services/cadastros/cliente.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-clientes',
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
        title="Clientes" 
        subtitle="Gerenciamento de clientes e pessoas" 
        icon="groups"
        buttonLabel="Novo Cliente"
        (buttonClick)="novoCliente()">
      </app-page-header>

      <app-data-table 
        [value]="clientes" 
        [columns]="columns" 
        [loading]="loading"
        [globalFilterFields]="['name', 'lastName', 'razaoSocial', 'cpf']"
        (refresh)="carregarClientes()"
        (edit)="editarCliente($event)"
        (delete)="excluirCliente($event)">
      </app-data-table>
    </div>
  `
})
export class ClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  clientes: Cliente[] = [];
  loading = false;

  readonly columns: TableColumn[] = [
    { field: 'name', header: 'Nome / Nome Fantasia', sortable: true, filterable: true },
    { field: 'cpf', header: 'Documento', sortable: true, filterable: true, width: '180px' },
    { field: 'telefone', header: 'Telefone', sortable: true, filterable: true, width: '160px' },
    { field: 'celular', header: 'Celular', sortable: true, filterable: true, width: '160px' }
  ];

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.loading = true;
    this.loadingService.show();
    this.clienteService.findAllPaged(0, 100).pipe(
      finalize(() => {
        this.loading = false;
        this.loadingService.hide();
      })
    ).subscribe({
      next: (page) => {
        this.clientes = page.content.map(c => ({
          ...c,
          name: c.tipoPessoa === 2 ? c.razaoSocial || c.name : `${c.name} ${c.lastName || ''}`.trim()
        }));
      },
      error: () => {
        this.notification.error('Erro ao carregar lista de Clientes');
      }
    });
  }

  novoCliente(): void {
    this.router.navigate(['/clientes/new']);
  }

  editarCliente(cliente: Cliente): void {
    if (cliente.id) {
      this.router.navigate(['/clientes', cliente.id, 'edit']);
    }
  }

  excluirCliente(cliente: Cliente): void {
    if (cliente.id && confirm(`Tem certeza que deseja excluir ${cliente.name}?`)) {
      this.loadingService.show();
      this.clienteService.delete(cliente.id).pipe(
        finalize(() => this.loadingService.hide())
      ).subscribe({
        next: () => {
          this.notification.success('Cliente excluído com sucesso!');
          this.carregarClientes();
        },
        error: () => this.notification.error('Erro ao excluir Cliente.')
      });
    }
  }
}
