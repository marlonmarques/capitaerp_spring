import { Component, OnInit, AfterViewInit, inject, signal, viewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { UserService } from '../../core/services/user.service';
import { User } from '../../core/auth/models/user.model';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    DataTableComponent, 
    PageHeaderComponent,
    MatButtonModule, 
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="p-8 font-sans bg-slate-50 min-h-screen">
      <app-page-header 
        title="Usuários e Permissões" 
        subtitle="Gerencie quem tem acesso ao sistema e quais as suas funções" 
        icon="people"
        buttonLabel="Novo Usuário"
        (buttonClick)="novoUser()">
      </app-page-header>

      <!-- Grid Principal -->
      <div class="mt-6">
        <app-data-table 
          #userTable
          [value]="users" 
          [columns]="columns" 
          [loading]="loading"
          [globalFilterFields]="['firstName', 'lastName', 'email']"
          (refresh)="carregarUsers()"
          (edit)="editarUser($event)"
          (delete)="excluirUser($event)">

          <!-- Template Customizado para a coluna de 'roles' para prevenir [object Object] -->
          <ng-template #rolesTpl let-roles let-row="row">
            <div class="flex flex-wrap gap-1">
              <span *ngFor="let role of roles" 
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm"
                    [ngClass]="{
                      'bg-blue-100 text-blue-800 border-blue-200': role.authority === 'ROLE_ADMIN',
                      'bg-zinc-100 text-zinc-700 border-zinc-200': role.authority === 'ROLE_OPERATOR',
                      'bg-indigo-100 text-indigo-700 border-indigo-200': role.authority !== 'ROLE_ADMIN' && role.authority !== 'ROLE_OPERATOR'
                    }">
                {{ role.authority.replace('ROLE_', '') }}
              </span>
            </div>
          </ng-template>

        </app-data-table>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class UsersComponent implements OnInit, AfterViewInit {
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  userTable = viewChild<DataTableComponent>('userTable');
  rolesTpl = viewChild<TemplateRef<any>>('rolesTpl');

  users: User[] = [];
  loading = false;

  readonly columns: TableColumn[] = [
    { field: 'firstName', header: 'Nome', sortable: true, filterable: true },
    { field: 'lastName', header: 'Sobrenome', sortable: true, filterable: true },
    { field: 'email', header: 'Email', sortable: true, filterable: true },
    { field: 'roles', header: 'Perfis', width: '280px' }
  ];

  ngOnInit(): void {
    this.carregarUsers();
  }

  ngAfterViewInit(): void {
    // Registro dos templates de coluna na tabela genérica
    setTimeout(() => {
      const table = this.userTable();
      const tpl = this.rolesTpl();
      if (table && tpl) {
        table.registerTemplate('roles', tpl);
      }
    });
  }

  carregarUsers(): void {
    this.loading = true;
    this.loadingService.show();
    this.userService.findAll(0, 100).pipe(
      finalize(() => {
        this.loading = false;
        this.loadingService.hide();
      })
    ).subscribe({
      next: (page) => {
        this.users = page.content;
      },
      error: () => {
        this.notification.error('Erro ao carregar lista de Usuários');
      }
    });
  }

  novoUser(): void {
    this.router.navigate(['/users/new']);
  }

  editarUser(user: User): void {
    if (user.id) {
      this.router.navigate(['/users', user.id, 'edit']);
    }
  }

  excluirUser(user: User): void {
    if (user.id && confirm(`Deseja realmente excluir o usuário ${user.firstName}? Esta ação é irreversível.`)) {
      this.loadingService.show();
      this.userService.delete(user.id).pipe(
        finalize(() => this.loadingService.hide())
      ).subscribe({
        next: () => {
          this.notification.success('Usuário removido com sucesso!');
          this.carregarUsers();
        },
        error: () => this.notification.error('Falha ao remover usuário. Verifique se ele possui registros vinculados.')
      });
    }
  }
}