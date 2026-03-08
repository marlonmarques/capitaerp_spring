import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ConfiguracaoNfse {
    id?: string;
    filialId?: string;
    ativarNfse: boolean;
    serie: number;
    numeroRps: number;
    categoriaId?: string | null;
    infoComplementarPadrao?: string | null;
    cnaePadrao?: string | null;
    nbsPadrao?: string | null;
    itemLc116Padrao?: string | null;
    aliquotaPadrao?: number | null;
    contaBancariaId?: string | null;
    ambiente: string;
    enviarEmail: boolean;
    assuntoEmail?: string | null;
    mensagemEmail?: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class ConfiguracaoNfseService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/v1/configuracao-nfse`;

    getConfiguracao(filialId?: string): Observable<ConfiguracaoNfse> {
        let params = new HttpParams();
        if (filialId) params = params.set('filialId', filialId);
        return this.http.get<ConfiguracaoNfse>(this.apiUrl, { params });
    }

    salvarConfiguracao(config: ConfiguracaoNfse): Observable<ConfiguracaoNfse> {
        return this.http.put<ConfiguracaoNfse>(this.apiUrl, config);
    }
}
