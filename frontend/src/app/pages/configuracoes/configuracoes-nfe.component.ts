import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { InputNumberModule } from 'primeng/inputnumber';

import { ConfiguracaoNfeService, ConfiguracaoNfe } from '../../core/services/configuracoes/configuracao-nfe.service';
import { NotificationService } from '../../core/services/notification.service';
import { NgxMaskDirective } from 'ngx-mask';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { ContaBancariaService, ContaBancaria } from '../../core/services/financeiro/conta-bancaria.service';
import { CategoriaService, Categoria } from '../../core/services/cadastros/categoria.service';
import { FiscalDataService, BuscaFiscalResultDTO } from '../../core/services/fiscal-data.service';

@Component({
    selector: 'app-configuracoes-nfe',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTabsModule,
        InputNumberModule,
        NgxMaskDirective,
        MatAutocompleteModule
    ],
    templateUrl: './configuracoes-nfe.component.html'
})
export class ConfiguracoesNfeComponent implements OnInit {
    private fb = inject(FormBuilder);
    private configService = inject(ConfiguracaoNfeService);
    private notification = inject(NotificationService);
    private fiscalDataService = inject(FiscalDataService);
    private contaBancariaService = inject(ContaBancariaService);
    private categoriaService = inject(CategoriaService);

    configForm!: FormGroup;
    isLoading = false;
    isSaving = false;

    contasBancarias: ContaBancaria[] = [];
    categorias: Categoria[] = [];

    cfops: BuscaFiscalResultDTO[] = [];
    cfopSearchCtrl = new FormControl<string | BuscaFiscalResultDTO | null>('');

    ngOnInit(): void {
        this.initForm();
        this.carregarListasDaBase();
        this.carregarConfiguracoes();
    }

    private initForm(): void {
        this.configForm = this.fb.group({
            id: [null],
            ativarNfe: [false],
            serie: [1, Validators.required],
            numeroNfe: [1, Validators.required],
            categoriaId: [null],
            infoComplementarPadrao: [''],
            cfopPadrao: [''],
            naturezaOperacaoPadrao: [''],
            contaBancariaId: [null],
            ambiente: ['HOMOLOGACAO', Validators.required],
            enviarEmail: [false],
            assuntoEmail: ['Sua Nota Fiscal de Produto'],
            mensagemEmail: ['Segue em anexo a sua NF-e.']
        });

        // Toggle behaviour similar to PHP version
        this.configForm.get('ativarNfe')?.valueChanges.subscribe(ativado => {
            this.atualizarCamposDesativados(ativado);
        });

        // Configurando autocomplete CFOP
        this.cfopSearchCtrl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(value => {
                if (typeof value === 'string') {
                    return this.fiscalDataService.searchCfops(value);
                }
                return [];
            })
        ).subscribe(data => this.cfops = data);
    }

    displayFiscal(item: BuscaFiscalResultDTO | null | undefined): string {
        return item ? item.label : '';
    }

    private carregarListasDaBase(): void {
        this.contaBancariaService.findAll().subscribe(contas => {
            this.contasBancarias = contas;
        });

        this.categoriaService.findAllPaged('', 0, 100).subscribe(res => {
            if (res && res.content) {
                this.categorias = res.content;
            }
        });
    }

    private atualizarCamposDesativados(ativado: boolean) {
        const todosCampos = Object.keys(this.configForm.controls);
        todosCampos.forEach(key => {
            if (key !== 'ativarNfe' && key !== 'id') {
                const control = this.configForm.get(key);
                if (ativado) {
                    control?.enable();
                } else {
                    control?.disable();
                }
            }
        });
    }

    private carregarConfiguracoes(): void {
        this.isLoading = true;
        this.configService.getConfiguracao().subscribe({
            next: (config) => {
                if (config) {
                    this.configForm.patchValue(config);
                    if (config.cfopPadrao) {
                        this.fiscalDataService.searchCfops(config.cfopPadrao).subscribe(res => {
                            const found = res.find(c => c.id === config.cfopPadrao);
                            if (found) {
                                this.cfopSearchCtrl.setValue(found, { emitEvent: false });
                            }
                        });
                    }
                }
                // Force the disable logic initially
                this.atualizarCamposDesativados(this.configForm.get('ativarNfe')?.value);
                this.isLoading = false;
            },
            error: (err) => {
                this.notification.error('Erro ao carregar configurações de NF-e.');
                this.isLoading = false;
            }
        });
    }

    salvar(): void {
        if (this.configForm.invalid) {
            this.configForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const configData: ConfiguracaoNfe = this.configForm.getRawValue();

        this.configService.salvarConfiguracao(configData).subscribe({
            next: (res) => {
                this.notification.success('Configurações da NF-e salvas com sucesso!');
                this.configForm.patchValue(res);
                this.isSaving = false;
            },
            error: (err) => {
                this.notification.error('Erro ao salvar as configurações.');
                this.isSaving = false;
            }
        });
    }
}
