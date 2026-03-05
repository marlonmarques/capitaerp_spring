import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Empresa } from '../models/empresa.model';
import { environment } from '../../../environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EmpresaService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/v1/empresas`;

    // Sinal reativo principal com os dados da empresa.
    // Inicia com nulo até carregar.
    readonly configuracao = signal<Empresa | null>(null);

    /**
     * Busca as configurações da empresa (incluindo logoUrl)
     * É ideal chamar isso no APP_INITIALIZER ou no OnInit do AppComponent Principal.
     */
    carregarConfiguracao(): Observable<Empresa | null> {
        return this.http.get<Empresa>(`${this.apiUrl}/configuracao`).pipe(
            tap((empresa) => this.configuracao.set(empresa)),
            catchError((err) => {
                console.warn('Configuração de empresa não encontrada.', err);
                return of(null);
            })
        );
    }

    get logoUrlSegura(): string {
        const config = this.configuracao();
        return config?.logoUrl ? config.logoUrl : 'assets/images/logo-placeholder.png';
    }

    salvarConfiguracao(empresa: Empresa): Observable<Empresa> {
        return this.http.put<Empresa>(`${this.apiUrl}/configuracao`, empresa).pipe(
            tap((atualizada) => this.configuracao.set(atualizada))
        );
    }
}
