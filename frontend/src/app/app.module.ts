import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePt);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ConfirmDialogModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideEnvironmentNgxMask(),
    ConfirmationService,
    MessageService,
    providePrimeNG({
      theme: { preset: Aura, options: { darkModeSelector: '.dark' } },
      translation: {
        startsWith: 'Começa com',
        contains: 'Contém',
        notContains: 'Não contém',
        endsWith: 'Termina com',
        equals: 'Igual a',
        notEquals: 'Diferente de',
        noFilter: 'Sem filtro',
        lt: 'Menor que',
        lte: 'Menor que ou igual',
        gt: 'Maior que',
        gte: 'Maior que ou igual',
        is: 'É',
        isNot: 'Não é',
        before: 'Antes',
        after: 'Depois',
        dateIs: 'Data é',
        dateIsNot: 'Data não é',
        dateBefore: 'Data é antes',
        dateAfter: 'Data é depois',
        clear: 'Limpar',
        apply: 'Aplicar',
        matchAll: 'Todas as regras',
        matchAny: 'Qualquer regra',
        addRule: 'Adicionar Regra',
        removeRule: 'Remover Regra',
        accept: 'Sim',
        reject: 'Não',
        choose: 'Escolher',
        upload: 'Enviar',
        cancel: 'Cancelar',
        emptyFilterMessage: 'Nenhum resultado encontrado',
        emptyMessage: 'Nenhum registro encontrado'
      }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
