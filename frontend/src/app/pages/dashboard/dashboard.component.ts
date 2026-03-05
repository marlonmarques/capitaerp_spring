import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { EmpresaService } from '../../core/services/empresa.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatChipsModule,
    PageHeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public empresaService = inject(EmpresaService);

  // Mock data para exibição do layout profissional
  public recentProducts = [
    { id: 1, name: 'Notebook Pro X', category: 'Eletrônicos', stock: 45, price: 5490.00, status: 'Ativo' },
    { id: 2, name: 'Cadeira Ergônomica', category: 'Móveis', stock: 12, price: 1250.00, status: 'Alerta' },
    { id: 3, name: 'Mouse Sem Fio Ultra', category: 'Acessórios', stock: 156, price: 129.90, status: 'Ativo' },
    { id: 4, name: 'Monitor Ultrawide 34"', category: 'Eletrônicos', stock: 8, price: 3200.00, status: 'Ativo' }
  ];

  public recentClients = [
    { id: 101, name: 'Acme Corp', email: 'contato@acme.com', phone: '(11) 98765-4321', type: 'Empresa', status: 'Ativo' },
    { id: 102, name: 'João Silva', email: 'joao.silva@email.com', phone: '(21) 99999-8888', type: 'Pessoa Física', status: 'Ativo' },
    { id: 103, name: 'Tech Solutions LTDA', email: 'vendas@techsolutions.com', phone: '(31) 3333-4444', type: 'Empresa', status: 'Inativo' }
  ];

  ngOnInit(): void {
    // Inicialização
  }
}