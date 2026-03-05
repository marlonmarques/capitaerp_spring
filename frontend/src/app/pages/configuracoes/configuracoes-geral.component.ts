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
        MatAutocompleteModule
    ],
    templateUrl: './configuracoes-geral.component.html',
    styles: [`
        .dropzone {
            border: 2px dashed #cbd5e1;
            border-radius: 0.5rem;
            padding: 2rem;
            text-align: center;
            background-color: #f8fafc;
            cursor: pointer;
            transition: border-color 0.3s ease;
        }
        .dropzone:hover {
            border-color: #f97316; /* Tailwind orange-500 */
        }
    `]
})
export class ConfiguracoesGeralComponent implements OnInit {
    private fb = inject(FormBuilder);
    private configService = inject(ConfiguracaoFiscalGeralService);
    private notification = inject(NotificationService);
    private fiscalDataService = inject(FiscalDataService);

    configForm!: FormGroup;
    isLoading = false;
    isSaving = false;

    cnaes: BuscaFiscalResultDTO[] = [];
    cnaeSearchCtrl = new FormControl<string | BuscaFiscalResultDTO | null>('');

    selectedFile: File | null = null;
    fileBase64: string | null = null;
    certInfo: CertificadoInfo | null = null;

    ngOnInit(): void {
        this.initForm();
        this.carregarConfiguracoes();

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
            senhaCertificado: [''],
            ambienteServicos: ['Produção', Validators.required],
            ambienteProdutos: ['Produção', Validators.required],
            regimeTributario: [6, Validators.required],
            faturamentoAnual: [null],
            cnaePrincipal: ['']
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

    private carregarConfiguracoes(): void {
        this.isLoading = true;
        this.configService.getConfiguracao().subscribe({
            next: (config) => {
                if (config) {
                    this.configForm.patchValue({
                        id: config.id,
                        ambienteServicos: config.ambienteServicos || 'Homologação',
                        ambienteProdutos: config.ambienteProdutos || 'Homologação',
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
        this.configService.getCertificadoInfo().subscribe({
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
}
