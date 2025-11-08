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
            <nz-statistic 
              [nzValue]="128" 
              [nzTitle]="'Produtos'"
              [nzPrefix]="prefixTpl">
            </nz-statistic>
            <ng-template #prefixTpl>
              <i nz-icon nzType="shopping"></i>
            </ng-template>
          </nz-card>
        </div>
        
        <div nz-col [nzSpan]="6">
          <nz-card>
            <nz-statistic 
              [nzValue]="24" 
              [nzTitle]="'Categorias'"
              [nzPrefix]="prefixTpl2">
            </nz-statistic>
            <ng-template #prefixTpl2>
              <i nz-icon nzType="folder"></i>
            </ng-template>
          </nz-card>
        </div>
        
        <div nz-col [nzSpan]="6">
          <nz-card>
            <nz-statistic 
              [nzValue]="15678" 
              [nzTitle]="'Vendas'"
              [nzPrefix]="prefixTpl3">
            </nz-statistic>
            <ng-template #prefixTpl3>
              <i nz-icon nzType="dollar"></i>
            </ng-template>
          </nz-card>
        </div>
        
        <div nz-col [nzSpan]="6">
          <nz-card>
            <nz-statistic 
              [nzValue]="85" 
              [nzTitle]="'Usuários'"
              [nzSuffix]="'%'"
              [nzPrefix]="prefixTpl4">
            </nz-statistic>
            <ng-template #prefixTpl4>
              <i nz-icon nzType="user"></i>
            </ng-template>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    nz-card {
      margin-bottom: 16px;
    }
  `]
})
export class DashboardComponent { }