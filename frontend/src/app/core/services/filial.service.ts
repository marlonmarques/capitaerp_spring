import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Filial } from '../models/filial.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FilialService {
    private apiUrl = `${environment.apiUrl}/api/v1/filiais`;

    constructor(private http: HttpClient) { }

    listarTodas(): Observable<Filial[]> {
        return this.http.get<Filial[]>(this.apiUrl);
    }

    salvar(filial: Filial): Observable<Filial> {
        if (filial.id) {
            return this.http.put<Filial>(`${this.apiUrl}/${filial.id}`, filial);
        }
        return this.http.post<Filial>(this.apiUrl, filial);
    }
}
