import {
    Component, Input, Output, EventEmitter,
    OnDestroy, signal, ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NfseEvento, NfseService } from '../../core/services/nfse.service';

export interface LogEvento {
    tipo: NfseEvento['tipo'];
    mensagem: string;
    hora: string;
}

/**
 * Painel de progresso em tempo real da emissão NFS-e via SSE.
 *
 * Uso:
 * ```html
 * <app-nfse-emissao-status
 *   [nfseId]="nota.id"
 *   [nomeCliente]="nota.clienteNome"
 *   [numeroRps]="nota.numeroRps"
 *   (finalizado)="onEmissaoFinalizada($event)"
 *   (fechar)="fecharPainel()"
 * />
 * ```
 */
@Component({
    selector: 'app-nfse-emissao-status',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <!-- Overlay backdrop -->
    <div class="sse-overlay" (click)="onFechar()">
      <div class="sse-panel" (click)="$event.stopPropagation()">

        <!-- Header -->
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
              <h2 class="sse-title">Emissão NFS-e</h2>
              <p class="sse-sub">RPS #{{ numeroRps }} · {{ nomeCliente }}</p>
            </div>
          </div>
          @if (estadoAtual() !== 'processando') {
            <button class="sse-close" (click)="onFechar()" id="btn-fechar-sse">✕</button>
          }
        </div>

        <!-- Status bar -->
        <div class="sse-status-bar" [class]="'bar-' + estadoAtual()">
          <span class="status-dot"></span>
          <span class="status-text">{{ statusTexto() }}</span>
        </div>

        <!-- Log terminal -->
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
          <!-- Cursor piscante enquanto processa -->
          @if (estadoAtual() === 'processando') {
            <div class="log-cursor">▋</div>
          }
        </div>

        <!-- Footer -->
        <div class="sse-footer">
          @if (estadoAtual() === 'processando') {
            <p class="footer-info">
              ⏳ Aguardando retorno da prefeitura. Não feche esta janela.
            </p>
          } @else if (estadoAtual() === 'autorizada') {
            <p class="footer-success">
              🎉 Nota autorizada com sucesso! Atualize a lista para ver o número NFS-e.
            </p>
            <button class="btn-fechar-ok" (click)="onFechar()" id="btn-concluido-sse">
              Concluído
            </button>
          } @else if (estadoAtual() === 'rejeitada') {
            <p class="footer-error">
              Verifique a mensagem acima e corrija os dados antes de tentar novamente.
            </p>
            <button class="btn-fechar-err" (click)="onFechar()" id="btn-fechar-erro-sse">
              Fechar
            </button>
          }
        </div>

      </div>
    </div>
  `,
    styles: [`
    :host { display: block; }

    /* Overlay */
    .sse-overlay {
      position: fixed; inset: 0;
      background: rgba(10, 15, 30, 0.65);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* Painel */
    .sse-panel {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      width: 100%; max-width: 580px;
      max-height: 90vh;
      display: flex; flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5);
      animation: slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes slideUp {
      from { transform: translateY(30px) scale(0.97); opacity: 0; }
      to   { transform: translateY(0) scale(1); opacity: 1; }
    }

    /* Header */
    .sse-header {
      padding: 1.25rem 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid #1e293b;
    }
    .sse-header-info { display: flex; align-items: center; gap: 1rem; }
    .sse-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem;
    }
    .icon-processando { background: rgba(59,130,246,0.15); }
    .icon-autorizada  { background: rgba(34,197,94,0.15); }
    .icon-rejeitada   { background: rgba(239,68,68,0.15); }

    .sse-title { margin: 0; font-size: 1rem; font-weight: 700; color: #f1f5f9; }
    .sse-sub   { margin: 0.15rem 0 0; font-size: 0.8rem; color: #64748b; }
    .sse-close {
      background: none; border: none; color: #475569;
      font-size: 1rem; cursor: pointer; padding: 0.4rem;
      border-radius: 6px; transition: all 0.15s;
    }
    .sse-close:hover { color: #f1f5f9; background: #1e293b; }

    /* Status Bar */
    .sse-status-bar {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.6rem 1.5rem;
      font-size: 0.8rem; font-weight: 500;
      border-bottom: 1px solid #1e293b;
      transition: background 0.3s;
    }
    .bar-processando { background: rgba(59,130,246,0.08); color: #60a5fa; }
    .bar-autorizada  { background: rgba(34,197,94,0.08);  color: #4ade80; }
    .bar-rejeitada   { background: rgba(239,68,68,0.08);  color: #f87171; }
    .status-dot {
      width: 7px; height: 7px; border-radius: 50%;
      display: inline-block;
    }
    .bar-processando .status-dot { background: #3b82f6; animation: pulse 1.2s infinite; }
    .bar-autorizada  .status-dot { background: #22c55e; }
    .bar-rejeitada   .status-dot { background: #ef4444; }
    @keyframes pulse { 0%,100%{ opacity:1; } 50%{ opacity:0.3; } }

    /* Terminal */
    .sse-terminal {
      flex: 1;
      padding: 1rem 1.25rem;
      overflow-y: auto;
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 0.78rem;
      line-height: 1.7;
      min-height: 200px;
      max-height: 340px;
      background: #0a0f1e;
    }
    .log-linha { display: flex; gap: 0.75rem; }
    .log-hora  { color: #334155; flex-shrink: 0; font-size: 0.72rem; margin-top: 0.05rem; }
    .log-msg   { color: #94a3b8; }

    .log-log    .log-msg { color: #94a3b8; }
    .log-status .log-msg { color: #60a5fa; }
    .log-alerta .log-msg { color: #fbbf24; }
    .log-autorizada .log-msg { color: #4ade80; font-weight: 600; }
    .log-rejeitada  .log-msg { color: #f87171; font-weight: 600; }

    .log-cursor {
      color: #3b82f6; opacity: 0.8;
      animation: blink 1s infinite; margin-top: 0.2rem;
    }
    @keyframes blink { 0%,100%{ opacity:0.8; } 50%{ opacity:0; } }

    /* Spinner ring */
    .spinner-ring {
      display: inline-block; width: 20px; height: 20px;
      border: 2.5px solid rgba(59,130,246,0.2);
      border-top-color: #3b82f6;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Footer */
    .sse-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #1e293b;
      display: flex; align-items: center;
      justify-content: space-between; gap: 1rem;
      flex-wrap: wrap;
    }
    .footer-info    { margin: 0; color: #475569; font-size: 0.8rem; }
    .footer-success { margin: 0; color: #4ade80; font-size: 0.8rem; font-weight: 500; }
    .footer-error   { margin: 0; color: #f87171; font-size: 0.8rem; }

    .btn-fechar-ok, .btn-fechar-err {
      padding: 0.5rem 1.25rem; border: none;
      border-radius: 8px; font-size: 0.875rem;
      font-weight: 600; cursor: pointer; transition: all 0.15s;
      white-space: nowrap;
    }
    .btn-fechar-ok { background: #22c55e; color: white; }
    .btn-fechar-ok:hover { background: #16a34a; }
    .btn-fechar-err { background: #ef4444; color: white; }
    .btn-fechar-err:hover { background: #dc2626; }
  `]
})
export class NfseEmissaoStatusComponent implements OnDestroy {
    @Input({ required: true }) nfseId!: string;
    @Input() nomeCliente = '';
    @Input() numeroRps: number | undefined;

    /** Emitido quando a emissão finaliza. sucesso = true se AUTORIZADA */
    @Output() finalizado = new EventEmitter<{ sucesso: boolean; mensagem: string }>();
    /** Emitido quando o usuário fecha o painel */
    @Output() fechar = new EventEmitter<void>();

    private nfseService = inject(NfseService);
    private cdr = inject(ChangeDetectorRef);

    logs = signal<LogEvento[]>([]);
    estadoAtual = signal<'processando' | 'autorizada' | 'rejeitada'>('processando');

    statusTexto = () => {
        const s = this.estadoAtual();
        if (s === 'processando') return '🔄 Processando emissão — aguardando prefeitura...';
        if (s === 'autorizada') return '✅ NFS-e autorizada com sucesso!';
        return '❌ Emissão rejeitada';
    };

    private eventSource: EventSource | null = null;

    /**
     * Inicia o streaming SSE. Chame este método após disparar emitir().
     */
    iniciarStreaming(): void {
        if (!this.nfseId) return;

        this.eventSource = this.nfseService.abrirEventosSSE(
            this.nfseId,
            (evento) => this.adicionarLog(evento),
            (sucesso, mensagem) => {
                this.estadoAtual.set(sucesso ? 'autorizada' : 'rejeitada');
                this.finalizado.emit({ sucesso, mensagem });
                this.cdr.markForCheck();
            }
        );
    }

    private adicionarLog(evento: NfseEvento): void {
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
            // Não fecha em processamento (SSE ainda ativo)
            if (!confirm('A emissão ainda está em andamento. Deseja realmente fechar?\n(O processo continua em background)')) {
                return;
            }
        }
        this.fechar.emit();
    }

    ngOnDestroy(): void {
        this.eventSource?.close();
        this.eventSource = null;
    }
}
