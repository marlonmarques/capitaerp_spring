import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ConfiguracaoFiscalGeral {
    id?: string;
    filialId?: string | null;
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

    getConfiguracao(filialId?: string): Observable<ConfiguracaoFiscalGeral> {
        let params = new HttpParams();
        if (filialId) params = params.set('filialId', filialId);
        return this.http.get<ConfiguracaoFiscalGeral>(this.apiUrl, { params });
    }

    salvarConfiguracao(config: ConfiguracaoFiscalGeral): Observable<ConfiguracaoFiscalGeral> {
        return this.http.post<ConfiguracaoFiscalGeral>(this.apiUrl, config);
    }

    getCertificadoInfo(filialId?: string): Observable<CertificadoInfo> {
        let params = new HttpParams();
        if (filialId) params = params.set('filialId', filialId);
        return this.http.get<CertificadoInfo>(`${this.apiUrl}/certificado-info`, { params });
    }

    downloadCertificado(filialId: string, senha: string) {
        // Passando a senha via body ou params dependendo da sua API
        return this.http.post(
            `${this.apiUrl}/download-certificado/${filialId}`,
            { senha: senha },
            { responseType: 'blob' } 
        );
    }
}
