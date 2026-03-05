import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MensagemFiscalService, MensagemFiscal } from '../../../core/services/mensagem-fiscal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-mensagens-fiscais',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule],
    template: `
    <div class="p-6 md:p-8 font-sans bg-slate-50 min-h-screen">
      <header class="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
            Mensagens Fiscais
          </h1>
          <p class="text-slate-500 font-medium">Templates de texto reutilizáveis para corpos de notas fiscais.</p>
        </div>
        <button mat-flat-button color="primary" class="!rounded-xl !h-12 !px-6 !bg-indigo-600" (click)="nova()">
          <mat-icon class="mr-2">add</mat-icon> Nova Mensagem
        </button>
      </header>

      <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden max-w-5xl mx-auto">
        <div *ngIf="loading()" class="p-12 flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <div *ngIf="!loading() && mensagens().length === 0"
          class="text-center py-16 text-slate-400">
          <mat-icon class="!text-6xl !h-16 !w-16 mb-4 text-slate-300">message</mat-icon>
          <p class="text-lg font-medium">Nenhuma mensagem cadastrada</p>
          <p class="text-sm mt-1">Clique em "Nova Mensagem" para começar.</p>
        </div>

        <div *ngIf="!loading() && mensagens().length > 0">
          <div class="px-6 py-4 bg-white border-b border-slate-100 grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div class="col-span-4">Título</div>
            <div class="col-span-3">Destino</div>
            <div class="col-span-4">Preview do Texto</div>
            <div class="col-span-1"></div>
          </div>
          <div *ngFor="let msg of mensagens(); let i = index"
            class="px-6 py-4 bg-white border-b border-slate-50 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
            <div class="col-span-4">
              <p class="font-semibold text-slate-800">{{ msg.titulo }}</p>
            </div>
            <div class="col-span-3">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                [ngClass]="msg.destino === 'FISCO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">
                <mat-icon class="!text-xs !h-3 !w-3 mr-1">{{ msg.destino === 'FISCO' ? 'account_balance' : 'business' }}</mat-icon>
                {{ msg.destino === 'FISCO' ? 'Interesse do Fisco' : 'Interesse do Contribuinte' }}
              </span>
            </div>
            <div class="col-span-4 text-sm text-slate-500 truncate font-mono">{{ msg.textoTemplate }}</div>
            <div class="col-span-1 flex justify-end gap-1">
              <button mat-icon-button class="!text-slate-400 hover:!text-indigo-600" (click)="editar(msg)" title="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button class="!text-slate-400 hover:!text-red-600" (click)="deletar(msg)" title="Excluir">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </mat-card>
    </div>
  `
})
export class MensagensFiscaisComponent implements OnInit {
    private service = inject(MensagemFiscalService);
    private notification = inject(NotificationService);
    private loadingService = inject(LoadingService);
    private router = inject(Router);

    mensagens = signal<MensagemFiscal[]>([]);
    loading = signal(false);

    ngOnInit() {
        this.carregar();
    }

    carregar() {
        this.loading.set(true);
        this.service.findAll().pipe(finalize(() => this.loading.set(false))).subscribe({
            next: data => this.mensagens.set(data),
            error: () => this.notification.error('Erro ao carregar mensagens fiscais')
        });
    }

    nova() {
        this.router.navigate(['/fiscal/mensagens-fiscais/new']);
    }

    editar(msg: MensagemFiscal) {
        this.router.navigate([`/fiscal/mensagens-fiscais/${msg.id}/edit`]);
    }

    deletar(msg: MensagemFiscal) {
        if (!confirm(`Excluir a mensagem "${msg.titulo}"? Esta ação não pode ser desfeita.`)) return;
        this.loadingService.show();
        this.service.delete(msg.id!).pipe(finalize(() => this.loadingService.hide())).subscribe({
            next: () => {
                this.notification.success('Mensagem excluída com sucesso!');
                this.carregar();
            },
            error: () => this.notification.error('Erro ao excluir mensagem')
        });
    }
}
