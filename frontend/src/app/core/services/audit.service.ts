import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuditLog {
  id: string;
  autor: string;
  acao: string;
  entidade: string;
  detalhes: string;
  dataHora: string;
  ipOrigem?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/api/v1/audit`;

  findAll(entidade?: string, page = 0, size = 100): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (entidade) {
        params = params.set('entidade', entidade);
    }

    return this.http.get<any>(this.API, { params });
  }
}
