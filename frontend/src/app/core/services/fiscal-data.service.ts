import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BuscaFiscalResultDTO {
    id: string;
    label: string;
}

export interface NcmResultDTO {
    codigo: string;
    descricao: string;
    label: string;
    pisCofinsNacional: number;
    pisCofinsImportado: number;
    icmsEstadual: number;
    issMunicipal: number;
}

export interface CestResultDTO {
    codigo: string;
    descricao: string;
    segmento?: string;
    label: string;
}

@Injectable({
    providedIn: 'root'
})
export class FiscalDataService {
    private apiUrl = `${environment.apiUrl}/api/v1/fiscal-data`;

    constructor(private http: HttpClient) { }

    searchCnaes(search: string = ''): Observable<BuscaFiscalResultDTO[]> {
        let params = new HttpParams();
        if (search) {
            params = params.set('search', search);
        }
        return this.http.get<BuscaFiscalResultDTO[]>(`${this.apiUrl}/cnaes`, { params });
    }

    searchNbs(search: string = ''): Observable<BuscaFiscalResultDTO[]> {
        let params = new HttpParams();
        if (search) {
            params = params.set('search', search);
        }
        return this.http.get<BuscaFiscalResultDTO[]>(`${this.apiUrl}/nbs`, { params });
    }

    getNbsByCnae(cnaeMascara: string): Observable<BuscaFiscalResultDTO[]> {
        let params = new HttpParams().set('cnaeMascara', cnaeMascara);
        return this.http.get<BuscaFiscalResultDTO[]>(`${this.apiUrl}/nbs-by-cnae`, { params });
    }

    getLc116ByNbs(nbsCodigo: string): Observable<BuscaFiscalResultDTO[]> {
        let params = new HttpParams().set('nbsCodigo', nbsCodigo);
        return this.http.get<BuscaFiscalResultDTO[]>(`${this.apiUrl}/lc116-by-nbs`, { params });
    }

    searchCfops(search: string = ''): Observable<BuscaFiscalResultDTO[]> {
        let params = new HttpParams();
        if (search) {
            params = params.set('search', search);
        }
        return this.http.get<BuscaFiscalResultDTO[]>(`${this.apiUrl}/cfops`, { params });
    }

    getCondicoesPagamento(): Observable<BuscaFiscalResultDTO[]> {
        return this.http.get<BuscaFiscalResultDTO[]>(`${this.apiUrl}/condicoes-pagamento`);
    }

    searchNcm(search: string = ''): Observable<NcmResultDTO[]> {
        let params = new HttpParams();
        if (search) {
            params = params.set('search', search);
        }
        return this.http.get<NcmResultDTO[]>(`${this.apiUrl}/ncm`, { params });
    }

    getCestByNcm(ncmCodigo: string): Observable<CestResultDTO[]> {
        const params = new HttpParams().set('ncm', ncmCodigo);
        return this.http.get<CestResultDTO[]>(`${this.apiUrl}/cest-by-ncm`, { params });
    }

    searchCest(search: string = ''): Observable<CestResultDTO[]> {
        let params = new HttpParams();
        if (search) params = params.set('search', search);
        return this.http.get<CestResultDTO[]>(`${this.apiUrl}/cest`, { params });
    }
}
