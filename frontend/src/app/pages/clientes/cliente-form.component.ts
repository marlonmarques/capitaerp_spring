import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { ClienteService, Cliente, EnderecoCliente, EmailCliente } from '../../core/services/cadastros/cliente.service';
import { ConsultaService } from '../../core/services/integracoes/consulta.service';
import { IbgeService, Estado, Municipio } from '../../core/services/integracoes/ibge.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { FiscalDataService, BuscaFiscalResultDTO } from '../../core/services/fiscal-data.service';
import { PosicaoFiscalService, PosicaoFiscal } from '../../core/services/posicao-fiscal.service';
import { finalize } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
    selector: 'app-cliente-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        NgxMaskDirective,
        MatTabsModule
    ],
    templateUrl: './cliente-form.component.html'
})
export class ClienteFormComponent implements OnInit {
    private formBuilder = inject(FormBuilder);
    private clienteService = inject(ClienteService);
    private consultaService = inject(ConsultaService);
    private ibgeService = inject(IbgeService);
    private notification = inject(NotificationService);
    private loadingService = inject(LoadingService);
    private fiscalDataService = inject(FiscalDataService);
    private posicaoFiscalService = inject(PosicaoFiscalService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    isEditMode = signal(false);
    clienteId: string | null = null;

    estados = signal<Estado[]>([]);
    posicoesFiscais = signal<PosicaoFiscal[]>([]);
    condicoesPagamento = signal<BuscaFiscalResultDTO[]>([]);
    todasCidades: { [uf: string]: Municipio[] } = {};

    clienteForm: FormGroup = this.formBuilder.group({
        tipoPessoa: [1, Validators.required],
        name: ['', Validators.required],
        lastName: ['', Validators.required],
        razaoSocial: [''],
        cpf: [''],
        rg: [''],
        telefone: [''],
        celular: [''],
        inscEString: [''],
        indIe: [9],
        inscMunicipal: [''],
        posicaoFiscalId: [null],
        reterIss: [false],
        codPagto: [null],
        notaInterna: [''],
        emails: this.formBuilder.array([]),
        enderecos: this.formBuilder.array([])
    });

    get emails() { return this.clienteForm.get('emails') as FormArray; }
    get enderecos() { return this.clienteForm.get('enderecos') as FormArray; }

    ngOnInit() {
        this.carregarEstados();
        this.carregarDadosFiscais();

        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.isEditMode.set(true);
                this.clienteId = id;
                this.carregarCliente(id);
            }
        });

        // Handle Document Mask and dynamic validations
        this.clienteForm.get('tipoPessoa')?.valueChanges.subscribe(tipo => {
            this.clienteForm.get('cpf')?.setValue('');
            const nomeCtrl = this.clienteForm.get('name');
            const lastNameCtrl = this.clienteForm.get('lastName');
            const razaoSocialCtrl = this.clienteForm.get('razaoSocial');
            const cpfCtrl = this.clienteForm.get('cpf');

            if (tipo === 1) { // Pessoa Física
                nomeCtrl?.setValidators([Validators.required]);
                lastNameCtrl?.setValidators([Validators.required]);
                razaoSocialCtrl?.clearValidators();
            } else { // Pessoa Jurídica
                razaoSocialCtrl?.setValidators([Validators.required]);
                nomeCtrl?.clearValidators();
                lastNameCtrl?.clearValidators();
            }

            // CPF/CNPJ é sempre obrigatório para emissão de Nota
            cpfCtrl?.setValidators([Validators.required]);

            nomeCtrl?.updateValueAndValidity();
            lastNameCtrl?.updateValueAndValidity();
            razaoSocialCtrl?.updateValueAndValidity();
            cpfCtrl?.updateValueAndValidity();
        });

        // Trigger inicial para setar as validações na inicialização do form
        this.clienteForm.get('tipoPessoa')?.setValue(this.clienteForm.get('tipoPessoa')?.value);
    }

    get docMask(): string {
        return this.clienteForm.get('tipoPessoa')?.value === 2 ? '00.000.000/0000-00' : '000.000.000-00';
    }

    carregarCliente(id: string): void {
        this.loadingService.show();
        this.clienteService.findById(id).pipe(
            finalize(() => this.loadingService.hide())
        ).subscribe({
            next: (cliente) => {
                // Clear empty arrays first
                while (this.emails.length !== 0) { this.emails.removeAt(0); }
                while (this.enderecos.length !== 0) { this.enderecos.removeAt(0); }

                this.clienteForm.patchValue({
                    tipoPessoa: cliente.tipoPessoa || 1,
                    name: cliente.name,
                    lastName: cliente.lastName,
                    razaoSocial: cliente.razaoSocial,
                    cpf: cliente.cpf,
                    rg: cliente.rg,
                    telefone: cliente.telefone,
                    celular: cliente.celular,
                    inscEString: cliente.inscEString,
                    indIe: cliente.indIe,
                    inscMunicipal: cliente.inscMunicipal,
                    posicaoFiscalId: cliente.posicaoFiscalId,
                    reterIss: cliente.reterIss,
                    codPagto: cliente.codPagto,
                    notaInterna: cliente.notaInterna
                });

                cliente.emails?.forEach(e => this.adicionarEmail(e));

                cliente.enderecos?.forEach(e => {
                    this.adicionarEndereco(e);
                    if (e.estado) this.processarUfParaMunicipios(e.estado);
                });

            },
            error: () => {
                this.notification.error('Erro ao buscar Cliente');
                this.voltar();
            }
        });
    }

    salvarCliente(): void {
        if (this.clienteForm.invalid) {
            this.notification.warning('Preencha os campos obrigatórios.');
            return;
        }

        this.loadingService.show();
        const data = this.clienteForm.value;

        const request$ = this.isEditMode() && this.clienteId
            ? this.clienteService.update(this.clienteId, data)
            : this.clienteService.insert(data);

        request$.pipe(
            finalize(() => this.loadingService.hide())
        ).subscribe({
            next: () => {
                this.notification.success(`Cliente ${this.isEditMode() ? 'atualizado' : 'cadastrado'}!`);
                this.voltar();
            },
            error: () => this.notification.error('Falha ao salvar o cliente.')
        });
    }

    voltar(): void {
        this.router.navigate(['/clientes']);
    }

    // EMAILS
    criarEmailGroup(emailData?: EmailCliente): FormGroup {
        return this.formBuilder.group({
            email: [emailData?.email || '', Validators.email],
            principal: [emailData?.principal || false]
        });
    }

    adicionarEmail(emailData?: EmailCliente): void {
        this.emails.push(this.criarEmailGroup(emailData));
    }

    removerEmail(index: number): void {
        if (this.emails.length > 1) {
            this.emails.removeAt(index);
        }
    }

    setPrincipalEmail(index: number): void {
        this.emails.controls.forEach((ctrl, i) => {
            ctrl.get('principal')?.setValue(i === index);
        });
    }

    // ENDEREÇOS
    criarEnderecoGroup(endData?: EnderecoCliente): FormGroup {
        return this.formBuilder.group({
            cep: [endData?.cep || ''],
            logradouro: [endData?.logradouro || ''],
            numero: [endData?.numero || ''],
            complemento: [endData?.complemento || ''],
            bairro: [endData?.bairro || ''],
            estado: [endData?.estado || ''],
            cidade: [endData?.cidade || ''],
            principal: [endData?.principal || false]
        });
    }

    adicionarEndereco(endData?: EnderecoCliente): void {
        this.enderecos.push(this.criarEnderecoGroup(endData));
    }

    removerEndereco(index: number): void {
        if (this.enderecos.length > 1) {
            this.enderecos.removeAt(index);
        }
    }

    setPrincipalEndereco(index: number): void {
        this.enderecos.controls.forEach((ctrl, i) => {
            ctrl.get('principal')?.setValue(i === index);
        });
    }

    carregarEstados(): void {
        this.ibgeService.getEstados().subscribe(estados => {
            this.estados.set(estados);
        });
    }

    carregarDadosFiscais(): void {
        this.posicaoFiscalService.findAll().subscribe(data => this.posicoesFiscais.set(data));
        this.fiscalDataService.getCondicoesPagamento().subscribe(data => this.condicoesPagamento.set(data));
    }

    processarUfParaMunicipios(siglaUf: string): void {
        const estado = this.estados().find(e => e.sigla === siglaUf);
        if (estado && !this.todasCidades[siglaUf]) {
            this.ibgeService.getMunicipiosPorEstado(estado.id).subscribe(m => {
                this.todasCidades[siglaUf] = m;
            });
        }
    }

    onUfChange(index: number): void {
        const sigla = this.enderecos.at(index).get('estado')?.value;
        if (sigla) {
            this.enderecos.at(index).get('cidade')?.setValue('');
            this.processarUfParaMunicipios(sigla);
        }
    }

    getCidadesForEndereco(index: number): Municipio[] {
        const sigla = this.enderecos.at(index).get('estado')?.value;
        return sigla ? (this.todasCidades[sigla] || []) : [];
    }

    buscarCnpjOuCpf(): void {
        const doc = this.clienteForm.get('cpf')?.value;
        const tipo = this.clienteForm.get('tipoPessoa')?.value;

        if (!doc) return;

        if (tipo === 2 && doc.length >= 14) {
            this.loadingService.show();
            this.consultaService.consultarCnpj(doc).pipe(
                finalize(() => this.loadingService.hide())
            ).subscribe({
                next: (dados) => {
                    this.clienteForm.patchValue({
                        name: dados.nomeFantasia || dados.razaoSocial,
                        razaoSocial: dados.razaoSocial,
                        telefone: dados.telefone
                    });

                    if (dados.email && this.emails.length > 0) {
                        this.emails.at(0).get('email')?.setValue(dados.email);
                        this.emails.at(0).get('principal')?.setValue(true);
                    }

                    if (dados.cep && this.enderecos.length > 0) {
                        const cleanedCep = dados.cep.replace(/\D/g, '');
                        this.enderecos.at(0).patchValue({
                            cep: cleanedCep,
                            logradouro: dados.logradouro,
                            numero: dados.numero,
                            bairro: dados.bairro,
                            estado: dados.uf,
                            cidade: dados.municipio,
                            principal: true
                        });
                        if (dados.uf) this.processarUfParaMunicipios(dados.uf);
                    }
                    this.notification.success('Dados preenchidos com sucesso!');
                },
                error: (err) => this.notification.error('Erro ao consultar CNPJ')
            });
        }
    }

    buscarCepDetalhes(index: number): void {
        const cep = this.enderecos.at(index).get('cep')?.value;
        if (!cep || cep.length < 8) return;

        this.loadingService.show();
        this.consultaService.consultarCep(cep).pipe(
            finalize(() => this.loadingService.hide())
        ).subscribe({
            next: (dados) => {
                this.enderecos.at(index).patchValue({
                    logradouro: dados.logradouro || '',
                    bairro: dados.bairro || '',
                    cidade: dados.localidade || '',
                    estado: dados.uf || ''
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
