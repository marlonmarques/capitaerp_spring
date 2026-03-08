import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';

import { UserService } from '../../core/services/user.service';
import { FilialService } from '../../core/services/filial.service';
import { Role, User } from '../../core/auth/models/user.model';
import { Filial } from '../../core/models/filial.model';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MultiSelectModule
  ],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  private filialService = inject(FilialService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  userId: number | null = null;

  rolesList = signal<{ label: string, value: number }[]>([]);
  allFiliais = signal<{ label: string, value: string | undefined }[]>([]);

  userForm: FormGroup = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    filialId: [null, Validators.required],
    rolesIds: [[], Validators.required],
    filiaisIds: [[]]
  });

  ngOnInit() {
    this.carregarRoles();
    this.carregarFiliais();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.userId = +id;
        this.carregarUser(this.userId);
        this.userForm.get('password')?.clearValidators();
      } else {
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      }
      this.userForm.get('password')?.updateValueAndValidity();
    });
  }

  carregarRoles(): void {
    this.userService.findAllRoles().subscribe(data => {
      this.rolesList.set(data.map(r => ({
        label: r.authority.replace('ROLE_', ''),
        value: r.id
      })));
    });
  }

  carregarFiliais(): void {
    this.filialService.listarTodas().subscribe(data => {
      this.allFiliais.set(data.map(f => ({
        label: f.nomeFantasia || f.razaoSocial,
        value: f.id
      })));
    });
  }

  carregarUser(id: number): void {
    this.loadingService.show();
    this.userService.findById(id).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          filialId: user.filialId,
          rolesIds: user.roles.map(r => r.id),
          filiaisIds: user.filiais?.map(f => f.id)
        });
      },
      error: () => {
        this.notification.error('Erro ao buscar Usuário');
        this.voltar();
      }
    });
  }

  salvar(): void {
    this.userForm.markAllAsTouched();
    
    if (this.userForm.invalid) {
      this.notification.warning('Por favor, corrija os erros no formulário antes de salvar.');
      return;
    }

    this.loadingService.show();
    const formValue = this.userForm.value;
    
    const userToSave: any = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      password: formValue.password,
      filialId: formValue.filialId,
      roles: formValue.rolesIds.map((id: number) => ({ id })),
      filiais: formValue.filiaisIds.map((id: string) => ({ id }))
    };

    const request$ = this.isEditMode() && this.userId
      ? this.userService.update(this.userId, userToSave)
      : this.userService.insert(userToSave);

    request$.pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: () => {
        this.notification.success(`Usuário ${this.isEditMode() ? 'atualizado' : 'cadastrado'} com sucesso!`);
        this.voltar();
      },
      error: (err) => {
          console.error(err);
          this.notification.error('Falha ao salvar o usuário. Verifique se o email já existe.');
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/users']);
  }
}
