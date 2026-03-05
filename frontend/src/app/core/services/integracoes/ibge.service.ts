import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Estado {
    id: number;
    sigla: string;
    nome: string;
}

export interface Municipio {
    id: number;
    nome: string;
}

@Injectable({
    providedIn: 'root'
})
export class IbgeService {
    private http = inject(HttpClient);

    getEstados(): Observable<Estado[]> {
        return this.http.get<Estado[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .pipe(
                map(estados => estados.sort((a, b) => a.nome.localeCompare(b.nome)))
            );
    }

    getMunicipiosPorEstado(ufId: number | string): Observable<Municipio[]> {
        return this.http.get<Municipio[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufId}/municipios`)
            .pipe(
                map(municipios => municipios.sort((a, b) => a.nome.localeCompare(b.nome)))
            );
    }
}
