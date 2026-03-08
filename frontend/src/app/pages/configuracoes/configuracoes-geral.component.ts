import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { InputNumberModule } from 'primeng/inputnumber';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { ConfiguracaoFiscalGeralService, ConfiguracaoFiscalGeral, CertificadoInfo } from '../../core/services/configuracoes/configuracao-fiscal-geral.service';
import { NotificationService } from '../../core/services/notification.service';
import { FiscalDataService, BuscaFiscalResultDTO } from '../../core/services/fiscal-data.service';
import { FilialService } from '../../core/services/filial.service';
import { Filial } from '../../core/models/filial.model';


import { ButtonModule } from 'primeng/button';


@Component({
    selector: 'app-configuracoes-geral',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatInputModule,
        InputNumberModule,
        MatAutocompleteModule,
        ButtonModule
    ],
    templateUrl: './configuracoes-geral.component.html',
    styles: [`
        .dropzone-new {
            border: 2px dashed #e2e8f0;
            border-radius: 1rem;
            padding: 2.5rem;
            text-align: center;
            background-color: #f8fafc;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .dropzone-new:hover {
            border-color: #6366f1;
            background-color: #f1f5f9;
            transform: translateY(-2px);
        }
    `]
})
export class ConfiguracoesGeralComponent implements OnInit {
    private fb = inject(FormBuilder);
    private configService = inject(ConfiguracaoFiscalGeralService);
    private notification = inject(NotificationService);
    private fiscalDataService = inject(FiscalDataService);
    private filialService = inject(FilialService);

    configForm!: FormGroup;
    isLoading = false;
    isSaving = false;
    showDownloadModal = false;
    isDownloading = false;
    downloadPasswordCtrl = new FormControl('', Validators.required);

    filiais: Filial[] = [];

    cnaes: BuscaFiscalResultDTO[] = [];
    cnaeSearchCtrl = new FormControl<string | BuscaFiscalResultDTO | null>('');

    selectedFile: File | null = null;
    fileBase64: string | null = null;
    certInfo: CertificadoInfo | null = null;

    ngOnInit(): void {
        this.initForm();
        this.carregarFiliaisEConfiguracoes();

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
    }

    private initForm(): void {
        this.configForm = this.fb.group({
            id: [null],
            filialId: [null, Validators.required],
            senhaCertificado: [''],
            regimeTributario: [6, Validators.required],
            faturamentoAnual: [null],
            cnaePrincipal: ['']
        });

        // Monitorar troca de filial
        this.configForm.get('filialId')?.valueChanges.subscribe(filialId => {
            if (filialId && !this.isLoading) {
                this.carregarConfiguracoes(filialId);
            }
        });
    }

    displayCnae(item: BuscaFiscalResultDTO | null | undefined): string {
        return item ? item.label : '';
    }

    selecionarCnae(item: BuscaFiscalResultDTO): void {
        this.configForm.patchValue({ cnaePrincipal: item.id });
    }

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                this.fileBase64 = reader.result as string;
            };
        }
    }

    triggerFileInput(): void {
        document.getElementById('fileUpload')?.click();
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
                // Reset search controllers and local state
                this.cnaeSearchCtrl.setValue('', { emitEvent: false });
                this.certInfo = null;

                if (config && config.id) {
                    this.configForm.patchValue({
                        id: config.id,
                        filialId: config.filialId || filialId,
                        regimeTributario: config.regimeTributario || 6,
                        faturamentoAnual: config.faturamentoAnual,
                        cnaePrincipal: config.cnaePrincipal
                    });

                    // Search CNAE
                    if (config.cnaePrincipal) {
                        this.fiscalDataService.searchCnaes(config.cnaePrincipal).subscribe(res => {
                            const found = res.find(c => c.id === config.cnaePrincipal);
                            if (found) {
                                this.cnaeSearchCtrl.setValue(found, { emitEvent: false });
                            }
                        });
                    }
                }
                this.isLoading = false;
                this.loadCertificadoInfo();
            },
            error: (err) => {
                this.notification.error('Erro ao carregar configurações gerais.');
                this.isLoading = false;
            }
        });
    }

    private loadCertificadoInfo() {
        const filialId = this.configForm.get('filialId')?.value;
        this.configService.getCertificadoInfo(filialId).subscribe({
            next: (info) => {
                this.certInfo = info;
            },
            error: () => { }
        });
    }

    salvar(): void {
        if (this.configForm.invalid) {
            this.configForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formValues = this.configForm.getRawValue();

        const configData: ConfiguracaoFiscalGeral = {
            ...formValues,
            certificado: this.fileBase64
        };

        this.configService.salvarConfiguracao(configData).subscribe({
            next: (res) => {
                this.notification.success('Configurações salvas com sucesso!');
                this.configForm.patchValue({ ...res, senhaCertificado: '' }); // Clear password field for security
                this.selectedFile = null;
                this.fileBase64 = null;
                this.isSaving = false;
                this.loadCertificadoInfo(); // Reload cert info after saving
            },
            error: (err) => {
                this.notification.error('Erro ao salvar as configurações.');
                this.isSaving = false;
            }
        });
    }

    abrirModalDownload(): void {
        this.downloadPasswordCtrl.reset();
        this.showDownloadModal = true;
    }

    fecharModalDownload(): void {
        this.showDownloadModal = false;
        this.downloadPasswordCtrl.reset();
    }

    baixarCertificado(): void {
        if (this.downloadPasswordCtrl.invalid) {
            this.downloadPasswordCtrl.markAsTouched();
            return;
        }

        this.isDownloading = true;
        const filialId = this.configForm.get('filialId')?.value;
        const senha = this.downloadPasswordCtrl.value;

        if (!filialId || !senha) {
            this.notification.error('Filial ou senha não informada.');
            this.isDownloading = false;
            return;
        }

        // Chamada real ao Serviço do Angular
        this.configService.downloadCertificado(filialId as string, senha as string).subscribe({
            next: (blob: Blob) => {
                // Cria um link temporário para o download do arquivo binário (Blob)
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `certificado_filial_${filialId}.pfx`; // Nome do arquivo sugerido
                document.body.appendChild(a);
                a.click();

                // Limpeza do DOM e memória
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                this.notification.success('Download concluído com sucesso.');
                this.isDownloading = false;
                this.fecharModalDownload();
            },
            error: (err: any) => {
                console.error(err);
                this.notification.error('Senha incorreta ou erro ao recuperar o certificado.');
                this.isDownloading = false;
            }
        });
    }
}
