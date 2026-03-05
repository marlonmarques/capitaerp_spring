import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ConfiguracaoNfse {
    id?: string;
    ativarNfse: boolean;
    serie: number;
    numeroRps: number;
    categoriaId?: string | null;
    infoComplementarPadrao?: string | null;
    cnaePadrao?: string | null;
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

    getConfiguracao(): Observable<ConfiguracaoNfse> {
        return this.http.get<ConfiguracaoNfse>(this.apiUrl);
    }

    salvarConfiguracao(config: ConfiguracaoNfse): Observable<ConfiguracaoNfse> {
        return this.http.put<ConfiguracaoNfse>(this.apiUrl, config);
    }
}
