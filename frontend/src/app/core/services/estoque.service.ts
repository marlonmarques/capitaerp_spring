import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface LocalEstoque {
    id?: string;
    nome: string;
    descricao?: string;
    ativo?: boolean;
}

export interface EstoqueSaldo {
    id?: string;
    produtoId: string;
    produtoNome: string;
    variacaoId?: string;
    variacaoNome?: string;
    localEstoqueId: string;
    localEstoqueNome: string;
    quantidade: number;
    estoqueMinimo: number;
}

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'DEVOLUCAO' | 'TRANSFERENCIA';

export interface MovimentacaoEstoque {
    id?: string;
    produtoId?: string;
    produtoNome?: string;
    variacaoId?: string;
    variacaoNome?: string;
    localEstoqueId?: string;
    localEstoqueNome?: string;
    localDestinoId?: string;
    localDestinoNome?: string;
    tipo: TipoMovimentacao;
    quantidade: number;
    saldoAnterior: number;
    saldoPosterior: number;
    referenciaId?: string;
    referenciaTipo?: string;
    dataMovimentacao?: string;
    responsavel?: string;
    motivo?: string;
}

export interface ProdutoAbaixoMinimo {
    id: string;
    nome: string;
    estoqueAtual: number;
    estoqueMinimo: number;
}

@Injectable({ providedIn: 'root' })
export class EstoqueService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/v1`;

    // ─── Signals de Estado ────────────────────────────────────────────────────

    readonly locais = signal<LocalEstoque[]>([]);
    readonly carregandoLocais = signal(false);

    // ─── Locais de Estoque ────────────────────────────────────────────────────

    listarLocais(): void {
        this.carregandoLocais.set(true);
        this.http.get<LocalEstoque[]>(`${this.apiUrl}/locais-estoque`).subscribe({
            next: (data) => this.locais.set(data),
            error: () => this.carregandoLocais.set(false),
            complete: () => this.carregandoLocais.set(false)
        });
    }

    listarLocaisObs(): Observable<LocalEstoque[]> {
        return this.http.get<LocalEstoque[]>(`${this.apiUrl}/locais-estoque`);
    }

    buscarLocalPorId(id: string): Observable<LocalEstoque> {
        return this.http.get<LocalEstoque>(`${this.apiUrl}/locais-estoque/${id}`);
    }

    criarLocal(dto: LocalEstoque): Observable<LocalEstoque> {
        return this.http.post<LocalEstoque>(`${this.apiUrl}/locais-estoque`, dto);
    }

    atualizarLocal(id: string, dto: Partial<LocalEstoque>): Observable<LocalEstoque> {
        return this.http.put<LocalEstoque>(`${this.apiUrl}/locais-estoque/${id}`, dto);
    }

    excluirLocal(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/locais-estoque/${id}`);
    }

    // ─── Saldos ───────────────────────────────────────────────────────────────

    listarSaldos(localId?: string, produtoId?: string): Observable<EstoqueSaldo[]> {
        let params = new HttpParams();
        if (localId) params = params.set('localId', localId);
        if (produtoId) params = params.set('produtoId', produtoId);
        return this.http.get<EstoqueSaldo[]>(`${this.apiUrl}/estoque/saldos`, { params });
    }

    // ─── Movimentações ────────────────────────────────────────────────────────

    listarMovimentacoes(produtoId?: string, localId?: string): Observable<MovimentacaoEstoque[]> {
        let params = new HttpParams();
        if (produtoId) params = params.set('produtoId', produtoId);
        if (localId) params = params.set('localId', localId);
        return this.http.get<MovimentacaoEstoque[]>(`${this.apiUrl}/estoque/movimentacoes`, { params });
    }

    listarMovimentacoesDoProduto(produtoId: string): Observable<MovimentacaoEstoque[]> {
        return this.http.get<MovimentacaoEstoque[]>(`${this.apiUrl}/produtos/${produtoId}/movimentacoes`);
    }

    // ─── Operações de Estoque ─────────────────────────────────────────────────

    darEntrada(produtoId: string, quantidade: number, localEstoqueId?: string, variacaoId?: string, motivo?: string): Observable<void> {
        let params = new HttpParams().set('quantidade', quantidade);
        if (localEstoqueId) params = params.set('localEstoqueId', localEstoqueId);
        if (variacaoId) params = params.set('variacaoId', variacaoId);
        if (motivo) params = params.set('referenciaTipo', 'AJUSTE_MANUAL');
        return this.http.post<void>(`${this.apiUrl}/produtos/${produtoId}/entrada`, null, { params });
    }

    darBaixa(produtoId: string, quantidade: number, localEstoqueId?: string, variacaoId?: string, motivo?: string): Observable<void> {
        let params = new HttpParams().set('quantidade', quantidade);
        if (localEstoqueId) params = params.set('localEstoqueId', localEstoqueId);
        if (variacaoId) params = params.set('variacaoId', variacaoId);
        if (motivo) params = params.set('referenciaTipo', 'AJUSTE_MANUAL');
        return this.http.post<void>(`${this.apiUrl}/produtos/${produtoId}/baixa`, null, { params });
    }

    transferir(produtoId: string, origemId: string, destinoId: string, quantidade: number, variacaoId?: string, motivo?: string): Observable<void> {
        let params = new HttpParams()
            .set('origemId', origemId)
            .set('destinoId', destinoId)
            .set('quantidade', quantidade);
        if (variacaoId) params = params.set('variacaoId', variacaoId);
        if (motivo) params = params.set('motivo', motivo);
        return this.http.post<void>(`${this.apiUrl}/produtos/${produtoId}/transferencia`, null, { params });
    }

    // ─── Alertas ──────────────────────────────────────────────────────────────

    buscarAbaixoMinimo(): Observable<ProdutoAbaixoMinimo[]> {
        return this.http.get<ProdutoAbaixoMinimo[]>(`${this.apiUrl}/produtos/estoque-baixo`);
    }
}
