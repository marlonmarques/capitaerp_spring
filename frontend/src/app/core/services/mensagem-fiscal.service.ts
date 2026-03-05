import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MensagemFiscal {
  id?: string;
  titulo: string;
  destino: 'FISCO' | 'CONTRIBUINTE';
  textoTemplate: string;
}

@Injectable({ providedIn: 'root' })
export class MensagemFiscalService {
  private apiUrl = `${environment.apiUrl}/api/v1/mensagens-fiscais`;

  constructor(private http: HttpClient) { }

  findAll(): Observable<MensagemFiscal[]> {
    return this.http.get<MensagemFiscal[]>(this.apiUrl);
  }

  findById(id: string): Observable<MensagemFiscal> {
    return this.http.get<MensagemFiscal>(`${this.apiUrl}/${id}`);
  }

  insert(data: MensagemFiscal): Observable<MensagemFiscal> {
    return this.http.post<MensagemFiscal>(this.apiUrl, data);
  }

  update(id: string, data: MensagemFiscal): Observable<MensagemFiscal> {
    return this.http.put<MensagemFiscal>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

