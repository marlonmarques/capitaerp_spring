import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pdv } from '../models/pdv.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PdvService {
    private apiUrl = `${environment.apiUrl}/api/v1/pdvs`;

    constructor(private http: HttpClient) { }

    listarPorFilial(filialId: string): Observable<Pdv[]> {
        return this.http.get<Pdv[]>(`${this.apiUrl}/filial/${filialId}`);
    }

    salvar(pdv: Pdv): Observable<Pdv> {
        if (pdv.id) {
            return this.http.put<Pdv>(`${this.apiUrl}/${pdv.id}`, pdv);
        }
        return this.http.post<Pdv>(this.apiUrl, pdv);
    }

    obterProximoNumero(pdvId: string): Observable<number> {
        return this.http.post<number>(`${this.apiUrl}/${pdvId}/proximo-numero`, {});
    }
}
