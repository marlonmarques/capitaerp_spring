import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ConfiguracaoNfe {
    id?: string;
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

    getConfiguracao(): Observable<ConfiguracaoNfe> {
        return this.http.get<ConfiguracaoNfe>(this.apiUrl);
    }

    salvarConfiguracao(config: ConfiguracaoNfe): Observable<ConfiguracaoNfe> {
        return this.http.put<ConfiguracaoNfe>(this.apiUrl, config);
    }
}
