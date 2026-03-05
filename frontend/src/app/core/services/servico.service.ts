import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Servico {
  id?: string;
  nome?: string;
  descricao?: string;
  codigoInterno?: string;
  preco?: number;
  status?: string;
  codigoServicoLc116?: string;
  aliquotaIss?: number;
  // Campos Reforma Tributária
  cnaeCodigo?: string;
  nbsCodigo?: string;
  descricaoNota?: string;
  aliquotaIbsPadrao?: number;
  aliquotaCbsPadrao?: number;
  // Audit
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServicoService {
  private apiUrl = `${environment.apiUrl}/api/v1/servicos`;

  constructor(private http: HttpClient) { }

  findAllPaged(page: number, size: number, busca: string = ''): Observable<Page<Servico>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (busca) {
      params = params.set('busca', busca);
    }

    return this.http.get<Page<Servico>>(this.apiUrl, { params });
  }

  findById(id: string): Observable<Servico> {
    return this.http.get<Servico>(`${this.apiUrl}/${id}`);
  }

  insert(data: Servico): Observable<Servico> {
    return this.http.post<Servico>(this.apiUrl, data);
  }

  update(id: string, data: Servico): Observable<Servico> {
    return this.http.put<Servico>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
