import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, InputTextModule, ButtonModule],
  template: `
    <p-dialog [(visible)]="visible" [header]="header" [modal]="true" [style]="{width: '350px'}" 
              [draggable]="false" [resizable]="false" (onHide)="onClose()" [closable]="true"
              appendTo="body" class="auth-dialog">
      <div class="flex flex-col items-center p-4">
        <i class="pi pi-lock text-5xl text-blue-500 mb-4 animate-bounce"></i>
        <p class="text-sm text-slate-600 text-center mb-6">
          {{ message || 'Esta operação exige autorização de um administrador ou supervisor.' }}
        </p>

        <div class="w-full mb-4">
          <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Código / Senha de Autorização</label>
          <input #authInput type="password" pInputText [(ngModel)]="authCode" 
                 class="w-full p-3 text-center text-xl font-bold tracking-widest rounded-xl border-2 border-slate-100 focus:border-blue-400 bg-slate-50"
                 placeholder="••••••" (keyup.enter)="authorize()" autocomplete="new-password" />
        </div>

        <button pButton label="Confirmar Acesso" icon="pi pi-verified" 
                class="w-full p-button-lg rounded-xl shadow-lg shadow-blue-100 py-4 transition-transform active:scale-95"
                (click)="authorize()" [loading]="loading"></button>
        
        <p class="mt-4 text-[10px] text-slate-400 font-mono uppercase tracking-tighter">Segurança Capital ERP</p>
      </div>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-class(.auth-dialog) .p-dialog-header { padding: 1.5rem 1.5rem 0; border: none; }
    :host ::ng-class(.auth-dialog) .p-dialog-content { padding: 0 1.5rem 1.5rem; }
  `]
})
export class AuthModalComponent {
  @Input() header: string = '🔓 Autorização Necessária';
  @Input() message: string = '';
  @Output() onAuthorized = new EventEmitter<any>();
  @Output() onCancelled = new EventEmitter<void>();

  @ViewChild('authInput') authInput!: ElementRef;

  visible = false;
  authCode = '';
  loading = false;
  context: any = null; // Para saber o que estamos autorizando (ex: 'price_change', index)

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  show(context?: any, customHeader?: string, customMsg?: string) {
    this.context = context;
    if (customHeader) this.header = customHeader;
    if (customMsg) this.message = customMsg;
    
    this.authCode = '';
    this.visible = true;
    this.loading = false;

    // Timeout para dar foco após render
    setTimeout(() => {
        this.authInput?.nativeElement?.focus();
    }, 300);
  }

  authorize() {
    if (!this.authCode) return;

    this.loading = true;

    // Lógica resiliente: ADMIN tem acesso total, ou código supervisor (ex: 1234)
    // Em um sistema real, isso chamaria uma API de autorização rápida.
    setTimeout(() => {
        if (this.authCode === '1234' || (this.authService.hasRole('ROLE_ADMIN') && this.authCode.length > 0)) {
            this.visible = false;
            this.onAuthorized.emit({ code: this.authCode, context: this.context });
            this.messageService.add({ severity: 'success', summary: 'Acesso Liberado', detail: 'Operação autorizada com sucesso.' });
        } else {
            this.messageService.add({ severity: 'error', summary: 'Acesso Negado', detail: 'Código de autorização inválido.' });
            this.authCode = '';
            this.authInput?.nativeElement?.focus();
        }
        this.loading = false;
    }, 500);
  }

  onClose() {
    this.visible = false;
    this.onCancelled.emit();
  }
}
