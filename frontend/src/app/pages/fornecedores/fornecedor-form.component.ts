import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputMaskModule } from 'primeng/inputmask';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { FornecedorService, Fornecedor } from '../../core/services/cadastros/fornecedor.service';
import { ConsultaService } from '../../core/services/integracoes/consulta.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { IbgeService, Estado, Municipio } from '../../core/services/integracoes/ibge.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-fornecedor-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    InputMaskModule
  ],
  template: `
    <div class="p-6 md:p-8 font-sans bg-slate-50 min-h-screen">
      <header class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
            {{ isEditMode() ? 'Editar Fornecedor' : 'Criar Fornecedor' }}
          </h1>
          <p class="text-slate-500 font-medium">
            {{ isEditMode() ? 'Atualize as informações do seu fornecedor' : 'Preencha os dados do novo parceiro' }}
          </p>
        </div>
        <button mat-stroked-button color="primary" class="!rounded-xl !h-12 !px-6" (click)="voltar()">
          <mat-icon class="mr-2">arrow_back</mat-icon> Voltar
        </button>
      </header>

      <mat-card class="!rounded-2xl !border-0 !shadow-sm overflow-hidden mb-8 max-w-5xl mx-auto">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 class="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
            <mat-icon [class]="isEditMode() ? \'text-amber-500 text-[18px]\' : \'text-indigo-500 text-[18px]\'">
              {{ isEditMode() ? 'domain' : 'domain_add' }}
            </mat-icon>
            Dados Cadastrais
          </h2>
        </div>
        <div class="p-6 bg-white">
          <form [formGroup]="fornecedorForm" (ngSubmit)="salvarFornecedor()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div class="mb-2.5">
                <label class="field-label">Razão Social</label>
                <input type="text" formControlName="razaoSocial" class="field-input" placeholder="Nome empresarial oficial">
                <div *ngIf="fornecedorForm.get('razaoSocial')?.invalid && fornecedorForm.get('razaoSocial')?.touched" class="field-error">
                  Campo obrigatório
                </div>
              </div>

              <div class="mb-2.5">
                <label class="field-label">Nome Fantasia</label>
                <input type="text" formControlName="nomeFantasia" class="field-input" placeholder="Nome popular ou marca">
                <div *ngIf="fornecedorForm.get('nomeFantasia')?.invalid && fornecedorForm.get('nomeFantasia')?.touched" class="field-error">
                  Campo obrigatório
                </div>
              </div>

              <div class="mb-2.5 md:col-span-2">
                <label class="field-label">CNPJ</label>
                <div class="w-full md:w-1/2">
                  <div class="flex gap-2 items-center">
                    <div class="flex-1">
                      <p-inputMask formControlName="cnpj" mask="99.999.999/9999-99" unmask="true" styleClass="field-input" placeholder="00.000.000/0000-00"></p-inputMask>
                    </div>
                    <button type="button" class="bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 outline-none transition-all shrink-0 w-10" (click)="buscarCnpj()">
                      <mat-icon>search</mat-icon>
                    </button>
                  </div>
                  <div *ngIf="fornecedorForm.get('cnpj')?.invalid && fornecedorForm.get('cnpj')?.touched" class="field-error">
                    Insira um CNPJ válido
                  </div>
                </div>
              </div>

              <div class="mb-2.5">
                <label class="field-label">Inscrição Estadual</label>
                <input type="text" formControlName="inscricaoEstadual" class="field-input" placeholder="Inscrição Estadual">
              </div>

              <div class="mb-2.5">
                <label class="field-label">Telefone</label>
                <p-inputMask formControlName="telefone" mask="(99) 99999-9999" unmask="true" placeholder="(00) 00000-0000" styleClass="field-input"></p-inputMask>
              </div>

              <div class="mb-2.5 md:col-span-2">
                <label class="field-label">E-mail</label>
                <input type="email" formControlName="email" class="field-input" placeholder="email@empresa.com">
                <div *ngIf="fornecedorForm.get('email')?.invalid && fornecedorForm.get('email')?.touched" class="field-error">E-mail inválido</div>
              </div>

              <div class="mb-2.5">
                <label class="field-label">CEP</label>
                <div class="flex gap-2 items-center">
                  <div class="flex-1">
                    <p-inputMask formControlName="cep" mask="99999-999" unmask="true" placeholder="00000-000" styleClass="field-input"></p-inputMask>
                  </div>
                  <button type="button" class="bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 outline-none transition-all shrink-0 w-10" (click)="buscarCep()">
                    <mat-icon>search</mat-icon>
                  </button>
                </div>
              </div>

              <div class="mb-2.5">
                <label class="field-label">Endereço</label>
                <input type="text" formControlName="endereco" class="field-input" placeholder="Endereço">
              </div>

              <div class="mb-2.5">
                <label class="field-label">Número</label>
                <input type="text" formControlName="numero" class="field-input" placeholder="Número">
              </div>

              <div class="mb-2.5">
                <label class="field-label">Complemento</label>
                <input type="text" formControlName="complemento" class="field-input" placeholder="Complemento">
              </div>

              <div class="mb-2.5">
                <label class="field-label">Bairro</label>
                <input type="text" formControlName="bairro" class="field-input" placeholder="Bairro">
              </div>

              <div class="mb-2.5">
                <label class="field-label">UF</label>
                <select formControlName="uf" (change)="onUfChange()" class="field-input">
                  <option value="">Selecione o Estado</option>
                  <option *ngFor="let estado of estados()" [value]="estado.sigla">{{ estado.nome }} ({{ estado.sigla }})</option>
                </select>
              </div>
              
              <div class="mb-2.5">
                <label class="field-label">Cidade</label>
                <select formControlName="cidade" (change)="onCidadeChange()" class="field-input" [attr.disabled]="municipios().length === 0 ? true : null">
                  <option value="">Selecione a Cidade</option>
                  <option *ngFor="let municipio of municipios()" [value]="municipio.nome">{{ municipio.nome }}</option>
                </select>
              </div>

            </div>
            
            <div *ngIf="isEditMode() && fornecedorAtualInfo" class="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between text-sm text-slate-500">
              <div class="flex items-center gap-2 mb-2 md:mb-0">
                <mat-icon class="text-slate-400 text-sm h-4 w-4 leading-none">history</mat-icon>
                <span><b>Criado em:</b> {{ formatDate(fornecedorAtualInfo.criadoEm) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <mat-icon class="text-slate-400 text-sm h-4 w-4 leading-none">edit_calendar</mat-icon>
                <span><b>Atualizado em:</b> {{ formatDate(fornecedorAtualInfo.atualizadoEm) }}</span>
              </div>
            </div>
            
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" mat-stroked-button class="!rounded-lg" (click)="voltar()">Cancelar</button>
              <button type="submit" mat-flat-button color="primary" class="!rounded-lg !bg-indigo-600" [disabled]="fornecedorForm.invalid">
                <mat-icon class="mr-1">save</mat-icon> Salvar Configurações
              </button>
            </div>
          </form>
        </div>
      </mat-card>
    </div>
  `
})
export class FornecedorFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private fornecedorService = inject(FornecedorService);
  private consultaService = inject(ConsultaService);
  private ibgeService = inject(IbgeService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  fornecedorId: string | null = null;
  fornecedorAtualInfo: { criadoEm?: string, atualizadoEm?: string } | null = null;
  estados = signal<Estado[]>([]);
  municipios = signal<Municipio[]>([]);

  fornecedorForm: FormGroup = this.formBuilder.group({
    razaoSocial: ['', [Validators.required]],
    nomeFantasia: ['', [Validators.required]],
    cnpj: ['', [Validators.required, Validators.pattern(/^[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}\-?[0-9]{2}$/)]],
    inscricaoEstadual: [''],
    telefone: [''],
    email: ['', [Validators.email]],
    cep: [''],
    endereco: [''],
    numero: [''],
    complemento: [''],
    bairro: [''],
    cidade: [''],
    uf: [''],
    codigoIbgeUf: [''],
    codigoIbgeCidade: ['']
  });

  ngOnInit() {
    this.carregarEstados();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.fornecedorId = id;
        this.carregarFornecedor(id);
      }
    });
  }

  carregarFornecedor(id: string): void {
    this.loadingService.show();
    this.fornecedorService.findById(id).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (fornecedor) => {
        this.fornecedorAtualInfo = {
          criadoEm: fornecedor.criadoEm,
          atualizadoEm: fornecedor.atualizadoEm
        };
        this.fornecedorForm.patchValue({
          razaoSocial: fornecedor.razaoSocial,
          nomeFantasia: fornecedor.nomeFantasia,
          cnpj: fornecedor.cnpj,
          inscricaoEstadual: fornecedor.inscricaoEstadual,
          telefone: fornecedor.telefone,
          email: fornecedor.email,
          cep: fornecedor.cep,
          endereco: fornecedor.endereco,
          numero: fornecedor.numero,
          complemento: fornecedor.complemento,
          bairro: fornecedor.bairro,
          cidade: fornecedor.cidade,
          uf: fornecedor.uf,
          codigoIbgeUf: fornecedor.codigoIbgeUf,
          codigoIbgeCidade: fornecedor.codigoIbgeCidade
        });

        if (fornecedor.uf) {
          this.processarUfParaMunicipios(fornecedor.uf, fornecedor.cidade);
        }
      },
      error: () => {
        this.notification.error('Erro ao buscar o Fornecedor. Acesso negado?');
        this.voltar();
      }
    });
  }

  salvarFornecedor(): void {
    if (this.fornecedorForm.invalid) return;

    this.loadingService.show();
    const data = this.fornecedorForm.value;

    const request$ = this.isEditMode() && this.fornecedorId
      ? this.fornecedorService.update(this.fornecedorId, data)
      : this.fornecedorService.insert(data);

    request$.pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: () => {
        this.notification.success(`Fornecedor ${this.isEditMode() ? 'atualizado' : 'cadastrado'}!`);
        this.voltar();
      },
      error: () => this.notification.error(`Ocorreu um erro ao ${this.isEditMode() ? 'atualizar' : 'cadastrar'} seu parceiro.`)
    });
  }

  voltar(): void {
    this.router.navigate(['/fornecedores']);
  }

  buscarCnpj(): void {
    const cnpj = this.fornecedorForm.get('cnpj')?.value;
    if (!cnpj || cnpj.length < 14) {
      this.notification.warning('Digite um CNPJ válido para buscar.');
      return;
    }
    this.loadingService.show();
    this.consultaService.consultarCnpj(cnpj).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (dados) => {
        this.fornecedorForm.patchValue({
          razaoSocial: dados.razaoSocial || '',
          nomeFantasia: dados.nomeFantasia || '',
          cep: dados.cep ? dados.cep.replace(/\D/g, '') : '',
          logradouro: dados.logradouro || '',
          numero: dados.numero || '',
          complemento: dados.complemento || '',
          bairro: dados.bairro || '',
          cidade: dados.municipio || '',
          uf: dados.uf || '',
          telefone: dados.telefone || '',
          email: dados.email || ''
        });
        if (dados.uf) {
          this.processarUfParaMunicipios(dados.uf, dados.municipio);
        }
        this.notification.success('Dados do CNPJ preenchidos com sucesso!');
      },
      error: (err) => {
        this.notification.error(err.error?.erro || 'Erro ao consultar CNPJ');
      }
    });
  }

  buscarCep(): void {
    const cep = this.fornecedorForm.get('cep')?.value;
    if (!cep || cep.length < 8) {
      this.notification.warning('Digite um CEP válido para buscar.');
      return;
    }
    this.loadingService.show();
    this.consultaService.consultarCep(cep).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (dados) => {
        this.fornecedorForm.patchValue({
          endereco: dados.logradouro || '',
          bairro: dados.bairro || '',
          cidade: dados.localidade || '',
          uf: dados.uf || ''
        });

        if (dados.uf) {
          this.processarUfParaMunicipios(dados.uf, dados.localidade);
        }

        if (dados.ibge) {
          this.fornecedorForm.patchValue({
            codigoIbgeCidade: dados.ibge,
            codigoIbgeUf: dados.ibge.substring(0, 2)
          });
        }
        this.notification.success('Endereço preenchido com sucesso!');
      },
      error: (err) => {
        this.notification.error(err.error?.erro || 'Erro ao consultar CEP');
      }
    });
  }

  carregarEstados(): void {
    this.ibgeService.getEstados().subscribe(estados => {
      this.estados.set(estados);
    });
  }

  processarUfParaMunicipios(siglaUf: string, cidadeAlvo?: string): void {
    const estado = this.estados().find(e => e.sigla === siglaUf);
    if (estado) {
      this.fornecedorForm.patchValue({ codigoIbgeUf: estado.id.toString() });
      this.ibgeService.getMunicipiosPorEstado(estado.id).subscribe(m => {
        this.municipios.set(m);
        if (cidadeAlvo) {
          const municipio = m.find(mun => mun.nome.toUpperCase() === cidadeAlvo.toUpperCase());
          if (municipio) {
            this.fornecedorForm.patchValue({
              cidade: municipio.nome,
              codigoIbgeCidade: municipio.id.toString()
            });
          }
        }
      });
    }
  }

  onUfChange(): void {
    const sigla = this.fornecedorForm.get('uf')?.value;
    if (!sigla) {
      this.municipios.set([]);
      this.fornecedorForm.patchValue({ cidade: '', codigoIbgeUf: '', codigoIbgeCidade: '' });
      return;
    }
    this.processarUfParaMunicipios(sigla);
  }

  onCidadeChange(): void {
    const cidade = this.fornecedorForm.get('cidade')?.value;
    const municipio = this.municipios().find(m => m.nome === cidade);
    if (municipio) {
      this.fornecedorForm.patchValue({ codigoIbgeCidade: municipio.id.toString() });
    } else {
      this.fornecedorForm.patchValue({ codigoIbgeCidade: '' });
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  }
}
