import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MensagemFiscalRef {
    id: string;
    titulo: string;
    destino: string;
}

export interface PosicaoFiscal {
    id?: string;
    nome: string;
    tipoNota: 'ENTRADA' | 'SAIDA';
    finalidade: 'NORMAL' | 'COMPLEMENTAR' | 'AJUSTE' | 'DEVOLUCAO_RETORNO';
    consumidorFinal: boolean;
    tipoOperacao?: string;
    operacaoDestino?: string;
    cfopPadraoCodigo?: string;
    mensagensIds?: string[];
}

@Injectable({ providedIn: 'root' })
export class PosicaoFiscalService {
    private apiUrl = `${environment.apiUrl}/api/v1/posicoes-fiscais`;

    constructor(private http: HttpClient) { }

    findAll(): Observable<PosicaoFiscal[]> {
        return this.http.get<PosicaoFiscal[]>(this.apiUrl);
    }

    findById(id: string): Observable<PosicaoFiscal> {
        return this.http.get<PosicaoFiscal>(`${this.apiUrl}/${id}`);
    }

    insert(data: PosicaoFiscal): Observable<PosicaoFiscal> {
        return this.http.post<PosicaoFiscal>(this.apiUrl, data);
    }

    update(id: string, data: PosicaoFiscal): Observable<PosicaoFiscal> {
        return this.http.put<PosicaoFiscal>(`${this.apiUrl}/${id}`, data);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
