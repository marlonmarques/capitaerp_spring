import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { AutoComplete, AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

import { InputTextarea } from 'primeng/inputtextarea';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NfeService, NotaFiscalProduto, StatusNFe } from '../../../core/services/nfe.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { FilialService } from '../../../core/services/filial.service';
import { ClienteService } from '../../../core/services/cadastros/cliente.service';
import { ProdutoService, Produto } from '../../../core/services/produto.service';
import { AuthService } from '../../../core/services/auth.service';
import { PosicaoFiscalService, PosicaoFiscal } from '../../../core/services/posicao-fiscal.service';
import { ConfiguracaoNfeService } from '../../../core/services/configuracoes/configuracao-nfe.service';
import { ConfiguracaoNfceService } from '../../../core/services/configuracoes/configuracao-nfce.service';
import { FornecedorService, Fornecedor } from '../../../core/services/cadastros/fornecedor.service';
import { AuthModalComponent } from '../../../shared/components/auth-modal/auth-modal.component';
import { ViewChild } from '@angular/core';
import { NfeEmissaoStatusComponent } from '../nfe-emissao-status.component';

@Component({
  selector: 'app-nfe-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    AutoCompleteModule,
    TableModule,
    TabViewModule,
    InputTextarea,
    PageHeaderComponent,
    NfeEmissaoStatusComponent,
    ConfirmDialogModule,
    ToastModule,
    AuthModalComponent
  ],
  providers: [],
  templateUrl: './nfe-form.component.html',
  styleUrls: ['./nfe-form.component.scss']
})
export class NfeFormComponent implements OnInit {
  activeTabIndex = 0;

  private configuracaoNfeService = inject(ConfiguracaoNfeService);
  private configuracaoNfceService = inject(ConfiguracaoNfceService);
  private fornecedorService = inject(FornecedorService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private nfeService = inject(NfeService);
  private filialService = inject(FilialService);
  private clienteService = inject(ClienteService);
  private produtoService = inject(ProdutoService);
  private messageService = inject(MessageService);
  private posicaoFiscalService = inject(PosicaoFiscalService);
  private confirmationService = inject(ConfirmationService);

  @ViewChild('prodSearch') prodSearch!: AutoComplete;
  @ViewChild(AuthModalComponent) authModal!: AuthModalComponent;

  descontoAutorizado = false;
  precoAutorizado = false;

  form: FormGroup;
  isEdit = false;
  isReadOnly = false;
  loading = false;
  statusNota: StatusNFe = StatusNFe.RASCUNHO;
  mensagemRetorno = '';

  filiais: any[] = [];
  posicoesFiscais: PosicaoFiscal[] = [];
  filteredClientes: any[] = [];
  filteredProdutos: any[] = [];
  filteredTransportadoras: any[] = [];

  // Controle de Emissão (Real-time SSE)
  showEmissaoStatus = false;
  nfeIdParaEmissao = '';
  nomeClienteParaEmissao = '';
  numeroNotaParaEmissao: number | undefined;
  @ViewChild(NfeEmissaoStatusComponent) statusPanel?: NfeEmissaoStatusComponent;

  modelos = [
    { label: '55 - NFe (Produtos)', value: '55' },
    { label: '65 - NFCe (Consumidor)', value: '65' }
  ];

  finalidades = [
    { label: 'Normal', value: 'NORMAL' },
    { label: 'Complementar', value: 'COMPLEMENTAR' },
    { label: 'Ajuste', value: 'AJUSTE' },
    { label: 'Devolução / Retorno', value: 'DEVOLUCAO_RETORNO' }
  ];

  freteModos = [
    { label: '0-Contratação por conta do Remetente (CIF)', value: '0' },
    { label: '1-Contratação por conta do Destinatário (FOB)', value: '1' },
    { label: '2-Contratação por conta de Terceiros', value: '2' },
    { label: '3-Próprio por conta do Remetente', value: '3' },
    { label: '4-Próprio por conta do Destinatário', value: '4' },
    { label: '9-Sem Ocorrência de Transporte', value: '9' }
  ];

  naturezasOperacao = []; // Deprecated - using PosicaoFiscal

  constructor() {
    this.form = this.fb.group({
      id: [null],
      filialId: [null, Validators.required],
      modelo: ['55', Validators.required],
      serie: ['1', Validators.required],
      numero: [{ value: 0, disabled: true }],
      naturezaOperacao: ['VENDA DE MERCADORIA', Validators.required],
      posicaoFiscalId: [null],
      cliente: [null, Validators.required], // Objeto do cliente
      dataEmissao: [new Date(), Validators.required],
      dataSaidaEntrada: [new Date()],
      ambiente: ['HOMOLOGACAO'],
      finalidade: ['NORMAL', Validators.required],
      chaveReferenciada: [''],

      // Transporte
      modFrete: ['9', Validators.required], // 9: Sem frete
      transportadoraNome: [''],
      transportadoraCnpjCpf: [''],
      placaVeiculo: [''],
      placaUf: [''],
      quantidadeVolumes: [0],
      especieVolumes: [''],
      pesoBrutoTotal: [0],
      pesoLiquidoTotal: [0],

      informacoesFisco: [''],
      informacoesComplementares: [''],

      // Totais
      valorTotalNota: [0],
      valorTotalProdutos: [0],
      valorFrete: [0],
      valorSeguro: [0],
      valorDesconto: [{ value: 0, disabled: true }],
      valorOutros: [0],
      valorBaseCalculoIcms: [0],
      valorIcms: [0],

      itens: this.fb.array([]),
      pagamentos: this.fb.array([])
    });
  }

  // Helper para criar um item do FormArray
  private createItemForm(data: any = {}): FormGroup {
    return this.fb.group({
      id: [data.id || null],
      produto: [data.produto || null],
      variacaoId: [data.variacaoId || null],
      codigoProduto: [data.codigoProduto || ''],
      descricao: [data.descricao || '', Validators.required],
      ncm: [data.ncm || ''],
      cfop: [data.cfop || ''],
      unidadeComercial: [data.unidadeComercial || 'UN'],
      quantidadeComercial: [data.quantidadeComercial || 1, [Validators.required, Validators.min(0.001)]],
      valorUnitarioComercial: [
        { value: data.valorUnitarioComercial || 0, disabled: !this.precoAutorizado && !this.isReadOnly },
        [Validators.required, Validators.min(0)]
      ],
      valorBruto: [data.valorBruto || 0],
      valorDesconto: [data.valorDesconto || 0],
      valorLiquido: [data.valorLiquido || 0],
      icmsCst: [data.icmsCst || '102'],
      icmsAliquota: [data.icmsAliquota || 0],
      icmsValor: [data.icmsValor || 0],
      pisCst: [data.pisCst || '01'],
      pisAliquota: [data.pisAliquota || 0],
      cofinsCst: [data.cofinsCst || '01'],
      cofinsAliquota: [data.cofinsAliquota || 0],
      origem: [data.origem || 0]
    });
  }

  tentarMudarTab(event: { index: number }): void {
    const novoIndex = event.index;

    // Permite voltar sem validar
    if (novoIndex <= this.activeTabIndex) {
      this.activeTabIndex = novoIndex;
      return;
    }

    const erros = this.validarTab(this.activeTabIndex);

    if (erros.length > 0) {
      erros.forEach(msg => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Campo obrigatório',
          detail: msg,
          life: 4000
        });
      });

      // Reverter: PrimeNG já trocou visualmente, precisamos forçar volta
      const indexAtual = this.activeTabIndex;
      this.activeTabIndex = -1;
      setTimeout(() => this.activeTabIndex = indexAtual, 0);
      return;
    }

    this.activeTabIndex = novoIndex;
  }

  private validarTab(index: number): string[] {
    // 👇 REMOVER o alert('dddddd') que estava aqui
    const erros: string[] = [];

    if (index === 0) {
      if (!this.form.get('filialId')?.value)
        erros.push('Selecione a Filial Emitente.');
      if (!this.form.get('posicaoFiscalId')?.value)
        erros.push('Selecione a Operação Fiscal (Natureza).');
      if (!this.form.get('finalidade')?.value)
        erros.push('Selecione a Finalidade da Emissão.');
      if (!this.form.get('dataEmissao')?.value)
        erros.push('Informe a Data de Emissão.');
      if (!this.form.get('cliente')?.value)
        erros.push('Selecione o Cliente / Destinatário.');
      const finalidade = this.form.get('finalidade')?.value;
      if (finalidade !== 'NORMAL' && !this.form.get('chaveReferenciada')?.value)
        erros.push('Informe a Chave NF-e Referenciada para notas de devolução/ajuste/complementar.');
    }

    if (index === 1) {
      if (this.itens.length === 0)
        erros.push('Adicione pelo menos um produto à nota.');
    }

    if (index === 3) {
      if (this.pagamentos.length === 0)
        erros.push('Informe pelo menos uma forma de pagamento.');
      if (this.getDiferencaPagamentos() > 0.01)
        erros.push(`Soma das parcelas (${this.getSomaPagamentos().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) não confere com o total da nota.`);
    }

    return erros;
  }


  get itens() {
    return this.form.get('itens') as FormArray;
  }

  ngOnInit(): void {
    this.carregarFiliais();
    this.carregarPosicoesFiscais();
    this.carregarConfiguracao();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.carregarNota(id);
    }

    // Escuta mudanças nos campos do header para ratear nos itens
    this.form.get('valorFrete')?.valueChanges.subscribe(() => this.calcularTotais());
    this.form.get('valorSeguro')?.valueChanges.subscribe(() => this.calcularTotais());
    this.form.get('valorOutros')?.valueChanges.subscribe(() => this.calcularTotais());
    this.form.get('valorDesconto')?.valueChanges.subscribe(() => this.calcularTotais());

    // Escuta mudança de modelo para carregar série/número padrão
    this.form.get('modelo')?.valueChanges.subscribe(val => {
      if (!this.isEdit) {
        this.carregarConfiguracao(val);
      }
    });
  }

  carregarConfiguracao(modelo: string = '55'): void {
    if (modelo === '55') {
      this.configuracaoNfeService.getConfiguracao().subscribe(config => {
        if (!this.isEdit) {
          this.form.patchValue({
            serie: config.serie || '1',
            numero: (config.numeroNfe || 0) + 1,
            ambiente: config.ambiente || 'HOMOLOGACAO',
            posicaoFiscalId: config.naturezaOperacaoPadrao
          }, { emitEvent: false });

          if (config.naturezaOperacaoPadrao) {
            this.onPosicaoFiscalChange({ value: config.naturezaOperacaoPadrao });
          }
        }
      });
    } else {
      this.configuracaoNfceService.getConfiguracao().subscribe(config => {
        if (!this.isEdit) {
          this.form.patchValue({
            serie: config.serie || '1',
            numero: (config.numeroNfce || 0) + 1,
            ambiente: config.ambiente || 'HOMOLOGACAO'
          }, { emitEvent: false });
        }
      });
    }
  }

  getSomaPagamentos(): number {
    const pags = this.pagamentos.getRawValue();
    return pags.reduce((acc: number, curr: any) => acc + (curr.valorPagamento || 0), 0);
  }

  carregarFiliais(): void {
    this.filialService.listarTodas().subscribe(res => {
      this.filiais = res;
      if (!this.isEdit) {
        // Tenta pegar a filial do usuário logado
        this.authService.currentUser$.subscribe(user => {
          if (user && user.filialId) {
            this.form.patchValue({ filialId: user.filialId });
          } else if (res.length > 0 && !this.form.get('filialId')?.value) {
            this.form.patchValue({ filialId: res[0].id });
          }
        });
      }
    });
  }

  carregarPosicoesFiscais(): void {
    this.posicaoFiscalService.findAll().subscribe(res => {
      this.posicoesFiscais = res;
    });
  }

  onPosicaoFiscalChange(event: any): void {
    const pf = this.posicoesFiscais.find(p => p.id === event.value);
    if (pf) {
      this.form.patchValue({
        naturezaOperacao: pf.nome,
        finalidade: pf.finalidade
      });
    }
  }

  get pagamentos() {
    return this.form.get('pagamentos') as FormArray;
  }

  adicionarPagamento(): void {
    const total = this.form.get('valorTotalNota')?.value || 0;
    const qtdAtual = this.pagamentos.length;

    // Próximo vencimento: último vencimento + 30 dias (ou hoje + 30 se for o primeiro)
    let proximoVencimento = new Date();
    if (qtdAtual > 0) {
      const ultimoVenc = this.pagamentos.at(qtdAtual - 1).get('dataVencimento')?.value;
      proximoVencimento = ultimoVenc ? new Date(ultimoVenc) : new Date();
    }
    proximoVencimento.setDate(proximoVencimento.getDate() + 30);

    this.pagamentos.push(this.fb.group({
      dataVencimento: [proximoVencimento, Validators.required],
      valorPagamento: [0, [Validators.required, Validators.min(0.01)]],
      tipoPagamento: ['01', Validators.required],
      tBand: [''],
      cAut: ['']
    }));

    // Redistribuir valores entre todas as parcelas
    this.redistribuirPagamentos();
  }

  removerPagamento(index: number): void {
    this.pagamentos.removeAt(index);
    // Redistribuir valores entre as parcelas restantes
    this.redistribuirPagamentos();
  }

  getDiferencaPagamentos(): number {
    const totalNota = this.form.get('valorTotalNota')?.value || 0;
    const totalPago = this.getSomaPagamentos();
    return Math.abs(Number((totalNota - totalPago).toFixed(2)));
  }

  gerarParcelas(qtd: number): void {
    while (this.pagamentos.length) this.pagamentos.removeAt(0);

    const total = this.form.get('valorTotalNota')?.value || 0;
    if (total <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'O valor total da nota é zero.' });
      return;
    }

    const valorBase = Number((total / qtd).toFixed(2));
    const soma = Number((valorBase * qtd).toFixed(2));
    const sobra = Number((total - soma).toFixed(2));

    const hoje = new Date();

    for (let i = 0; i < qtd; i++) {
      // 1ª parcela = hoje + 30 dias, 2ª = hoje + 60, etc.
      const vencimento = new Date(hoje);
      vencimento.setDate(vencimento.getDate() + (i + 1) * 30);

      // Sobra de arredondamento fica na PRIMEIRA parcela
      const valor = i === 0
        ? Number((valorBase + sobra).toFixed(2))
        : valorBase;

      this.pagamentos.push(this.fb.group({
        dataVencimento: [vencimento, Validators.required],
        valorPagamento: [valor, [Validators.required, Validators.min(0.01)]],
        tipoPagamento: ['15', Validators.required], // 15: Boleto
        tBand: [''],
        cAut: ['']
      }));
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Parcelas Geradas',
      detail: `${qtd} parcelas criadas. Total: R$ ${total.toFixed(2)}`
    });
  }

  searchClientes(event: any): void {
    this.clienteService.findAllPaged(0, 10, event.query).subscribe(res => {
      this.filteredClientes = res.content.map(c => ({
        ...c,
        displayName: (c.razaoSocial && c.razaoSocial.trim())
          ? c.razaoSocial
          : ((c.name || '') + ' ' + (c.lastName || '')).trim() || 'Sem Nome'
      }));
    });
  }

  onSelectCliente(cliente: any): void {
    if (cliente && cliente.posicaoFiscalId) {
      this.form.patchValue({ posicaoFiscalId: cliente.posicaoFiscalId });
      this.onPosicaoFiscalChange({ value: cliente.posicaoFiscalId });
    }
  }

  searchTransportadoras(event: any): void {
    this.fornecedorService.findAllPaged(0, 10).subscribe(res => {
      // Filtro simples no front para acelerar (ideal seria filtro no back)
      this.filteredTransportadoras = res.content.filter(f =>
        f.razaoSocial.toLowerCase().includes(event.query.toLowerCase()) ||
        f.cnpj.includes(event.query)
      );
    });
  }

  onSelectTransportadora(transportadora: Fornecedor): void {
    this.form.patchValue({
      transportadoraNome: transportadora.razaoSocial,
      transportadoraCnpjCpf: transportadora.cnpj
    });
  }

  searchProdutos(event: any): void {
    if (!event.query || event.query.length < 2) return;
    this.produtoService.buscarParaVenda(event.query).subscribe(res => {
      this.filteredProdutos = res;
    });
  }

  adicionarItem(itemVenda: any): void {
    // Se vier do autocomplete ajustado
    const itemData = {
      produto: { id: itemVenda.produtoId },
      variacaoId: itemVenda.variacaoId,
      codigoProduto: itemVenda.codigo,
      descricao: itemVenda.nome,
      ncm: itemVenda.ncm,
      cfop: itemVenda.cfop || '5102',
      unidadeComercial: itemVenda.unidadeMedida || 'UN',
      quantidadeComercial: 1,
      valorUnitarioComercial: itemVenda.precoVenda || 0,
      valorBruto: itemVenda.precoVenda || 0,
      valorLiquido: itemVenda.precoVenda || 0,
      icmsCst: itemVenda.icmsCst,
      icmsAliquota: itemVenda.icmsAliq,
      pisCst: itemVenda.pisCst,
      pisAliquota: itemVenda.pisAliq,
      cofinsCst: itemVenda.cofinsCst,
      cofinsAliquota: itemVenda.cofinsAliq,
      origem: itemVenda.origem
    };

    this.itens.push(this.createItemForm(itemData));
    this.calcularTotais();

    // Limpar campo de busca
    this.prodSearch?.writeValue(null);
    if (this.prodSearch?.inputEL?.nativeElement) {
      this.prodSearch.inputEL.nativeElement.value = '';
    }

    this.messageService.add({ severity: 'info', summary: 'Item Adicionado', detail: itemVenda.nome });
  }

  removerItem(index: number): void {
    const item = this.itens.at(index);

    // Se for admin, já remove direto com confirmação
    if (this.authService.hasRole('ROLE_ADMIN')) {
      this.executarRemocao(index, item.get('descricao')?.value);
      return;
    }

    // Se não for admin, pede autorização de supervisor
    this.authModal.show({ type: 'remover_item', index, descricao: item.get('descricao')?.value },
      'Autorizar Remoção',
      `Informe a senha para autorizar a remoção do item: ${item.get('descricao')?.value}`);
  }

  private executarRemocao(index: number, descricao: string): void {
    this.confirmationService.confirm({
      message: `Deseja realmente remover o item "${descricao}"?`,
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, remover',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.itens.removeAt(index);
        this.calcularTotais();
        this.messageService.add({ severity: 'warn', summary: 'Removido', detail: 'O item foi removido da nota.' });
      }
    });
  }

  calcularTotais(): void {
    let totalProdutos = 0;
    const itensControls = this.itens.controls;

    itensControls.forEach(control => {
      const qty = control.get('quantidadeComercial')?.value || 0;
      const unit = control.get('valorUnitarioComercial')?.value || 0;
      const bruto = Number((qty * unit).toFixed(2));
      control.patchValue({ valorBruto: bruto }, { emitEvent: false });
      totalProdutos += bruto;
    });

    const freteTotal = this.form.get('valorFrete')?.value || 0;
    const seguroTotal = this.form.get('valorSeguro')?.value || 0;
    const outrosTotal = this.form.get('valorOutros')?.value || 0;
    const descontoTotal = this.form.get('valorDesconto')?.value || 0;

    let freteAcumulado = 0;
    let descontoAcumulado = 0;
    let baseIcmsTotal = 0;
    let valorIcmsTotal = 0;

    itensControls.forEach((control, index) => {
      const bruto = control.get('valorBruto')?.value || 0;
      let freteItem = 0;
      let descontoItem = 0;

      if (totalProdutos > 0) {
        if (index === itensControls.length - 1) {
          freteItem = freteTotal - freteAcumulado;
          descontoItem = descontoTotal - descontoAcumulado;
        } else {
          freteItem = Number((freteTotal * bruto / totalProdutos).toFixed(2));
          descontoItem = Number((descontoTotal * bruto / totalProdutos).toFixed(2));
          freteAcumulado += freteItem;
          descontoAcumulado += descontoItem;
        }
      }

      const liquido = Number((bruto - descontoItem + freteItem).toFixed(2));
      const aliqIcms = control.get('icmsAliquota')?.value || 0;
      const valorIcms = Number((liquido * aliqIcms / 100).toFixed(2));

      control.patchValue({
        valorFrete: freteItem,
        valorDesconto: descontoItem,
        valorLiquido: liquido,
        icmsValor: valorIcms
      }, { emitEvent: false });

      baseIcmsTotal += liquido;
      valorIcmsTotal += valorIcms;
    });

    const totalNota = totalProdutos - descontoTotal + freteTotal + seguroTotal + outrosTotal;

    this.form.patchValue({
      valorTotalProdutos: totalProdutos,
      valorTotalNota: totalNota,
      valorBaseCalculoIcms: baseIcmsTotal,
      valorIcms: valorIcmsTotal
    }, { emitEvent: false });


    this.redistribuirPagamentos();
  }

  redistribuirPagamentos(): void {
    const total = this.form.get('valorTotalNota')?.value || 0;
    const qtd = this.pagamentos.length;

    if (qtd === 0 || total <= 0) return;

    const valorBase = Number((total / qtd).toFixed(2));
    const soma = Number((valorBase * qtd).toFixed(2));
    const sobra = Number((total - soma).toFixed(2)); // diferença de arredondamento

    this.pagamentos.controls.forEach((control, index) => {
      // Sobra vai para a PRIMEIRA parcela
      const valor = index === 0
        ? Number((valorBase + sobra).toFixed(2))
        : valorBase;

      control.patchValue({ valorPagamento: valor }, { emitEvent: false });
    });
  }

  carregarNota(id: string): void {
    this.loading = true;
    this.nfeService.buscarPorId(id).subscribe({
      next: (nota) => {
        this.statusNota = nota.status;
        this.mensagemRetorno = nota.mensagemRetorno || '';

        // Regra de Ouro ERP: Apenas RASCUNHO e REJEITADA podem ser editadas
        this.isReadOnly = ![StatusNFe.RASCUNHO, StatusNFe.REJEITADA].includes(nota.status);

        // Adicionar displayName ao cliente carregado para o AutoComplete não mostrar [object Object]
        if (nota.cliente) {
          nota.cliente.displayName = (nota.cliente.razaoSocial && nota.cliente.razaoSocial.trim())
            ? nota.cliente.razaoSocial
            : ((nota.cliente.name || '') + ' ' + (nota.cliente.lastName || '')).trim() || 'Sem Nome';
        }

        this.form.patchValue({
          ...nota,
          dataEmissao: new Date(nota.dataEmissao),
          dataSaidaEntrada: nota.dataSaidaEntrada ? new Date(nota.dataSaidaEntrada) : null
        });

        if (this.isReadOnly) {
          this.form.disable();
        } else if (!this.descontoAutorizado) {
          this.form.get('valorDesconto')?.disable();
        }

        this.itens.clear();
        nota.itens?.forEach((item: any) => {
          this.itens.push(this.createItemForm(item));
        });

        this.pagamentos.clear();
        nota.pagamentos?.forEach((pag: any) => {
          const pagForm = this.fb.group({
            ...pag,
            dataVencimento: pag.dataVencimento ? new Date(pag.dataVencimento) : null
          });
          if (this.isReadOnly) pagForm.disable();
          this.pagamentos.push(pagForm);
        });

        this.calcularTotais();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro detalhado:', err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar nota' });
        this.loading = false;
        this.router.navigate(['/contabilidade/nfe']);
      }
    });
  }

  salvar(irParaLista = true): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos obrigatórios' });
      return;
    }

    if (this.itens.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Adicione pelo menos um produto à nota' });
      return;
    }

    this.loading = true;
    const dados = this.form.getRawValue();

    this.nfeService.salvar(dados).subscribe({
      next: (res) => {
        if (irParaLista) {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Nota salva com sucesso' });
          this.router.navigate(['/contabilidade/nfe']);
        } else {
          // Atualiza ID se for nova
          if (!this.isEdit) {
            this.form.patchValue({ id: res.id, numero: res.numero });
            this.isEdit = true;
          }
        }
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao salvar nota' });
        this.loading = false;
      }
    });
  }

  transmitir(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const dados = this.form.getRawValue();

    this.nfeService.salvar(dados).subscribe({
      next: (notaSalva) => {
        // Enfileira a emissão no backend (assíncrono)
        this.nfeService.emitir(notaSalva.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'info', summary: 'Emissão inciada', detail: 'A nota foi enfileirada. Acompanhe o status na lista.' });
            this.router.navigate(['/contabilidade/nfe']);
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Erro ao emitir', detail: err.error?.message });
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro ao salvar', detail: err.error?.message });
        this.loading = false;
      }
    });
  }

  onEmissaoFinalizada(res: { sucesso: boolean; mensagem: string }): void {
    if (res.sucesso) {
      this.messageService.add({ severity: 'success', summary: 'Emissão Concluída', detail: res.mensagem });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Falha na Emissão', detail: res.mensagem });
    }
  }

  solicitarAutorizacaoDesconto(): void {
    if (this.authService.hasRole('ROLE_ADMIN') && !this.descontoAutorizado) {
      this.descontoAutorizado = true;
      this.messageService.add({ severity: 'success', summary: 'Autorizado', detail: 'Desconto liberado por nível de acesso.' });
      return;
    }

    if (this.descontoAutorizado) {
      this.descontoAutorizado = false;
      return;
    }

    this.authModal.show('desconto', 'Autorização de Desconto', 'Informe a senha para liberar o campo de desconto global.');
  }

  solicitarAutorizacaoPreco(): void {
    if (this.authService.hasRole('ROLE_ADMIN') && !this.precoAutorizado) {
      this.precoAutorizado = true;
      this.messageService.add({ severity: 'success', summary: 'Autorizado', detail: 'Alteração de preço liberada.' });
      return;
    }

    if (this.precoAutorizado) {
      this.precoAutorizado = false;
      return;
    }

    this.authModal.show('preco', 'Autorização de Preço', 'Informe a senha para permitir a alteração dos preços unitários.');
  }

  handleAuthSuccess(event: any): void {
    const context = event.context;
    if (context === 'desconto') {
      this.descontoAutorizado = true;
    } else if (context === 'preco') {
      this.precoAutorizado = true;
    } else if (context?.type === 'remover_item') {
      this.executarRemocao(context.index, context.descricao);
    }
  }
}
