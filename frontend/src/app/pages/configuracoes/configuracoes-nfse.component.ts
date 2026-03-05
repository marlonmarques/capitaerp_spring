import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { InputNumberModule } from 'primeng/inputnumber';

import { ConfiguracaoNfseService, ConfiguracaoNfse } from '../../core/services/configuracoes/configuracao-nfse.service';
import { NotificationService } from '../../core/services/notification.service';
import { NgxMaskDirective } from 'ngx-mask';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { ContaBancariaService, ContaBancaria } from '../../core/services/financeiro/conta-bancaria.service';
import { CategoriaService, Categoria } from '../../core/services/cadastros/categoria.service';
import { FiscalDataService, BuscaFiscalResultDTO } from '../../core/services/fiscal-data.service';
@Component({
    selector: 'app-configuracoes-nfse',
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
    templateUrl: './configuracoes-nfse.component.html'
})
export class ConfiguracoesNfseComponent implements OnInit {
    private fb = inject(FormBuilder);
    private configService = inject(ConfiguracaoNfseService);
    private notification = inject(NotificationService);
    private fiscalDataService = inject(FiscalDataService);
    private contaBancariaService = inject(ContaBancariaService);
    private categoriaService = inject(CategoriaService);

    configForm!: FormGroup;
    isLoading = false;
    isSaving = false;

    contasBancarias: ContaBancaria[] = [];
    categorias: Categoria[] = [];

    cnaes: BuscaFiscalResultDTO[] = [];
    lc116List: BuscaFiscalResultDTO[] = [];
    cnaeSearchCtrl = new FormControl<string | BuscaFiscalResultDTO | null>('');
    lc116SearchCtrl = new FormControl<string | BuscaFiscalResultDTO | null>('');

    ngOnInit(): void {
        this.initForm();
        this.carregarConfiguracoes();
    }

    private initForm(): void {
        this.configForm = this.fb.group({
            id: [null],
            ativarNfse: [false],
            serie: [1, Validators.required],
            numeroRps: [1, Validators.required],
            categoriaId: [null],
            infoComplementarPadrao: [''],
            cnaePadrao: [''],
            itemLc116Padrao: [''],
            aliquotaPadrao: [null],
            contaBancariaId: [null],
            ambiente: ['HOMOLOGACAO', Validators.required],
            enviarEmail: [false],
            assuntoEmail: ['Sua Nota Fiscal de Serviço'],
            mensagemEmail: ['Segue em anexo a sua NFS-e.']
        });

        // Toggle behaviour similar to PHP version
        this.configForm.get('ativarNfse')?.valueChanges.subscribe(ativado => {
            this.atualizarCamposDesativados(ativado);
        });

        // Configurando autocomplete CNAE
        this.cnaeSearchCtrl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(value => {
                if (typeof value === 'string') {
                    return this.fiscalDataService.searchCnaes(value);
                }
                return [];
            })
        ).subscribe(data => this.cnaes = data);

        // Configurando autocomplete LC116 (por NBS, mas como não armazenamos NBS na configuração de NFS-e global, vamos carregar tudo caso ele pesquise CNAE ou digitar)
        // Simplificação: podemos carregar todos os itens LC116 por um NBS associado a esse CNAE.
        // Aqui assumimos que ele buscaria na mão, e não teria NBS setado na config.
        // Entao faríamos uma busca full de LC116 se a API permitir, ou atrelamos a um NBS.
        // Mas o correto para serviços na nota é a gente só habilitar LC116 após ele selecionar um CNAE e seu NBS nos bastidores.
        // Para a config padrao, se a API `getLc116ByNbs` precisar de NBS, vamos só deixar a combo.
    }

    displayFiscal(item: BuscaFiscalResultDTO | null | undefined): string {
        return item ? item.label : '';
    }

    selecionarCnae(item: BuscaFiscalResultDTO): void {
        this.configForm.patchValue({ cnaePadrao: item.id, itemLc116Padrao: '' });
        this.lc116SearchCtrl.setValue('');
        this.lc116List = [];
        this.fiscalDataService.getNbsByCnae(item.id).subscribe(res => {
            // Em caso de haver um NBS para o CNAE, pega o primeiro e lista os LC116
            if (res && res.length > 0) {
                this.fiscalDataService.getLc116ByNbs(res[0].id).subscribe(lcRes => {
                    this.lc116List = lcRes;
                });
            }
        });
    }

    private carregarListasDaBase(): void {
        this.contaBancariaService.findAll().subscribe(contas => {
            this.contasBancarias = contas;
        });

        // Trazendo categorias para servicos/financeiro, pageSize grande
        this.categoriaService.findAllPaged('', 0, 100).subscribe(res => {
            if (res && res.content) {
                this.categorias = res.content;
            }
        });
    }

    private atualizarCamposDesativados(ativado: boolean) {
        const todosCampos = Object.keys(this.configForm.controls);
        todosCampos.forEach(key => {
            if (key !== 'ativarNfse' && key !== 'id') {
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
                    // Preenche SearchCtrls do Autocomplete para aparecer visualmente
                    if (config.cnaePadrao) {
                        this.fiscalDataService.searchCnaes(config.cnaePadrao).subscribe(res => {
                            const found = res.find(c => c.id === config.cnaePadrao);
                            if (found) {
                                this.cnaeSearchCtrl.setValue(found, { emitEvent: false });
                                this.fiscalDataService.getNbsByCnae(found.id).subscribe(nbsRes => {
                                    if (nbsRes && nbsRes.length > 0) {
                                        this.fiscalDataService.getLc116ByNbs(nbsRes[0].id).subscribe(lcRes => {
                                            this.lc116List = lcRes;
                                            const foundLc = lcRes.find(lc => lc.id === config.itemLc116Padrao);
                                            if (foundLc) this.lc116SearchCtrl.setValue(foundLc, { emitEvent: false });
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
                // Force the disable logic initially
                this.atualizarCamposDesativados(this.configForm.get('ativarNfse')?.value);
                this.isLoading = false;
            },
            error: (err) => {
                this.notification.error('Erro ao carregar configurações de NFS-e.');
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
        const configData: ConfiguracaoNfse = this.configForm.getRawValue();

        this.configService.salvarConfiguracao(configData).subscribe({
            next: (res) => {
                this.notification.success('Configurações da NFS-e salvas com sucesso!');
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
