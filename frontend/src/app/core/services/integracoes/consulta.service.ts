import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth.service';

export interface CnpjResponse {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
    telefone: string;
    email: string;
    sucesso: boolean;
    erro?: string;
}

export interface CepResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    sucesso: boolean;
    erro?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ConsultaService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = `${environment.apiUrl}/api/v1/consultas`;

    consultarCnpj(cnpj: string): Observable<CnpjResponse> {
        const headers = this.authService.getAuthHeaders();
        // Remove caracteres não numéricos antes de enviar
        const cleanCnpj = cnpj.replace(/\D/g, '');
        return this.http.get<CnpjResponse>(`${this.apiUrl}/cnpj/${cleanCnpj}`, { headers });
    }

    consultarCep(cep: string): Observable<CepResponse> {
        const headers = this.authService.getAuthHeaders();
        // Remove caracteres não numéricos antes de enviar
        const cleanCep = cep.replace(/\D/g, '');
        return this.http.get<CepResponse>(`${this.apiUrl}/cep/${cleanCep}`, { headers });
    }
}
