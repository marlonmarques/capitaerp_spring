import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type RegimeTributario = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'MEI' | 'ISENTO';
export type TipoImposto = 'ICMS' | 'ICMS_ST' | 'IPI' | 'ISS' | 'PIS_COFINS' | 'SIMPLES' | 'COMPOSTO' | 'IBS_CBS' | 'ISENTO';

export interface GrupoTributario {
    id?: string;
    nome: string;
    descricao?: string;
    regime: RegimeTributario;
    tipoImposto: TipoImposto;
    ativo?: boolean;
    // ICMS
    cstCsosn?: string;
    aliquotaIcms?: number;
    reducaoBaseIcms?: number;
    aliquotaDifal?: number;
    // ICMS ST
    aliquotaSt?: number;
    mva?: number;
    reducaoBaseSt?: number;
    // IPI
    cstIpi?: string;
    aliquotaIpi?: number;
    // PIS / COFINS
    cstPis?: string;
    aliquotaPis?: number;
    cstCofins?: string;
    aliquotaCofins?: number;
    // ISS
    aliquotaIss?: number;
    reterIss?: boolean;
    // CFOP
    cfopSaida?: string;
    cfopEntrada?: string;
    // Reforma Tributária (EC 132/2023)
    aliquotaIbs?: number;
    aliquotaCbs?: number;
    aliquotaIs?: number;
    codigoIs?: string;
    regimeEspecialReforma?: string;
    // Timestamps
    criadoEm?: string;
    atualizadoEm?: string;
}

export const REGIMES_TRIBUTARIOS: { valor: RegimeTributario; label: string }[] = [
    { valor: 'SIMPLES_NACIONAL', label: 'Simples Nacional' },
    { valor: 'LUCRO_PRESUMIDO', label: 'Lucro Presumido' },
    { valor: 'LUCRO_REAL', label: 'Lucro Real' },
    { valor: 'MEI', label: 'MEI' },
    { valor: 'ISENTO', label: 'Isento / Não Contribuinte' },
];

export const TIPOS_IMPOSTO: { valor: TipoImposto; label: string }[] = [
    { valor: 'ICMS', label: 'ICMS' },
    { valor: 'ICMS_ST', label: 'ICMS ST — Substituição Tributária' },
    { valor: 'IPI', label: 'IPI — Produto Industrializado' },
    { valor: 'ISS', label: 'ISS — Imposto Sobre Serviços' },
    { valor: 'PIS_COFINS', label: 'PIS/COFINS' },
    { valor: 'SIMPLES', label: 'Simples Nacional (unificado)' },
    { valor: 'IBS_CBS', label: 'IBS/CBS — Reforma Tributária' },
    { valor: 'ISENTO', label: 'Isento / Não Tributado' },
];

export const CST_CSOSN_SIMPLES: { valor: string; label: string }[] = [
    { valor: '101', label: '101 — Tributada pelo SN com permissão de crédito' },
    { valor: '102', label: '102 — Sem permissão de crédito' },
    { valor: '103', label: '103 — Isenção do ICMS (faixa receita bruta)' },
    { valor: '201', label: '201 — SN com permissão de crédito e ST' },
    { valor: '202', label: '202 — Sem permissão de crédito e ST' },
    { valor: '300', label: '300 — Imune' },
    { valor: '400', label: '400 — Não tributada pelo Simples Nacional' },
    { valor: '500', label: '500 — ICMS cobrado anteriormente por ST (retido)' },
    { valor: '900', label: '900 — Outros' },
];

export const CST_ICMS_NORMAL: { valor: string; label: string }[] = [
    { valor: '00', label: '00 — Tributada integralmente' },
    { valor: '10', label: '10 — Tributada com cobrança de ST' },
    { valor: '20', label: '20 — Com redução de base de cálculo' },
    { valor: '30', label: '30 — Isenta ou não tributada com cobrança de ST' },
    { valor: '40', label: '40 — Isenta' },
    { valor: '41', label: '41 — Não tributada' },
    { valor: '50', label: '50 — Suspensão' },
    { valor: '51', label: '51 — Diferimento' },
    { valor: '60', label: '60 — ICMS cobrado anteriormente por ST (retido)' },
    { valor: '70', label: '70 — Com redução de BC e cobrança de ST' },
    { valor: '90', label: '90 — Outros' },
];

@Injectable({ providedIn: 'root' })
export class GrupoTributarioService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/v1/grupos-tributarios`;

    findAll(incluirInativos = false): Observable<GrupoTributario[]> {
        const params = new HttpParams().set('incluirInativos', incluirInativos);
        return this.http.get<GrupoTributario[]>(this.apiUrl, { params });
    }

    findById(id: string): Observable<GrupoTributario> {
        return this.http.get<GrupoTributario>(`${this.apiUrl}/${id}`);
    }

    insert(dto: GrupoTributario): Observable<GrupoTributario> {
        return this.http.post<GrupoTributario>(this.apiUrl, dto);
    }

    update(id: string, dto: GrupoTributario): Observable<GrupoTributario> {
        return this.http.put<GrupoTributario>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
