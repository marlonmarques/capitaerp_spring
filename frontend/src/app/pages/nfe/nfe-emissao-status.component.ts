import {
    Component, Input, Output, EventEmitter,
    OnDestroy, signal, ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NfeEvento, NfeService } from '../../core/services/nfe.service';

export interface LogEvento {
    tipo: NfeEvento['tipo'];
    mensagem: string;
    hora: string;
}

@Component({
    selector: 'app-nfe-emissao-status',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="sse-overlay" (click)="onFechar()">
      <div class="sse-panel" (click)="$event.stopPropagation()">
        <div class="sse-header">
          <div class="sse-header-info">
            <div class="sse-icon" [class]="'icon-' + estadoAtual()">
              @switch (estadoAtual()) {
                @case ('processando') { <span class="spinner-ring"></span> }
                @case ('autorizada')  { <span>✅</span> }
                @case ('rejeitada')   { <span>❌</span> }
              }
            </div>
            <div class="sse-title-block">
              <h2 class="sse-title">Emissão NF-e (Produtos)</h2>
              <p class="sse-sub">Nota #{{ numeroNota || '...' }} · {{ nomeCliente }}</p>
            </div>
          </div>
          @if (estadoAtual() !== 'processando') {
            <button class="sse-close" (click)="onFechar()">✕</button>
          }
        </div>

        <div class="sse-status-bar" [class]="'bar-' + estadoAtual()">
          <span class="status-dot"></span>
          <span class="status-text">{{ statusTexto() }}</span>
        </div>

        <div class="sse-terminal" #terminal>
          @for (log of logs(); track log.hora + log.mensagem) {
            <div class="log-linha" [class]="'log-' + log.tipo">
              <span class="log-hora">{{ log.hora }}</span>
              <span class="log-msg">{{ log.mensagem }}</span>
            </div>
          }
          @if (logs().length === 0) {
            <div class="log-linha log-log">
              <span class="log-hora">--:--:--</span>
              <span class="log-msg">🔄 Aguardando conexão com o servidor...</span>
            </div>
          }
          @if (estadoAtual() === 'processando') {
            <div class="log-cursor">▋</div>
          }
        </div>

        <div class="sse-footer">
          @if (estadoAtual() === 'processando') {
            <p class="footer-info">⏳ Aguardando retorno da SEFAZ. Não feche esta janela.</p>
          } @else if (estadoAtual() === 'autorizada') {
            <p class="footer-success">🎉 NF-e autorizada com sucesso!</p>
            <button class="btn-fechar-ok" (click)="onFechar()">Concluído</button>
          } @else if (estadoAtual() === 'rejeitada') {
            <p class="footer-error">Verifique os erros acima e tente novamente.</p>
            <button class="btn-fechar-err" (click)="onFechar()">Fechar</button>
          }
        </div>
      </div>
    </div>
  `,
    styles: [`
    .sse-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .sse-panel { background: #0f172a; border-radius: 12px; width: 500px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
    .sse-header { padding: 1rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; color: white; }
    .sse-header-info { display: flex; align-items: center; gap: 0.75rem; }
    .sse-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .icon-processando { background: #1e293b; }
    .sse-title { margin: 0; font-size: 0.9rem; font-weight: 700; }
    .sse-sub { margin: 0; font-size: 0.75rem; color: #64748b; }
    .sse-close { background: none; border: none; color: #475569; cursor: pointer; }
    .sse-status-bar { padding: 0.5rem 1rem; font-size: 0.75rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 1px solid #1e293b; }
    .bar-processando { background: rgba(59,130,246,0.1); color: #60a5fa; }
    .bar-autorizada { background: rgba(34,197,94,0.1); color: #4ade80; }
    .bar-rejeitada { background: rgba(239,68,68,0.1); color: #f87171; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .sse-terminal { flex: 1; padding: 1rem; font-family: monospace; font-size: 0.75rem; background: #0a0f1e; color: #94a3b8; max-height: 300px; overflow-y: auto; }
    .log-linha { display: flex; gap: 0.5rem; margin-bottom: 0.25rem; }
    .log-hora { color: #334155; }
    .log-autorizada { color: #4ade80; }
    .log-rejeitada { color: #f87171; }
    .sse-footer { padding: 1rem; border-top: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; }
    .footer-info { font-size: 0.75rem; color: #64748b; }
    .footer-success { font-size: 0.75rem; color: #4ade80; }
    .footer-error { font-size: 0.75rem; color: #f87171; }
    .btn-fechar-ok { background: #22c55e; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
    .btn-fechar-err { background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
    .spinner-ring { border: 2px solid #3b82f6; border-top-color: transparent; border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class NfeEmissaoStatusComponent implements OnDestroy {
    @Input({ required: true }) nfeId!: string;
    @Input() nomeCliente = '';
    @Input() numeroNota: number | undefined;

    @Output() finalizado = new EventEmitter<{ sucesso: boolean; mensagem: string }>();
    @Output() fechar = new EventEmitter<void>();

    private nfeService = inject(NfeService);
    private cdr = inject(ChangeDetectorRef);

    logs = signal<LogEvento[]>([]);
    estadoAtual = signal<'processando' | 'autorizada' | 'rejeitada'>('processando');

    statusTexto = () => {
        const s = this.estadoAtual();
        if (s === 'processando') return 'Processando emissão...';
        if (s === 'autorizada') return 'Nota autorizada!';
        return 'Emissão rejeitada';
    };

    private eventSource: EventSource | null = null;

    iniciarStreaming(): void {
        if (!this.nfeId) return;
        this.eventSource = this.nfeService.abrirEventosSSE(
            this.nfeId,
            (evento) => this.adicionarLog(evento),
            (sucesso, mensagem) => {
                this.estadoAtual.set(sucesso ? 'autorizada' : 'rejeitada');
                this.finalizado.emit({ sucesso, mensagem });
                this.cdr.markForCheck();
            }
        );
    }

    private adicionarLog(evento: NfeEvento): void {
        const hora = new Date().toLocaleTimeString('pt-BR');
        this.logs.update(lista => [...lista, {
            tipo: evento.tipo,
            mensagem: evento.mensagem,
            hora
        }]);
        this.cdr.markForCheck();
    }

    onFechar(): void {
        if (this.estadoAtual() === 'processando') {
            if (!confirm('Emissão em andamento. Fechar mesmo assim?')) return;
        }
        this.fechar.emit();
    }

    ngOnDestroy(): void {
        this.eventSource?.close();
    }
}
