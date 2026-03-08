import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ConfiguracaoNfce {
    id?: string;
    filialId?: string;
    ativarNfce: boolean;
    serie: number;
    numeroNfce: number;
    categoriaId?: string | null;
    infoComplementarPadrao?: string | null;
    cfopPadrao?: string | null;
    contaBancariaId?: string | null;
    ambiente: string;
    enviarEmail: boolean;
    assuntoEmail?: string | null;
    mensagemEmail?: string | null;
    idCsc?: string | null;
    csc?: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class ConfiguracaoNfceService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/v1/configuracao-nfce`;

    getConfiguracao(filialId?: string): Observable<ConfiguracaoNfce> {
        let params = new HttpParams();
        if (filialId) params = params.set('filialId', filialId);
        return this.http.get<ConfiguracaoNfce>(this.apiUrl, { params });
    }

    salvarConfiguracao(config: ConfiguracaoNfce): Observable<ConfiguracaoNfce> {
        return this.http.put<ConfiguracaoNfce>(this.apiUrl, config);
    }
}
