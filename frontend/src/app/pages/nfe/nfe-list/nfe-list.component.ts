import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NfeService, NotaFiscalProduto, StatusNFe, NfeListItemDTO } from '../../../core/services/nfe.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { NfeEmissaoStatusComponent } from '../nfe-emissao-status.component';
import { ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nfe-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    PageHeaderComponent,
    NfeEmissaoStatusComponent,
    FormsModule
  ],
  templateUrl: './nfe-list.component.html',
  styleUrls: ['./nfe-list.component.scss']
})
export class NfeListComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private nfeService = inject(NfeService);
  public messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  notas: NfeListItemDTO[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  rows: number = 10;
  paginaAtual: number = 0;
  busca: string = '';
  filtroStatus: string = '';
  buscaTimeout: any;

  resumo: any = {
    total: 0,
    autorizadas: 0,
    processando: 0,
    rejeitadas: 0,
    valorMesAtual: 0,
    valorMesAnterior: 0
  };

  statusList = [
    { value: '', label: 'Todas' },
    { value: 'RASCUNHO', label: 'Rascunho' },
    { value: 'AUTORIZADA', label: 'Autorizadas' },
    { value: 'PROCESSANDO', label: 'Processando' },
    { value: 'REJEITADA', label: 'Rejeitadas' },
    { value: 'CANCELADA', label: 'Canceladas' },
  ];

  // SSE Emissão
  @ViewChild('statusPanel') statusPanel?: NfeEmissaoStatusComponent;
  showEmissaoStatus = false;
  nfeIdParaEmissao?: string;
  nomeClienteParaEmissao = '';
  numeroNotaParaEmissao?: number;
  carregandoFiltro: boolean | undefined;

  ngOnInit(): void {
    //this.carregarNotas();
    this.carregarResumo();
  }

  carregarNotas(event?: any): void {
    // Primeira carga (sem event) ou paginação → loading completo
    // Filtro/busca → loading silencioso sem piscar
    if (event) {
      this.paginaAtual = Math.floor(event.first / event.rows);
      this.rows = event.rows;
      this.loading = true; // paginação pode mostrar loading
    } else {
      // chamada programática (filtro/busca) — não pisca a tabela
      this.carregandoFiltro = true;
    }

    this.cdr.detectChanges();

    const buscaLimpa = this.busca?.trim() || undefined;
    const statusLimpo = this.filtroStatus || undefined;

    this.nfeService.listar(this.paginaAtual, this.rows, buscaLimpa, statusLimpo).subscribe({
      next: (res: any) => {
        this.notas = res.content;
        this.totalRecords = res.totalElements;
        this.loading = false;
        this.carregandoFiltro = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar notas' });
        this.loading = false;
        this.carregandoFiltro = false;
        this.cdr.detectChanges();
      }
    });
  }

  carregarResumo(): void {
    this.nfeService.obterResumo().subscribe({
      next: (res) => {
        this.resumo = res;
        this.cdr.detectChanges(); // 5. Adicione aqui para garantir o resumo na tela
      },
      error: () => console.error('Erro ao carregar resumo de NFe')
    });
  }

  abrirNota(nota: NfeListItemDTO): void {
    this.router.navigate(['/contabilidade/nfe/editar', nota.id]);
  }

  onFilter(): void {
    clearTimeout(this.buscaTimeout);
    this.buscaTimeout = setTimeout(() => {
      this.paginaAtual = 0;
      this.carregarNotas(); // sem event → carregandoFiltro silencioso
    }, 400);
  }

  filtrarStatus(status: string): void {
    this.filtroStatus = status;
    this.paginaAtual = 0;
    this.carregarNotas(); // sem event → carregandoFiltro silencioso
  }

  getStatusSeverity(status: StatusNFe): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (status) {
      case StatusNFe.AUTORIZADA: return 'success';
      case StatusNFe.PROCESSANDO: return 'info';
      case StatusNFe.REJEITADA: return 'danger';
      case StatusNFe.CANCELADA: return 'secondary';
      case StatusNFe.RASCUNHO: return 'warn';
      default: return 'info';
    }
  }

  emitir(nota: NfeListItemDTO): void {
    this.nfeIdParaEmissao = nota.id!;
    this.nomeClienteParaEmissao = nota.clienteNome || 'Cliente não identificado';
    this.numeroNotaParaEmissao = nota.numero;
    this.showEmissaoStatus = true;
    this.cdr.detectChanges();

    this.nfeService.emitir(nota.id!).subscribe({
      next: () => {
        setTimeout(() => this.statusPanel?.iniciarStreaming(), 100);
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao emitir nota' });
        this.showEmissaoStatus = false;
        this.cdr.detectChanges();
      }
    });
  }

  onEmissaoFinalizada(result: { sucesso: boolean; mensagem: string }): void {
    if (result.sucesso) {
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: result.mensagem });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Falha', detail: result.mensagem });
    }
    this.carregarNotas();
  }

  fecharModalEmissao(): void {
    this.showEmissaoStatus = false;
    this.carregarNotas();
  }

  consultar(nota: NfeListItemDTO): void {
    this.nfeService.consultar(nota.id!).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Status atualizado' });
        this.carregarNotas();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao consultar' });
      }
    });
  }

  prepararCancelamento(nota: NfeListItemDTO): void {
    this.confirmationService.confirm({
      message: 'Informe a justificativa para o cancelamento (min. 15 caracteres):',
      header: 'Cancelar NFe',
      icon: 'pi pi-times-circle',
      acceptLabel: 'Confirmar Cancelamento',
      rejectLabel: 'Voltar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const justificativa = prompt('Justificativa:');
        if (justificativa && justificativa.length >= 15) {
          this.nfeService.cancelar(nota.id!, justificativa).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Nota cancelada' });
              this.carregarNotas();
            },
            error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Erro ao cancelar' })
          });
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Justificativa muito curta' });
        }
      }
    });
  }

  excluir(nota: NfeListItemDTO): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta nota?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.nfeService.excluir(nota.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Nota excluída' });
            this.carregarNotas();
          },
          error: (err: any) => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao excluir' });
          }
        });
      }
    });
  }

  baixarXml(nota: NfeListItemDTO): void {
    this.messageService.add({ severity: 'info', summary: 'Aviso', detail: 'Download XML em desenvolvimento' });
  }

  imprimir(nota: NfeListItemDTO): void {
    this.nfeService.imprimir(nota.id!).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (err: any) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erro', 
          detail: 'Falha ao gerar o PDF da DANFE.' 
        });
      }
    });
  }
}
