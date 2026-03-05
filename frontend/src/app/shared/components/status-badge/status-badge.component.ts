import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-status-badge',
    standalone: true,
    imports: [CommonModule],
    template: `
    <span 
      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm transition-all"
      [ngClass]="badgeClass()">
      <span class="w-1.5 h-1.5 rounded-full mr-2" [ngClass]="dotClass()"></span>
      {{ label || status }}
    </span>
  `,
    styles: [`
    :host { display: inline-block; }
  `]
})
export class StatusBadgeComponent {
    @Input() status: string | boolean | any = '';
    @Input() label = '';

    badgeClass = computed(() => {
        const s = String(this.status).toLowerCase();
        switch (s) {
            case 'ativo': case 'active': case 'true': case 'pago': case 'concluido': case 'success':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-emerald-700/5';
            case 'inativo': case 'inactive': case 'false': case 'falha': case 'error':
                return 'bg-rose-50 text-rose-700 border border-rose-100 shadow-rose-700/5';
            case 'pendente': case 'pending': case 'processando': case 'warning':
                return 'bg-amber-50 text-amber-700 border border-amber-100 shadow-amber-700/5';
            case 'cancelado': case 'canceled': case 'closed':
                return 'bg-slate-50 text-slate-700 border border-slate-100 shadow-slate-700/5';
            default:
                return 'bg-blue-50 text-blue-700 border border-blue-100 shadow-blue-700/5';
        }
    });

    dotClass = computed(() => {
        const s = String(this.status).toLowerCase();
        switch (s) {
            case 'ativo': case 'active': case 'true': case 'pago': case 'success':
                return 'bg-emerald-500 animate-pulse';
            case 'inativo': case 'inactive': case 'false': case 'falha':
                return 'bg-rose-500';
            case 'pendente': case 'pending': case 'warning':
                return 'bg-amber-500';
            default:
                return 'bg-blue-500';
        }
    });
}
