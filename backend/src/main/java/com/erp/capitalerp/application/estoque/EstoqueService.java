package com.erp.capitalerp.application.estoque;

import com.erp.capitalerp.application.estoque.dto.ProdutoAbaixoMinimoResponse;
import com.erp.capitalerp.domain.estoque.EstoqueAbaixoMinimoEvent;
import com.erp.capitalerp.domain.estoque.MovimentacaoEstoque;
import com.erp.capitalerp.domain.estoque.Produto;
import com.erp.capitalerp.domain.estoque.ProdutoVariacao;
import com.erp.capitalerp.domain.estoque.TipoMovimentacao;
import com.erp.capitalerp.domain.estoque.LocalEstoque;
import com.erp.capitalerp.domain.estoque.EstoqueSaldo;
import com.erp.capitalerp.infrastructure.persistence.estoque.MovimentacaoEstoqueRepository;
import com.erp.capitalerp.infrastructure.persistence.estoque.ProdutoRepository;
import com.erp.capitalerp.infrastructure.persistence.estoque.LocalEstoqueRepository;
import com.erp.capitalerp.infrastructure.persistence.estoque.EstoqueSaldoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class EstoqueService {

    private final ProdutoRepository produtoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final LocalEstoqueRepository localEstoqueRepository;
    private final EstoqueSaldoRepository estoqueSaldoRepository;
    private final ApplicationEventPublisher eventPublisher;

    public EstoqueService(ProdutoRepository produtoRepository, MovimentacaoEstoqueRepository movimentacaoRepository,
            LocalEstoqueRepository localEstoqueRepository, EstoqueSaldoRepository estoqueSaldoRepository,
            ApplicationEventPublisher eventPublisher) {
        this.produtoRepository = produtoRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.localEstoqueRepository = localEstoqueRepository;
        this.estoqueSaldoRepository = estoqueSaldoRepository;
        this.eventPublisher = eventPublisher;
    }

    private LocalEstoque getLocalOuPadrao(UUID localEstoqueId) {
        if (localEstoqueId != null) {
            return localEstoqueRepository.findById(localEstoqueId)
                    .orElseThrow(() -> new EntityNotFoundException("Local de Estoque não encontrado"));
        }
        // Retorna o primeiro local ativo
        return localEstoqueRepository.findByAtivoTrue().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Nenhum Local de Estoque ativo encontrado"));
    }

    private EstoqueSaldo obterOuCriarSaldo(Produto produto, ProdutoVariacao variacao, LocalEstoque local) {
        return estoqueSaldoRepository.findByProdutoIdAndVariacaoIdAndLocalEstoqueId(produto.getId(),
                variacao != null ? variacao.getId() : null, local.getId()).orElseGet(() -> {
                    EstoqueSaldo novo = new EstoqueSaldo();
                    novo.setProduto(produto);
                    novo.setVariacao(variacao);
                    novo.setLocalEstoque(local);
                    novo.setQuantidade(0);
                    novo.setEstoqueMinimo(variacao != null ? variacao.getEstoqueMinimo() : produto.getEstoqueMinimo());
                    return estoqueSaldoRepository.save(novo);
                });
    }

    private void atualizarProdutoGlobal(Produto produto) {
        Integer total = estoqueSaldoRepository.sumTotalQuantidadeByProdutoId(produto.getId());
        produto.setEstoqueAtual(total != null ? total : 0);
        produtoRepository.save(produto);
    }

    public void darBaixa(UUID produtoId, UUID variacaoId, UUID localEstoqueId, int quantidade, String referenciaId,
            String tipo) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + produtoId));
        ProdutoVariacao variacao = null;
        if (variacaoId != null) {
            variacao = produto.getVariacoes().stream().filter(v -> v.getId().equals(variacaoId)).findFirst()
                    .orElseThrow(() -> new EntityNotFoundException("Variação não encontrada: " + variacaoId));
        } else if (Boolean.TRUE.equals(produto.getTemVariacoes())) {
            throw new IllegalStateException("Produto possui variações. Informe a variação específica.");
        }

        LocalEstoque local = getLocalOuPadrao(localEstoqueId);
        EstoqueSaldo saldo = obterOuCriarSaldo(produto, variacao, local);

        int saldoAnterior = saldo.getQuantidade();
        saldo.abater(quantidade);
        int saldoPosterior = saldo.getQuantidade();
        estoqueSaldoRepository.save(saldo);

        // Se tiver variação, atualiza o global e a própria variação
        if (variacao != null) {
            variacao.setEstoqueAtual(variacao.getEstoqueAtual() - quantidade);
        }
        atualizarProdutoGlobal(produto);

        registrarMovimentacao(produto, variacao, local, null, TipoMovimentacao.SAIDA, quantidade, saldoAnterior,
                saldoPosterior, referenciaId, tipo, "Saída avulsa");

        if (saldo.isAbaixoMinimo()) {
            eventPublisher.publishEvent(new EstoqueAbaixoMinimoEvent(produto));
        }
    }

    public void darEntrada(UUID produtoId, UUID variacaoId, UUID localEstoqueId, int quantidade, String referenciaId,
            String tipo) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + produtoId));
        ProdutoVariacao variacao = null;
        if (variacaoId != null) {
            variacao = produto.getVariacoes().stream().filter(v -> v.getId().equals(variacaoId)).findFirst()
                    .orElseThrow(() -> new EntityNotFoundException("Variação não encontrada: " + variacaoId));
        } else if (Boolean.TRUE.equals(produto.getTemVariacoes())) {
            throw new IllegalStateException("Produto possui variações. Informe a variação específica.");
        }

        LocalEstoque local = getLocalOuPadrao(localEstoqueId);
        EstoqueSaldo saldo = obterOuCriarSaldo(produto, variacao, local);

        int saldoAnterior = saldo.getQuantidade();
        saldo.adicionar(quantidade);
        int saldoPosterior = saldo.getQuantidade();
        estoqueSaldoRepository.save(saldo);

        if (variacao != null) {
            variacao.setEstoqueAtual(variacao.getEstoqueAtual() + quantidade);
        }
        atualizarProdutoGlobal(produto);

        registrarMovimentacao(produto, variacao, local, null, TipoMovimentacao.ENTRADA, quantidade, saldoAnterior,
                saldoPosterior, referenciaId, tipo, "Entrada manual");
    }

    public void transferir(UUID produtoId, UUID variacaoId, UUID origemId, UUID destinoId, int quantidade,
            String motivo) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));
        ProdutoVariacao variacao = null;
        if (variacaoId != null) {
            variacao = produto.getVariacoes().stream().filter(v -> v.getId().equals(variacaoId)).findFirst()
                    .orElseThrow(() -> new EntityNotFoundException("Variação não encontrada"));
        }

        LocalEstoque origem = localEstoqueRepository.findById(origemId)
                .orElseThrow(() -> new EntityNotFoundException("Local de origem não encontrado"));
        LocalEstoque destino = localEstoqueRepository.findById(destinoId)
                .orElseThrow(() -> new EntityNotFoundException("Local de destino não encontrado"));

        if (origem.getId().equals(destino.getId())) {
            throw new IllegalArgumentException("Origem e destino não podem ser os mesmos");
        }

        EstoqueSaldo saldoOrigem = obterOuCriarSaldo(produto, variacao, origem);
        EstoqueSaldo saldoDestino = obterOuCriarSaldo(produto, variacao, destino);

        int antOrig = saldoOrigem.getQuantidade();
        saldoOrigem.abater(quantidade);
        int postOrig = saldoOrigem.getQuantidade();

        int antDest = saldoDestino.getQuantidade();
        saldoDestino.adicionar(quantidade);
        int postDest = saldoDestino.getQuantidade();

        estoqueSaldoRepository.save(saldoOrigem);
        estoqueSaldoRepository.save(saldoDestino);

        // O global fica igual, mas registramos os movimentos. Podemos registrar 1 de
        // TRANSFERENCIA.
        registrarMovimentacao(produto, variacao, origem, destino, TipoMovimentacao.TRANSFERENCIA, quantidade, antOrig,
                postOrig, null, null, motivo);
    }

    private void registrarMovimentacao(Produto produto, ProdutoVariacao variacao, LocalEstoque local,
            LocalEstoque destino, TipoMovimentacao tipo, int qtd, int saldoAnt, int saldoPost, String refId,
            String refTipo, String motivo) {
        var mov = new MovimentacaoEstoque();
        mov.setProduto(produto);
        mov.setVariacao(variacao);
        mov.setLocalEstoque(local);
        mov.setLocalDestino(destino);
        mov.setTipo(tipo);
        mov.setQuantidade(qtd);
        mov.setSaldoAnterior(saldoAnt);
        mov.setSaldoPosterior(saldoPost);
        mov.setReferenciaId(refId != null && !refId.isBlank() ? UUID.fromString(refId) : null);
        mov.setReferenciaTipo(refTipo);
        mov.setMotivo(motivo);
        movimentacaoRepository.save(mov);
    }

    @Transactional(readOnly = true)
    public List<ProdutoAbaixoMinimoResponse> buscarAbaixoMinimo() {
        return produtoRepository.findAbaixoEstoqueMinimo().stream().map(
                p -> new ProdutoAbaixoMinimoResponse(p.getId(), p.getNome(), p.getEstoqueAtual(), p.getEstoqueMinimo()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<com.erp.capitalerp.application.estoque.dto.MovimentacaoEstoqueDTO> listarMovimentacoes(UUID produtoId) {
        return movimentacaoRepository.findByProdutoIdOrderByCriadoEmDesc(produtoId).stream()
                .map(com.erp.capitalerp.application.estoque.dto.MovimentacaoEstoqueDTO::new).toList();
    }
}
