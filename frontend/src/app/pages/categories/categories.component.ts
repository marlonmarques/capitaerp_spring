import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { CategoriaService, Categoria } from '../../core/services/cadastros/categoria.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-categories',
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
        title="Categorias" 
        subtitle="Gerenciamento de tipos de produtos e serviços" 
        icon="folder"
        buttonLabel="Nova Categoria"
        (buttonClick)="novaCategoria()">
      </app-page-header>

      <app-data-table 
        [value]="categorias" 
        [columns]="columns" 
        [loading]="loading"
        [globalFilterFields]="['nome', 'tipo']"
        (refresh)="carregarCategorias()"
        (edit)="editarCategoria($event)"
        (delete)="excluirCategoria($event)">
      </app-data-table>
    </div>
  `
})
export class CategoriesComponent implements OnInit {
  private categoriaService = inject(CategoriaService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  categorias: Categoria[] = [];
  loading = false;

  readonly columns: TableColumn[] = [
    { field: 'nome', header: 'Nome da Categoria', sortable: true, filterable: true },
    { field: 'tipo', header: 'Tipo', sortable: true, filterable: true, width: '200px' },
    { field: 'criadoEm', header: 'Criado em', type: 'date', sortable: true, width: '150px' }
  ];

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.loading = true;
    this.loadingService.show();
    this.categoriaService.findAllPaged(undefined, 0, 100).pipe(
      finalize(() => {
        this.loading = false;
        this.loadingService.hide();
      })
    ).subscribe({
      next: (page) => {
        this.categorias = page.content;
      },
      error: () => {
        this.notification.error('Erro ao carregar as categorias');
      }
    });
  }

  novaCategoria(): void {
    this.router.navigate(['/categories/new']);
  }

  editarCategoria(categoria: Categoria): void {
    if (categoria.id) {
      this.router.navigate(['/categories', categoria.id, 'edit']);
    }
  }

  excluirCategoria(categoria: Categoria): void {
    if (categoria.id && confirm(`Tem certeza que deseja excluir ${categoria.nome}?`)) {
      this.loadingService.show();
      this.categoriaService.delete(categoria.id).pipe(
        finalize(() => this.loadingService.hide())
      ).subscribe({
        next: () => {
          this.notification.success('Categoria excluída com sucesso!');
          this.carregarCategorias();
        },
        error: () => this.notification.error('Erro ao excluir categoria')
      });
    }
  }
}