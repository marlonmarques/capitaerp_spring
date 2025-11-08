import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo ao Capital ERP</p>
      
      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="6">
          <nz-card>
            <div class="statistic">
              <i nz-icon nzType="shopping" style="font-size: 24px; color: #1890ff;"></i>
              <h3>128</h3>
              <p>Produtos</p>
            </div>
          </nz-card>
        </div>
        
        <div nz-col [nzSpan]="6">
          <nz-card>
            <div class="statistic">
              <i nz-icon nzType="folder" style="font-size: 24px; color: #52c41a;"></i>
              <h3>24</h3>
              <p>Categorias</p>
            </div>
          </nz-card>
        </div>
        
        <div nz-col [nzSpan]="6">
          <nz-card>
            <div class="statistic">
              <i nz-icon nzType="dollar" style="font-size: 24px; color: #faad14;"></i>
              <h3>15.678</h3>
              <p>Vendas</p>
            </div>
          </nz-card>
        </div>
        
        <div nz-col [nzSpan]="6">
          <nz-card>
            <div class="statistic">
              <i nz-icon nzType="user" style="font-size: 24px; color: #f5222d;"></i>
              <h3>85%</h3>
              <p>Usuários Ativos</p>
            </div>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .statistic {
      text-align: center;
      h3 {
        margin: 8px 0;
        font-size: 24px;
        font-weight: bold;
      }
      p {
        margin: 0;
        color: #666;
      }
    }
  `]
})
export class DashboardComponent { }