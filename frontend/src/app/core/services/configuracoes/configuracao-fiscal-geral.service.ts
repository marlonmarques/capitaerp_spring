import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ConfiguracaoFiscalGeral {
    id?: string;
    certificado?: string | null;
    senhaCertificado?: string | null;
    ambienteServicos: string;
    ambienteProdutos: string;
    regimeTributario: number;
    faturamentoAnual?: number | null;
    cnaePrincipal?: string | null;
    temCertificado?: boolean;
}

export interface CertificadoInfo {
    status: string;
    vencimento?: string;
    diasRestantes?: number;
    emissor?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ConfiguracaoFiscalGeralService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/v1/fiscal/config-geral`;

    getConfiguracao(): Observable<ConfiguracaoFiscalGeral> {
        return this.http.get<ConfiguracaoFiscalGeral>(this.apiUrl);
    }

    salvarConfiguracao(config: ConfiguracaoFiscalGeral): Observable<ConfiguracaoFiscalGeral> {
        return this.http.post<ConfiguracaoFiscalGeral>(this.apiUrl, config);
    }

    getCertificadoInfo(): Observable<CertificadoInfo> {
        return this.http.get<CertificadoInfo>(`${this.apiUrl}/certificado-info`);
    }
}
