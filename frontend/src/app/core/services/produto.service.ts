import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

// ─── Tipos / Enums ────────────────────────────────────────────────────────────

export type ProdutoStatus = 'ATIVO' | 'INATIVO' | 'BLOQUEADO';

export const UNIDADES_MEDIDA = [
    { valor: 'UN', label: 'Unidade (UN)' },
    { valor: 'KG', label: 'Quilograma (KG)' },
    { valor: 'G', label: 'Grama (G)' },
    { valor: 'LT', label: 'Litro (LT)' },
    { valor: 'ML', label: 'Mililitro (ML)' },
    { valor: 'MT', label: 'Metro (MT)' },
    { valor: 'M2', label: 'Metro Quadrado (M²)' },
    { valor: 'M3', label: 'Metro Cúbico (M³)' },
    { valor: 'CX', label: 'Caixa (CX)' },
    { valor: 'PC', label: 'Peça (PC)' },
    { valor: 'PR', label: 'Par (PR)' },
    { valor: 'DZ', label: 'Dúzia (DZ)' },
    { valor: 'PCT', label: 'Pacote (PCT)' },
    { valor: 'RL', label: 'Rolo (RL)' },
    { valor: 'SC', label: 'Saco (SC)' },
];

export const ORIGENS_PRODUTO = [
    { valor: 'NACIONAL', label: '0 — Nacional' },
    { valor: 'ESTRANGEIRA_IMPORTACAO_DIRETA', label: '1 — Estrangeira (Importação Direta)' },
    { valor: 'ESTRANGEIRA_ADQUIRIDA_INTERNO', label: '2 — Estrangeira (Adquirida no Brasil)' },
    { valor: 'NACIONAL_IMPORTADO_PROPORCIONAL', label: '3 — Nacional — Conteúdo de Importação > 40%' },
    { valor: 'NACIONAL_PROCESSO_PRODUTIVO', label: '4 — Nacional — Produção conforme Ajuste Sinief' },
    { valor: 'NACIONAL_MENOS_40_IMPORTADO', label: '5 — Nacional — Conteúdo de Importação < 40%' },
    { valor: 'ESTRANGEIRA_SEM_SIMILAR', label: '6 — Estrangeira — Importação Direta, sem similar' },
    { valor: 'ESTRANGEIRA_ADQUIRIDA_SEM_SIMILAR', label: '7 — Estrangeira — Adquirida no Brasil, sem similar' },
];

export const TIPOS_ATRIBUTO_VARIACAO = [
    'COR', 'TAMANHO', 'VOLTAGEM', 'MATERIAL', 'VOLUME', 'SABOR',
    'AROMA', 'MODELO', 'PESO', 'COMPRIMENTO', 'LARGURA', 'ESPESSURA'
];

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ProdutoVariacaoAtributo {
    id?: string;
    tipo: string;
    valor: string;
}

export interface ProdutoVariacao {
    id?: string;
    produtoId?: string;
    nomeVariacao?: string;
    sku?: string;
    codigoBarras?: string;
    precoCusto?: number;
    precoVenda?: number;
    margemLucro?: number;
    precoVendaEfetivo?: number;
    estoqueMinimo?: number;
    estoqueAtual?: number;
    ativo?: boolean;
    imagemUrl?: string;
    atributos: ProdutoVariacaoAtributo[];
}

export interface Produto {
    id?: string;
    nome: string;
    descricao?: string;
    codigoBarras?: string;
    codigoNcm?: string;
    codigoCest?: string;
    unidadeMedida?: string;
    origem?: string;

    precoVenda?: number;
    precoCusto?: number;
    margemLucro?: number;

    estoqueMinimo?: number;
    estoqueAtual?: number;
    status?: ProdutoStatus;

    pesoBruto?: number;
    pesoLiquido?: number;
    larguraCm?: number;
    alturaCm?: number;
    profundidadeCm?: number;

    imagemUrl?: string;
    imagensUrls?: string;

    grupoTributarioId?: string;
    grupoTributarioNome?: string;

    aliquotaIcms?: number;
    aliquotaPis?: number;
    aliquotaCofins?: number;
    cstIcms?: string;
    cstPis?: string;
    cstCofins?: string;
    cfop?: string;

    categoriaId?: string;
    categoriaNome?: string;
    fornecedorPrincipalId?: string;
    fornecedorPrincipalNome?: string;

    temVariacoes?: boolean;
    variacoes?: ProdutoVariacao[];
    favorito?: boolean;        // ⭐ PDV — produto de acesso rápido

    criadoEm?: string;
    atualizadoEm?: string;
    deletadoEm?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

@Injectable({ providedIn: 'root' })
export class ProdutoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/v1/produtos`;

    readonly lista = signal<Produto[]>([]);
    readonly carregando = signal(false);
    readonly total = signal(0);

    // ─── CRUD Produto ────────────────────────────────────────────────────────

    buscarTudo(busca?: string, status?: string, page = 0, size = 20): void {
        this.carregando.set(true);
        let params = new HttpParams().set('page', page).set('size', size);
        if (busca) params = params.set('busca', busca);
        if (status) params = params.set('status', status);

        this.http.get<PageResponse<Produto>>(this.apiUrl, { params }).pipe(
            tap(res => {
                const content = (res as any).content ?? (Array.isArray(res) ? res : []);
                this.lista.set(content);
                this.total.set((res as any).totalElements ?? 0);
            }),
            finalize(() => this.carregando.set(false))
        ).subscribe();
    }

    buscarPorId(id: string): Observable<Produto> {
        return this.http.get<Produto>(`${this.apiUrl}/${id}`);
    }

    listarAtivos(): Observable<Produto[]> {
        return this.http.get<Produto[]>(`${this.apiUrl}/ativos`);
    }

    inserir(dto: Produto): Observable<Produto> {
        return this.http.post<Produto>(this.apiUrl, dto);
    }

    atualizar(id: string, dto: Produto): Observable<Produto> {
        return this.http.put<Produto>(`${this.apiUrl}/${id}`, dto);
    }

    excluir(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    /** Toggle de favorito — chama PATCH e atualiza o item na lista local. */
    toggleFavorito(id: string): Observable<Produto> {
        return this.http.patch<Produto>(`${this.apiUrl}/${id}/favorito`, {}).pipe(
            tap(atualizado => {
                this.lista.update(lista =>
                    lista.map(p => p.id === id ? { ...p, favorito: atualizado.favorito } : p)
                );
            })
        );
    }

    // ─── Variações ───────────────────────────────────────────────────────────

    listarVariacoes(produtoId: string): Observable<ProdutoVariacao[]> {
        return this.http.get<ProdutoVariacao[]>(`${this.apiUrl}/${produtoId}/variacoes`);
    }

    adicionarVariacao(produtoId: string, dto: ProdutoVariacao): Observable<ProdutoVariacao> {
        return this.http.post<ProdutoVariacao>(`${this.apiUrl}/${produtoId}/variacoes`, dto);
    }

    atualizarVariacao(produtoId: string, variacaoId: string, dto: ProdutoVariacao): Observable<ProdutoVariacao> {
        return this.http.put<ProdutoVariacao>(`${this.apiUrl}/${produtoId}/variacoes/${variacaoId}`, dto);
    }

    excluirVariacao(produtoId: string, variacaoId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${produtoId}/variacoes/${variacaoId}`);
    }

    // ─── Estoque ─────────────────────────────────────────────────────────────

    darEntrada(id: string, quantidade: number, variacaoId?: string, referenciaId?: string, referenciaTipo?: string): Observable<void> {
        let params = new HttpParams().set('quantidade', quantidade);
        if (variacaoId) params = params.set('variacaoId', variacaoId);
        if (referenciaId) params = params.set('referenciaId', referenciaId);
        if (referenciaTipo) params = params.set('referenciaTipo', referenciaTipo);
        return this.http.post<void>(`${this.apiUrl}/${id}/entrada`, null, { params });
    }

    darBaixa(id: string, quantidade: number, variacaoId?: string, referenciaId?: string, referenciaTipo?: string): Observable<void> {
        let params = new HttpParams().set('quantidade', quantidade);
        if (variacaoId) params = params.set('variacaoId', variacaoId);
        if (referenciaId) params = params.set('referenciaId', referenciaId);
        if (referenciaTipo) params = params.set('referenciaTipo', referenciaTipo);
        return this.http.post<void>(`${this.apiUrl}/${id}/baixa`, null, { params });
    }

    buscarEstoqueBaixo(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/estoque-baixo`);
    }

    listarMovimentacoes(id: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${id}/movimentacoes`);
    }
}
