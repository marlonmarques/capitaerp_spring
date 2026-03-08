import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

import { FilialService } from '../../core/services/filial.service';
import { PdvService } from '../../core/services/pdv.service';
import { NotificationService } from '../../core/services/notification.service';
import { Filial } from '../../core/models/filial.model';
import { Pdv } from '../../core/models/pdv.model';
import { ConsultaService } from '../../core/services/integracoes/consulta.service';
import { IbgeService, Estado, Municipio } from '../../core/services/integracoes/ibge.service';
import { LoadingService } from '../../core/services/loading.service';
import { finalize } from 'rxjs';

import { NgxMaskDirective } from 'ngx-mask';

@Component({
    selector: 'app-filial-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        NgxMaskDirective
    ],
    templateUrl: './filial-form.component.html'
})
export class FilialFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private filialService = inject(FilialService);
    private pdvService = inject(PdvService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private notification = inject(NotificationService);
    private consultaService = inject(ConsultaService);
    private ibgeService = inject(IbgeService);
    private loadingService = inject(LoadingService);

    estados = signal<Estado[]>([]);
    todasCidades: { [uf: string]: Municipio[] } = {};

    form!: FormGroup;
    pdvForm!: FormGroup;

    filialId: string | null = null;
    pdvs: Pdv[] = [];
    isLoading = false;
    isSaving = false;

    ngOnInit() {
        this.initForm();
        this.carregarEstados();
        this.filialId = this.route.snapshot.paramMap.get('id');

        if (this.filialId) {
            this.carregarFiliaisEEncontrar();
            this.carregarPdvs();
        }
    }

    private initForm() {
        this.form = this.fb.group({
            razaoSocial: ['', Validators.required],
            nomeFantasia: [''],
            cnpj: ['', Validators.required],
            inscricaoEstadual: [''],
            inscricaoMunicipal: [''],
            crt: [''],
            tenantIdentifier: [''],
            cep: [''],
            logradouro: [''],
            numero: [''],
            complemento: [''],
            bairro: [''],
            cidade: [''],
            estado: [''],
            ibge: [''],
            isMatriz: [false],
            ativo: [true]
        });

        this.pdvForm = this.fb.group({
            nome: ['', Validators.required],
            serieNfce: [1, Validators.required],
            numeroAtualNfce: [1, Validators.required],
            ativo: [true]
        });
    }

    // Workaround since we don't have getById yet, we fetch all and find
    carregarFiliaisEEncontrar() {
        this.isLoading = true;
        this.filialService.listarTodas().subscribe({
            next: (filiais) => {
                const filial = filiais.find(f => f.id === this.filialId);
                if (filial) {
                    this.form.patchValue(filial);
                    if (filial.estado) {
                        this.processarUfParaMunicipios(filial.estado);
                    }
                } else {
                    this.notification.error('Filial não encontrada.');
                    this.router.navigate(['/filiais']);
                }
                this.isLoading = false;
            },
            error: () => {
                this.notification.error('Erro ao carregar filial');
                this.isLoading = false;
            }
        });
    }

    carregarPdvs() {
        if (this.filialId) {
            this.pdvService.listarPorFilial(this.filialId).subscribe({
                next: (pdvs) => this.pdvs = pdvs,
                error: () => this.notification.error('Erro ao carregar caixas.')
            });
        }
    }

    salvar() {
        if (this.form.invalid) return;

        this.isSaving = true;
        const filial: Filial = {
            id: this.filialId || undefined,
            ...this.form.value
        };

        this.filialService.salvar(filial).subscribe({
            next: (res) => {
                this.notification.success('Filial salva com sucesso!');
                this.isSaving = false;
                if (!this.filialId) {
                    this.router.navigate(['/filiais', res.id, 'edit']);
                } else {
                    this.carregarFiliaisEEncontrar();
                }
            },
            error: () => {
                this.notification.error('Erro ao salvar filial');
                this.isSaving = false;
            }
        });
    }

    editingPdvId: string | null = null;

    adicionarPdv() {
        if (this.pdvForm.invalid || !this.filialId) return;

        const pdvData: Pdv = {
            id: this.editingPdvId || undefined,
            filialId: this.filialId,
            ...this.pdvForm.value
        };

        this.pdvService.salvar(pdvData).subscribe({
            next: () => {
                this.notification.success(this.editingPdvId ? 'Caixa atualizado!' : 'Caixa adicionado!');
                this.cancelarEdicaoPdv();
                this.carregarPdvs();
            },
            error: (err) => this.notification.error(err?.error?.message || 'Erro ao salvar caixa')
        });
    }

    editarPdv(pdv: Pdv) {
        this.editingPdvId = pdv.id || null;
        this.pdvForm.patchValue({
            nome: pdv.nome,
            serieNfce: pdv.serieNfce,
            numeroAtualNfce: pdv.numeroAtualNfce,
            ativo: pdv.ativo
        });

        // Blindagem: Desabilita se já emitiu notas
        if (pdv.numeroAtualNfce && pdv.numeroAtualNfce > 1) {
            this.pdvForm.get('serieNfce')?.disable();
            this.pdvForm.get('numeroAtualNfce')?.disable();
        } else {
            this.pdvForm.get('serieNfce')?.enable();
            this.pdvForm.get('numeroAtualNfce')?.enable();
        }
    }

    cancelarEdicaoPdv() {
        this.editingPdvId = null;
        this.pdvForm.reset({ serieNfce: 1, numeroAtualNfce: 1, ativo: true });
        this.pdvForm.get('serieNfce')?.enable();
        this.pdvForm.get('numeroAtualNfce')?.enable();
    }

    voltar() {
        this.router.navigate(['/filiais']);
    }

    carregarEstados(): void {
        this.ibgeService.getEstados().subscribe(estados => {
            this.estados.set(estados);
        });
    }

    processarUfParaMunicipios(siglaUf: string): void {
        if (!this.todasCidades[siglaUf]) {
            this.ibgeService.getMunicipiosPorEstado(siglaUf).subscribe(m => {
                this.todasCidades[siglaUf] = m;
            });
        }
    }

    onUfChange(): void {
        const sigla = this.form.get('estado')?.value;
        if (sigla) {
            this.form.get('cidade')?.setValue('');
            this.processarUfParaMunicipios(sigla);
        }
    }

    getCidadesForEndereco(): Municipio[] {
        const sigla = this.form.get('estado')?.value;
        return sigla ? (this.todasCidades[sigla] || []) : [];
    }

    buscarCepDetalhes(): void {
        const cep = this.form.get('cep')?.value;
        if (!cep || cep.length < 8) return;

        this.loadingService.show();
        this.consultaService.consultarCep(cep).pipe(
            finalize(() => this.loadingService.hide())
        ).subscribe({
            next: (dados) => {
                this.form.patchValue({
                    logradouro: dados.logradouro || '',
                    bairro: dados.bairro || '',
                    cidade: dados.localidade || '',
                    estado: dados.uf || '',
                    ibge: dados.ibge || ''
                });
                if (dados.uf) {
                    this.processarUfParaMunicipios(dados.uf);
                }
                this.notification.success('Endereço atualizado!');
            },
            error: (err) => this.notification.error('Erro ao consultar CEP')
        });
    }
}
