import { Component } from '@angular/core';

@Component({
  selector: 'app-products',
  template: `
    <div>
      <div nz-row nzJustify="space-between" nzAlign="middle">
        <div nz-col>
          <h1>Produtos</h1>
        </div>
        <div nz-col>
          <button nz-button nzType="primary">
            <i nz-icon nzType="plus"></i>
            Novo Produto
          </button>
        </div>
      </div>
      
      <nz-card>
        <p>Lista de produtos será implementada aqui...</p>
      </nz-card>
    </div>
  `
})
export class ProductsComponent { }