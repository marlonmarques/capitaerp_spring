import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth.service';

export interface Categoria {
    id?: string;
    nome: string;
    descricao?: string;
    tipo?: string;
    porcentagemLucroPadrao?: number;
    categoriaPaiId?: string;
    criadoEm?: string;
    atualizadoEm?: string;
}

export interface CategoriaPage {
    content: Categoria[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class CategoriaService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = `${environment.apiUrl}/api/v1/categorias`;

    findAllPaged(tipo?: string, page: number = 0, size: number = 10): Observable<CategoriaPage> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        if (tipo) {
            params = params.set('tipo', tipo);
        }
        const headers = this.authService.getAuthHeaders();
        return this.http.get<CategoriaPage>(this.apiUrl, { headers, params });
    }

    findById(id: string): Observable<Categoria> {
        const headers = this.authService.getAuthHeaders();
        return this.http.get<Categoria>(`${this.apiUrl}/${id}`, { headers });
    }

    insert(categoria: Categoria): Observable<Categoria> {
        const headers = this.authService.getAuthHeaders();
        return this.http.post<Categoria>(this.apiUrl, categoria, { headers });
    }

    update(id: string, categoria: Categoria): Observable<Categoria> {
        const headers = this.authService.getAuthHeaders();
        return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria, { headers });
    }

    delete(id: string): Observable<void> {
        const headers = this.authService.getAuthHeaders();
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
    }
}
