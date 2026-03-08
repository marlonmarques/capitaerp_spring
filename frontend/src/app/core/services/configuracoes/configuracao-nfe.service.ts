import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ConfiguracaoNfe {
    id?: string;
    filialId?: string;
    ativarNfe: boolean;
    serie: number;
    numeroNfe: number;
    categoriaId?: string | null;
    infoComplementarPadrao?: string | null;
    cfopPadrao?: string | null;
    naturezaOperacaoPadrao?: string | null;
    contaBancariaId?: string | null;
    ambiente: string;
    enviarEmail: boolean;
    assuntoEmail?: string | null;
    mensagemEmail?: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class ConfiguracaoNfeService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/v1/configuracao-nfe`;

    getConfiguracao(filialId?: string): Observable<ConfiguracaoNfe> {
        let params = new HttpParams();
        if (filialId) params = params.set('filialId', filialId);
        return this.http.get<ConfiguracaoNfe>(this.apiUrl, { params });
    }

    salvarConfiguracao(config: ConfiguracaoNfe): Observable<ConfiguracaoNfe> {
        return this.http.put<ConfiguracaoNfe>(this.apiUrl, config);
    }
}
