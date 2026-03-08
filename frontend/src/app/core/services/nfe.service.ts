import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
export enum StatusNFe {
  RASCUNHO = 'RASCUNHO',
  PROCESSANDO = 'PROCESSANDO',
  AUTORIZADA = 'AUTORIZADA',
  REJEITADA = 'REJEITADA',
  CANCELADA = 'CANCELADA',
  DENEGADA = 'DENEGADA',
  EVENTO = 'EVENTO'
}

export interface NfeEvento {
  tipo: 'log' | 'status' | 'alerta' | 'autorizada' | 'rejeitada';
  mensagem: string;
  final_: boolean;
}

export interface NfeListItemDTO {
  id: string;
  numero: number;
  serie: string;
  modelo: string;
  naturezaOperacao: string;
  status: string;
  dataEmissao: string;
  chaveNfe?: string;
  mensagemRetorno?: string;
  valorTotalNota: number;
  clienteNome: string;
  clienteDocumento: string;
}

export interface NotaFiscalProdutoItem {
  id?: string;
  produto?: any;
  codigoProduto?: string;
  descricao?: string;
  ncm?: string;
  cfop?: string;
  unidadeComercial?: string;
  quantidadeComercial: number;
  valorUnitarioComercial: number;
  valorBruto: number;
  valorDesconto?: number;
  valorLiquido: number;
  // Tributação Simplificada
  icmsCst?: string;
  icmsAliquota?: number;
  icmsValor?: number;
}

export interface NotaFiscalProdutoPagamento {
  id?: string;
  tipoPagamento: string;
  valorPagamento: number;
  bandeiraCartao?: string;
  cnpjCredenciadora?: string;
  dataVencimento?: string;
}

export interface NotaFiscalProduto {
  id?: string;
  filialId: string;
  modelo: string;
  numero?: number;
  serie: string;
  naturezaOperacao: string;
  status: StatusNFe;
  cliente?: any;
  clienteId?: string; // Para compatibilidade
  chaveNfe?: string;
  protocoloNfe?: string;
  mensagemRetorno?: string;
  codigoRetorno?: string;
  dataEmissao: string;
  dataSaidaEntrada?: string;
  ambiente?: string;
  finalidade?: string;
  informacoesFisco?: string;
  informacoesComplementares?: string;

  // Totais
  valorTotalNota: number;
  valorTotalProdutos: number;
  valorFrete: number;
  valorSeguro: number;
  valorDesconto: number;
  valorOutros: number;
  valorBaseCalculoIcms: number;
  valorIcms: number;

  itens: NotaFiscalProdutoItem[];
  pagamentos: NotaFiscalProdutoPagamento[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class NfeService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/api/v1/nfe`;

  private get headers() {
    return this.authService.getAuthHeaders();
  }

  listar(page: number = 0, size: number = 10, busca?: string, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'criadoEm,desc');

    if (busca) params = params.set('busca', busca);
    if (status) params = params.set('status', status);

    return this.http.get<any>(this.apiUrl, { params, headers: this.headers });
  }

  obterResumo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/resumo`, { headers: this.headers });
  }

  buscarPorId(id: string): Observable<NotaFiscalProduto> {
    return this.http.get<NotaFiscalProduto>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  salvar(nota: NotaFiscalProduto): Observable<NotaFiscalProduto> {
    return this.http.post<NotaFiscalProduto>(this.apiUrl, nota, { headers: this.headers });
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  emitir(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/emitir`, {}, { headers: this.headers });
  }

  consultar(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/consultar`, {}, { headers: this.headers });
  }

  cancelar(id: string, justificativa: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/cancelar`, justificativa, { headers: this.headers });
  }

  cce(id: string, texto: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/cce`, texto, { headers: this.headers });
  }

  imprimir(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/imprimir`, { 
      headers: this.headers, 
      responseType: 'blob' 
    });
  }

  abrirEventosSSE(id: string, onMessage: (ev: NfeEvento) => void, onComplete: (sucesso: boolean, msg: string) => void): EventSource {
    const token = localStorage.getItem('access_token') || '';
    const url = `${this.apiUrl}/${id}/eventos${token ? '?token=' + token : ''}`;
    const eventSource = new EventSource(url);

    const handler = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as NfeEvento;
      onMessage(data);
      if (data.final_) {
        eventSource.close();
        onComplete(data.tipo === 'autorizada', data.mensagem);
      }
    };

    eventSource.addEventListener('log', handler);
    eventSource.addEventListener('status', handler);
    eventSource.addEventListener('alerta', handler);
    eventSource.addEventListener('autorizada', handler);
    eventSource.addEventListener('rejeitada', handler);

    eventSource.onerror = (err) => {
      console.error('Erro SSE Nfe:', err);
      eventSource.close();
      onComplete(false, 'Conexão perdida com o servidor.');
    };

    return eventSource;
  }
}
