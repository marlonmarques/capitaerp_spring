import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ContaBancaria {
    id?: string;
    nome: string;
    codigoBanco: string;
    agencia?: string;
    numeroConta?: string;
    carteira?: string;
    convenio?: string;
    contrato?: string;
    tipoCarteira?: string;
    instrucoesBoleto1?: string;
    instrucoesBoleto2?: string;
    instrucoesBoleto3?: string;
    taxaMora?: number;
    taxaMulta?: number;
    saldoInicial?: number;
    viaApi?: boolean;
    tokenApi?: string;
    telefone?: string;
    padrao?: boolean;
    ativo?: boolean;
    criadoEm?: string;
    atualizadoEm?: string;
}

export const BANCOS_DISPONIVEIS = [
    { value: 'CAIXA_INTERNO', label: 'Caixa Interno (Dinheiro)' },
    { value: 'BANCO_DO_BRASIL', label: 'Banco do Brasil' },
    { value: 'CAIXA_ECONOMICA', label: 'Caixa Econômica Federal' },
    { value: 'ITAU', label: 'Itaú' },
    { value: 'BRADESCO', label: 'Bradesco' },
    { value: 'SANTANDER', label: 'Santander' },
    { value: 'INTER', label: 'Banco Inter' },
    { value: 'NUBANK', label: 'Nubank' },
    { value: 'ASAAS', label: 'Asaas (Gateway)' },
    { value: 'PAGHIPER', label: 'PagHiper (Gateway)' },
    { value: 'OUTROS', label: 'Outro Banco/Gateway' }
];

@Injectable({ providedIn: 'root' })
export class ContaBancariaService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/v1/contas-bancarias`;

    findAll(): Observable<ContaBancaria[]> {
        return this.http.get<ContaBancaria[]>(this.apiUrl);
    }

    findById(id: string): Observable<ContaBancaria> {
        return this.http.get<ContaBancaria>(`${this.apiUrl}/${id}`);
    }

    insert(conta: ContaBancaria): Observable<ContaBancaria> {
        return this.http.post<ContaBancaria>(this.apiUrl, conta);
    }

    update(id: string, conta: ContaBancaria): Observable<ContaBancaria> {
        return this.http.put<ContaBancaria>(`${this.apiUrl}/${id}`, conta);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
