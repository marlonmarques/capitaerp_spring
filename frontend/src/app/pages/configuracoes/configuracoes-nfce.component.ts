import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { InputNumberModule } from 'primeng/inputnumber';

import { ConfiguracaoNfceService, ConfiguracaoNfce } from '../../core/services/configuracoes/configuracao-nfce.service';
import { NotificationService } from '../../core/services/notification.service';
import { NgxMaskDirective } from 'ngx-mask';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { ContaBancariaService, ContaBancaria } from '../../core/services/financeiro/conta-bancaria.service';
import { CategoriaService, Categoria } from '../../core/services/cadastros/categoria.service';
import { FiscalDataService, BuscaFiscalResultDTO } from '../../core/services/fiscal-data.service';
import { FilialService } from '../../core/services/filial.service';
import { Filial } from '../../core/models/filial.model';
import { MenuRefreshService } from '../../core/services/menu-refresh.service';

import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-configuracoes-nfce',
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
        MatAutocompleteModule,
        ButtonModule
    ],
    templateUrl: './configuracoes-nfce.component.html'
})
export class ConfiguracoesNfceComponent implements OnInit {
    private menuRefresh = inject(MenuRefreshService);
    private fb = inject(FormBuilder);
    private configService = inject(ConfiguracaoNfceService);
    private notification = inject(NotificationService);
    private fiscalDataService = inject(FiscalDataService);
    private contaBancariaService = inject(ContaBancariaService);
    private categoriaService = inject(CategoriaService);
    private filialService = inject(FilialService);

    configForm!: FormGroup;
    isLoading = false;
    isSaving = false;

    contasBancarias: ContaBancaria[] = [];
    categorias: Categoria[] = [];
    filiais: Filial[] = [];

    cfops: BuscaFiscalResultDTO[] = [];
    cfopSearchCtrl = new FormControl<string | BuscaFiscalResultDTO | null>('');

    ngOnInit(): void {
        this.initForm();
        this.carregarListasDaBase();
        this.carregarFiliaisEConfiguracoes();
    }

    private initForm(): void {
        this.configForm = this.fb.group({
            id: [null],
            filialId: [null, Validators.required],
            ativarNfce: [false],
            serie: [1, Validators.required],
            numeroNfce: [1, Validators.required],
            categoriaId: [null],
            infoComplementarPadrao: [''],
            cfopPadrao: [''],
            contaBancariaId: [null],
            ambiente: ['HOMOLOGACAO', Validators.required],
            enviarEmail: [false],
            assuntoEmail: ['Sua Nota Fiscal de Consumidor'],
            mensagemEmail: ['Segue em anexo a sua NFC-e.'],
            idCsc: [''],
            csc: ['']
        });

        // Toggle logic
        this.configForm.get('ativarNfce')?.valueChanges.subscribe(ativado => {
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

        // Monitorar troca de filial
        this.configForm.get('filialId')?.valueChanges.subscribe(filialId => {
            if (filialId && !this.isLoading) {
                this.carregarConfiguracoes(filialId);
            }
        });
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
            if (key !== 'ativarNfce' && key !== 'id') {
                const control = this.configForm.get(key);
                if (ativado) {
                    control?.enable();
                } else {
                    control?.disable();
                }
            }
        });
    }

    private carregarFiliaisEConfiguracoes(): void {
        this.isLoading = true;
        this.filialService.listarTodas().subscribe({
            next: (filiais) => {
                this.filiais = filiais;
                const defaultFilial = filiais.length > 0 ? filiais[0].id : null;
                if (defaultFilial) {
                    this.configForm.get('filialId')?.setValue(defaultFilial, { emitEvent: false });
                    this.carregarConfiguracoes(defaultFilial as string);
                } else {
                    this.isLoading = false;
                }
            },
            error: () => {
                this.notification.error('Erro ao carregar filiais.');
                this.isLoading = false;
            }
        });
    }

    private carregarConfiguracoes(filialId?: string): void {
        this.isLoading = true;
        this.configService.getConfiguracao(filialId).subscribe({
            next: (config) => {
                // Reset search controllers
                this.cfopSearchCtrl.setValue('', { emitEvent: false });

                if (config && config.id) {
                    this.configForm.patchValue({
                        ...config,
                        filialId: config.filialId || filialId
                    });
                    if (config.cfopPadrao) {
                        this.fiscalDataService.searchCfops(config.cfopPadrao).subscribe(res => {
                            const found = res.find(c => c.id === config.cfopPadrao);
                            if (found) {
                                this.cfopSearchCtrl.setValue(found, { emitEvent: false });
                            }
                        });
                    }
                }
                this.atualizarCamposDesativados(this.configForm.get('ativarNfce')?.value);
                this.isLoading = false;
            },
            error: (err) => {
                this.notification.error('Erro ao carregar configurações de NFC-e.');
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
        const configData: ConfiguracaoNfce = this.configForm.getRawValue();

        this.configService.salvarConfiguracao(configData).subscribe({
            next: (res) => {
                this.notification.success('Configurações da NFC-e salvas com sucesso!');
                this.configForm.patchValue(res);
                this.isSaving = false;
                this.menuRefresh.emitirRefresh();
            },
            error: (err) => {
                this.notification.error('Erro ao salvar as configurações.');
                this.isSaving = false;
            }
        });
    }
}
