import { Component, OnInit, AfterViewInit, inject, signal, viewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ProdutoService, Produto } from '../../core/services/produto.service';
import { CurrencyBrPipe } from '../../shared/pipes/currency-br.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    MatButtonModule,
    MatIconModule,
    CurrencyBrPipe
  ],
  template: `
    <div class="p-8">
      <app-page-header 
        title="Gerenciamento de Produtos" 
        subtitle="Controle seu estoque, preços e variações em um único lugar" 
        icon="shopping_basket"
        buttonLabel="Novo Produto"
        (buttonClick)="novoProduto()">
        
        <div actions class="flex space-x-2">
           <button mat-stroked-button class="border-slate-200">
             <mat-icon class="mr-1">file_download</mat-icon>
             PDF
           </button>
        </div>
      </app-page-header>

      <app-data-table 
        #produtoTable
        [value]="produtoService.lista()" 
        [columns]="columns" 
        [loading]="produtoService.carregando()"
        [globalFilterFields]="['nome', 'codigoBarras']"
        (refresh)="carregarProdutos()"
        (edit)="editar($event)"
        (delete)="remover($event)">

        <ng-template #statusTpl let-status let-row="row">
          <app-status-badge [status]="status" [label]="status === 'ATIVO' ? 'Disponível' : 'Indisponível'"></app-status-badge>
        </ng-template>

        <ng-template #favoritoTpl let-favorito let-row="row">
          <button
            (click)="toggleFavorito(row, $event)"
            [title]="favorito ? 'Favorito PDV ativo — clique para remover' : 'Marcar como favorito no PDV'"
            [class]="favorito
              ? 'text-amber-400 text-xl transition-all duration-200 hover:text-amber-500 active:scale-125 cursor-pointer bg-transparent border-none p-0'
              : 'text-slate-300 text-xl transition-all duration-200 hover:text-amber-400 hover:scale-110 active:scale-125 cursor-pointer bg-transparent border-none p-0'"
            style="line-height:1">
            {{ favorito ? '★' : '☆' }}
          </button>
        </ng-template>

        <ng-template #estoqueTpl let-estoque let-row="row">
           <span class="font-bold" [ngClass]="estoque < 5 ? 'text-red-600' : 'text-slate-700'">
             {{ estoque }} un
           </span>
        </ng-template>

        <ng-template #precoTpl let-preco>
           <span class="text-blue-700 font-bold">{{ preco | currencyBr }}</span>
        </ng-template>

      </app-data-table>
    </div>
  `,
  styles: [`
    :host { display: block; background-color: #f8fafc; min-height: 100vh; }
  `]
})
export class ProductsComponent implements OnInit, AfterViewInit {
  public produtoService = inject(ProdutoService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // Referências para os templates de coluna customizados
  statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  favoritoTpl = viewChild<TemplateRef<any>>('favoritoTpl');
  estoqueTpl = viewChild<TemplateRef<any>>('estoqueTpl');
  precoTpl = viewChild<TemplateRef<any>>('precoTpl');
  produtoTable = viewChild<DataTableComponent>('produtoTable');

  readonly columns: TableColumn[] = [
    { field: 'favorito', header: '★', width: '50px' },
    { field: 'codigoBarras', header: 'Código', sortable: true, filterable: true, width: '150px' },
    { field: 'nome', header: 'Nome do Produto', sortable: true, filterable: true },
    { field: 'precoVenda', header: 'Preço de Venda', type: 'numeric', sortable: true },
    { field: 'estoqueAtual', header: 'Qtd. Estoque', type: 'numeric', sortable: true, width: '120px' },
    { field: 'status', header: 'Status', sortable: true, filterable: true, width: '150px' }
  ];

  ngOnInit(): void {
    this.carregarProdutos();
  }

  // Registramos os templates customizados na tabela inteligente após a ViewInit ou quando disponível
  ngAfterViewInit() {
    setTimeout(() => {
      const table = this.produtoTable();
      if (table) {
        if (this.statusTpl()) table.registerTemplate('status', this.statusTpl()!);
        if (this.favoritoTpl()) table.registerTemplate('favorito', this.favoritoTpl()!);
        if (this.estoqueTpl()) table.registerTemplate('estoqueAtual', this.estoqueTpl()!);
        if (this.precoTpl()) table.registerTemplate('precoVenda', this.precoTpl()!);
      }
    });
  }

  carregarProdutos(): void {
    this.produtoService.buscarTudo();
  }

  novoProduto(): void {
    this.router.navigate(['/products/new']);
  }

  editar(produto: Produto): void {
    this.router.navigate(['/products', produto.id!, 'edit']);
  }

  remover(produto: Produto): void {
    if (confirm(`Tem certeza que deseja remover ${produto.nome}?`)) {
      this.produtoService.excluir(produto.id!).subscribe({
        next: () => {
          this.snackBar.open('Produto removido', 'OK', { duration: 2000 });
          this.carregarProdutos();
        }
      });
    }
  }

  toggleFavorito(produto: Produto, event: Event): void {
    // Impede que o clique propague para o row e abra o edit
    event.stopPropagation();
    this.produtoService.toggleFavorito(produto.id!).subscribe({
      next: (atualizado) => {
        const msg = atualizado.favorito
          ? `⭐ ${produto.nome} marcado como favorito`
          : `${produto.nome} removido dos favoritos`;
        this.snackBar.open(msg, '', { duration: 2500 });
      },
      error: () => this.snackBar.open('Erro ao atualizar favorito', 'OK', { duration: 3000 })
    });
  }
}