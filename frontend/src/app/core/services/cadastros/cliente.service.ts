import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth.service';

export interface EnderecoCliente {
    id?: number;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    principal?: boolean;
}

export interface EmailCliente {
    id?: number;
    email?: string;
    principal?: boolean;
}

export interface Cliente {
    id?: string;
    name?: string;
    lastName?: string;
    razaoSocial?: string;
    tipoPessoa?: number;
    cpf?: string;
    rg?: string;
    telefone?: string;
    celular?: string;
    inscEString?: string;
    inscMunicipal?: string;
    iss?: number;
    reterIss?: boolean;
    indIe?: number;
    posicaoFiscalId?: string;
    codPagto?: number;
    notaInterna?: string;
    enderecos?: EnderecoCliente[];
    emails?: EmailCliente[];
}

export interface ClientePage {
    content: Cliente[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}


@Injectable({
    providedIn: 'root'
})
export class ClienteService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = `${environment.apiUrl}/api/v1/clientes`;

    findAllPaged(page: number = 0, size: number = 10, name?: string): Observable<ClientePage> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', 'name,asc');

        if (name) {
            params = params.set('name', name);
        }

        const headers = this.authService.getAuthHeaders();
        return this.http.get<ClientePage>(this.apiUrl, { headers, params });
    }

    findById(id: string | number): Observable<Cliente> {
        const headers = this.authService.getAuthHeaders();
        return this.http.get<Cliente>(`${this.apiUrl}/${id}`, { headers });
    }

    insert(cliente: Cliente): Observable<Cliente> {
        const headers = this.authService.getAuthHeaders();
        return this.http.post<Cliente>(this.apiUrl, cliente, { headers });
    }

    update(id: string | number, cliente: Cliente): Observable<Cliente> {
        const headers = this.authService.getAuthHeaders();
        return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente, { headers });
    }

    delete(id: string | number): Observable<void> {
        const headers = this.authService.getAuthHeaders();
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
    }
}
