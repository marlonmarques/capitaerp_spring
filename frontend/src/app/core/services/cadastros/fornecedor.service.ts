import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth.service';

export interface Fornecedor {
    id?: string;
    nomeFantasia: string;
    razaoSocial: string;
    cnpj: string;
    inscricaoEstadual?: string;
    telefone?: string;
    email?: string;
    cep?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    codigoIbgeUf?: string;
    codigoIbgeCidade?: string;
    criadoEm?: string;
    atualizadoEm?: string;
}

export interface FornecedorPage {
    content: Fornecedor[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class FornecedorService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = `${environment.apiUrl}/api/v1/fornecedores`;

    findAllPaged(page: number = 0, size: number = 10): Observable<FornecedorPage> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        const headers = this.authService.getAuthHeaders();
        return this.http.get<FornecedorPage>(this.apiUrl, { headers, params });
    }

    findById(id: string): Observable<Fornecedor> {
        const headers = this.authService.getAuthHeaders();
        return this.http.get<Fornecedor>(`${this.apiUrl}/${id}`, { headers });
    }

    insert(fornecedor: Fornecedor): Observable<Fornecedor> {
        const headers = this.authService.getAuthHeaders();
        return this.http.post<Fornecedor>(this.apiUrl, fornecedor, { headers });
    }

    update(id: string, fornecedor: Fornecedor): Observable<Fornecedor> {
        const headers = this.authService.getAuthHeaders();
        return this.http.put<Fornecedor>(`${this.apiUrl}/${id}`, fornecedor, { headers });
    }

    delete(id: string): Observable<void> {
        const headers = this.authService.getAuthHeaders();
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
    }
}
