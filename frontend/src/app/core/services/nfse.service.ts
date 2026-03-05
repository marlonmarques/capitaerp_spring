import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export type StatusNFSe = 'RASCUNHO' | 'PROCESSANDO' | 'AUTORIZADA' | 'REJEITADA' | 'CANCELADA';

export interface NotaFiscalServico {
    id?: string;
    numeroRps?: number;
    serieRps?: string;
    numeroNfse?: string;
    codigoVerificacao?: string;
    status?: StatusNFSe;

    // Tomador
    clienteId?: number;
    clienteNome?: string;
    clienteCpfCnpj?: string;
    emailsEnvio?: string;

    // Serviço
    naturezaOperacao?: string;
    discriminacaoServico?: string;
    informacoesComplementares?: string;
    codigoCnae?: string;
    itemLc116?: string;
    codigoNbs?: string;
    municipioIbge?: string;
    ufPrestacao?: string;
    exigibilidadeIss?: number;
    issRetido?: boolean;

    // Datas
    dataEmissao?: string;
    dataCompetencia?: string;
    dataVencimento?: string;
    dataAutorizacao?: string;
    dataCancelamento?: string;

    // Valores
    valorServicos?: number;
    valorDesconto?: number;
    aliquotaIss?: number;
    valorIss?: number;
    valorIssRetido?: number;
    valorLiquido?: number;

    // ACBr
    mensagemRetorno?: string;
    temXml?: boolean;

    // Auditoria
    criadoEm?: string;
    criadoPor?: string;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

/** Evento recebido via SSE do backend durante a emissão de NFS-e */
export interface NfseEvento {
    tipo: 'log' | 'status' | 'alerta' | 'autorizada' | 'rejeitada';
    mensagem: string;
    final_: boolean;
    timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class NfseService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/v1/nfse`;

    listar(busca?: string, status?: string, page = 0, size = 20): Observable<PagedResponse<NotaFiscalServico>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (busca) params = params.set('busca', busca);
        if (status) params = params.set('status', status);
        return this.http.get<PagedResponse<NotaFiscalServico>>(this.apiUrl, { params });
    }

    buscarPorId(id: string): Observable<NotaFiscalServico> {
        return this.http.get<NotaFiscalServico>(`${this.apiUrl}/${id}`);
    }

    criar(dto: NotaFiscalServico): Observable<NotaFiscalServico> {
        return this.http.post<NotaFiscalServico>(this.apiUrl, dto);
    }

    atualizar(id: string, dto: NotaFiscalServico): Observable<NotaFiscalServico> {
        return this.http.put<NotaFiscalServico>(`${this.apiUrl}/${id}`, dto);
    }

    excluir(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    emitir(id: string): Observable<NotaFiscalServico> {
        return this.http.post<NotaFiscalServico>(`${this.apiUrl}/${id}/emitir`, {});
    }

    consultar(id: string): Observable<NotaFiscalServico> {
        return this.http.post<NotaFiscalServico>(`${this.apiUrl}/${id}/consultar`, {});
    }

    cancelar(id: string, motivo: string, codigo = '1'): Observable<NotaFiscalServico> {
        return this.http.post<NotaFiscalServico>(`${this.apiUrl}/${id}/cancelar`, { motivo, codigo });
    }

    /**
     * Abre uma conexão SSE (Server-Sent Events) para receber feedback em tempo real
     * durante o processamento assíncrono da emissão de NFS-e.
     *
     * O Angular deve chamar este método logo após chamar emitir().
     * O EventSource retornado deve ser fechado (es.close()) no ngOnDestroy
     * do componente para evitar memory leaks.
     *
     * Tipos de evento recebidos:
     *   - 'log'        → mensagem de progresso intermediária
     *   - 'status'     → atualização de status (ex: aguardando prefeitura)
     *   - 'alerta'     → tentativa falhou, reagendando com backoff
     *   - 'autorizada' → NFS-e autorizada (evento final, fecha conexão)
     *   - 'rejeitada'  → NFS-e rejeitada definitivamente (evento final)
     *
     * @param nfseId   UUID da nota fiscal
     * @param onEvento callback chamado a cada evento recebido
     * @param onFinal  callback chamado quando a ação termina (sucesso ou falha)
     * @returns EventSource para fechar quando não necessário
     */
    abrirEventosSSE(
        nfseId: string,
        onEvento: (evento: NfseEvento) => void,
        onFinal: (sucesso: boolean, mensagem: string) => void
    ): EventSource {
        // Autenticação via query param — EventSource não suporta headers customizados
        const token = localStorage.getItem('access_token') || '';
        const url = `${this.apiUrl}/${nfseId}/eventos${token ? '?token=' + token : ''}`;

        const es = new EventSource(url);

        // Eventos de progresso (não fecham a conexão)
        ['log', 'status', 'alerta'].forEach(tipo => {
            es.addEventListener(tipo, (e: any) => {
                try {
                    const evento: NfseEvento = JSON.parse(e.data);
                    onEvento(evento);
                } catch { /* ignora parse error */ }
            });
        });

        // Evento final: autorizada
        es.addEventListener('autorizada', (e: any) => {
            try {
                const evento: NfseEvento = JSON.parse(e.data);
                onEvento(evento);
                onFinal(true, evento.mensagem);
            } catch { }
            es.close();
        });

        // Evento final: rejeitada
        es.addEventListener('rejeitada', (e: any) => {
            try {
                const evento: NfseEvento = JSON.parse(e.data);
                onEvento(evento);
                onFinal(false, evento.mensagem);
            } catch { }
            es.close();
        });

        return es;
    }
}
