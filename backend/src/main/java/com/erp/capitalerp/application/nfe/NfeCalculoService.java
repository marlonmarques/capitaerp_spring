package com.erp.capitalerp.application.nfe;

import com.erp.capitalerp.domain.clientes.Cliente;
import com.erp.capitalerp.domain.estoque.Produto;
import com.erp.capitalerp.domain.fiscal.GrupoTributario;
import com.erp.capitalerp.domain.fiscal.PosicaoFiscal;
import com.erp.capitalerp.domain.nfe.NotaFiscalProduto;
import com.erp.capitalerp.domain.nfe.NotaFiscalProdutoItem;
import com.erp.capitalerp.infrastructure.persistence.cadastros.PosicaoFiscalRepository;
import com.erp.capitalerp.infrastructure.persistence.clientes.ClienteRepository;
import com.erp.capitalerp.infrastructure.persistence.estoque.ProdutoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class NfeCalculoService {

    private final PosicaoFiscalRepository posicaoFiscalRepository;
    private final ClienteRepository clienteRepository;
    private final ProdutoRepository produtoRepository;

    public NfeCalculoService(PosicaoFiscalRepository posicaoFiscalRepository,
                             ClienteRepository clienteRepository,
                             ProdutoRepository produtoRepository) {
        this.posicaoFiscalRepository = posicaoFiscalRepository;
        this.clienteRepository = clienteRepository;
        this.produtoRepository = produtoRepository;
    }

    public void recalcular(NotaFiscalProduto nota) {
        if (nota.getItens() == null || nota.getItens().isEmpty()) {
            return;
        }

        // 1. Carregar Dados Auxiliares em LOTE (Evita N+1)
        PosicaoFiscal posicaoFiscal = null;
        if (nota.getPosicaoFiscalId() != null) {
            posicaoFiscal = posicaoFiscalRepository.findById(nota.getPosicaoFiscalId()).orElse(null);
        }

        // Coleta todos os IDs de produtos dos itens
        Set<UUID> produtoIds = nota.getItens().stream()
                .filter(i -> i.getProduto() != null && i.getProduto().getId() != null)
                .map(i -> i.getProduto().getId())
                .collect(Collectors.toSet());

        // Busca todos os produtos com seus grupos tributários em uma única consulta
        Map<UUID, Produto> produtosMap = Collections.emptyMap();
        if (!produtoIds.isEmpty()) {
            produtosMap = produtoRepository.findAllByIdInWithTributacao(produtoIds).stream()
                    .collect(Collectors.toMap(Produto::getId, Function.identity()));
        }

        // 2. Zerar Totais do Header para Reacumular
        BigDecimal totalProdutos = BigDecimal.ZERO;

        // Calcular Valor Bruto de cada item primeiro
        for (NotaFiscalProdutoItem item : nota.getItens()) {
            BigDecimal bruto = item.getQuantidadeComercial().multiply(item.getValorUnitarioComercial())
                    .setScale(2, RoundingMode.HALF_UP);
            item.setValorBruto(bruto);
            totalProdutos = totalProdutos.add(bruto);
        }

        // 3. Rateio (Apportionment) do Frete/Desconto/Seguro/Outros
        if (totalProdutos.compareTo(BigDecimal.ZERO) > 0) {
            List<NotaFiscalProdutoItem> listaItensRateio = new ArrayList<>(nota.getItens());
            ratear(listaItensRateio, totalProdutos, "frete", nota.getValorFrete());
            ratear(listaItensRateio, totalProdutos, "desconto", nota.getValorDesconto());
            ratear(listaItensRateio, totalProdutos, "seguro", nota.getValorSeguro());
            ratear(listaItensRateio, totalProdutos, "outros", nota.getValorOutros());
        }

        // 4. Cálculos Fiscais por Item
        BigDecimal baseIcmsTotal = BigDecimal.ZERO;
        BigDecimal valorIcmsTotal = BigDecimal.ZERO;
        BigDecimal totalNota = BigDecimal.ZERO;

        for (NotaFiscalProdutoItem item : nota.getItens()) {
            // Valor Líquido do Item = Bruto - Desconto + Frete + Seguro + Outros
            BigDecimal liquido = item.getValorBruto()
                    .subtract(item.getValorDesconto() != null ? item.getValorDesconto() : BigDecimal.ZERO)
                    .add(item.getValorFrete() != null ? item.getValorFrete() : BigDecimal.ZERO)
                    .add(item.getValorSeguro() != null ? item.getValorSeguro() : BigDecimal.ZERO)
                    .add(item.getValorOutrasDespesas() != null ? item.getValorOutrasDespesas() : BigDecimal.ZERO);

            item.setValorLiquido(liquido);

            // Aplicar Regras de Tributação usando os produtos carregados em lote
            Produto p = (item.getProduto() != null) ? produtosMap.get(item.getProduto().getId()) : null;
            aplicarTributacao(item, p, posicaoFiscal);

            // Cálculo das Bases
            item.setIcmsBaseCalculo(item.getValorLiquido());
            BigDecimal icmsAliq = item.getIcmsAliquota() != null ? item.getIcmsAliquota() : BigDecimal.ZERO;
            item.setIcmsValor(item.getIcmsBaseCalculo().multiply(icmsAliq.divide(new BigDecimal(100), 4, RoundingMode.HALF_UP)));

            item.setPisBaseCalculo(item.getValorLiquido());
            BigDecimal pisAliq = item.getPisAliquota() != null ? item.getPisAliquota() : BigDecimal.ZERO;
            item.setPisValor(item.getPisBaseCalculo().multiply(pisAliq.divide(new BigDecimal(100), 4, RoundingMode.HALF_UP)));

            item.setCofinsBaseCalculo(item.getValorLiquido());
            BigDecimal cofinsAliq = item.getCofinsAliquota() != null ? item.getCofinsAliquota() : BigDecimal.ZERO;
            item.setCofinsValor(item.getCofinsBaseCalculo().multiply(cofinsAliq.divide(new BigDecimal(100), 4, RoundingMode.HALF_UP)));

            // Somar totais
            baseIcmsTotal = baseIcmsTotal.add(item.getIcmsBaseCalculo());
            valorIcmsTotal = valorIcmsTotal.add(item.getIcmsValor());
            totalNota = totalNota.add(item.getValorLiquido());
        }

        // 5. Atualizar Header
        nota.setValorTotalProdutos(totalProdutos);
        nota.setValorBaseCalculoIcms(baseIcmsTotal.setScale(2, RoundingMode.HALF_UP));
        nota.setValorIcms(valorIcmsTotal.setScale(2, RoundingMode.HALF_UP));
        nota.setValorTotalNota(totalNota.setScale(2, RoundingMode.HALF_UP));
    }

    private void ratear(List<NotaFiscalProdutoItem> itens, BigDecimal totalProdutos, String tipo, BigDecimal valorTotalRatear) {
        if (valorTotalRatear == null || valorTotalRatear.compareTo(BigDecimal.ZERO) <= 0) return;

        BigDecimal acumulado = BigDecimal.ZERO;
        for (int i = 0; i < itens.size(); i++) {
            NotaFiscalProdutoItem item = itens.get(i);
            BigDecimal valorRateado;

            if (i == itens.size() - 1) {
                // Último item fica com a sobra do arredondamento
                valorRateado = valorTotalRatear.subtract(acumulado);
            } else {
                valorRateado = valorTotalRatear.multiply(item.getValorBruto())
                        .divide(totalProdutos, 2, RoundingMode.HALF_UP);
                acumulado = acumulado.add(valorRateado);
            }

            switch (tipo) {
                case "frete": item.setValorFrete(valorRateado); break;
                case "desconto": item.setValorDesconto(valorRateado); break;
                case "seguro": item.setValorSeguro(valorRateado); break;
                case "outros": item.setValorOutrasDespesas(valorRateado); break;
            }
        }
    }

    private void aplicarTributacao(NotaFiscalProdutoItem item, Produto p, PosicaoFiscal pf) {
        GrupoTributario gt = null;

        if (p != null) {
            gt = p.getGrupoTributario();
            // Se não tem grupo, usa campos legado do produto
            if (gt == null) {
                item.setIcmsCst(p.getCstIcms() != null ? p.getCstIcms() : "102");
                item.setIcmsAliquota(p.getAliquotaIcms() != null ? p.getAliquotaIcms() : BigDecimal.ZERO);
                item.setPisAliquota(p.getAliquotaPis() != null ? p.getAliquotaPis() : BigDecimal.ZERO);
                item.setCofinsAliquota(p.getAliquotaCofins() != null ? p.getAliquotaCofins() : BigDecimal.ZERO);
                item.setCfop(p.getCfop() != null ? p.getCfop() : "5102");
                return;
            }
        }

        if (gt != null) {
            item.setIcmsCst(gt.getCstCsosn());
            item.setIcmsAliquota(gt.getAliquotaIcms() != null ? gt.getAliquotaIcms() : BigDecimal.ZERO);
            item.setPisCst(gt.getCstPis());
            item.setPisAliquota(gt.getAliquotaPis() != null ? gt.getAliquotaPis() : BigDecimal.ZERO);
            item.setCofinsCst(gt.getCstCofins());
            item.setCofinsAliquota(gt.getAliquotaCofins() != null ? gt.getAliquotaCofins() : BigDecimal.ZERO);
            item.setIpiCst(gt.getCstIpi());
            item.setIpiAliquota(gt.getAliquotaIpi() != null ? gt.getAliquotaIpi() : BigDecimal.ZERO);

            // Prioridade do CFOP: PosicaoFiscal > GrupoTributario
            if (pf != null && pf.getCfopPadraoCodigo() != null && !pf.getCfopPadraoCodigo().isEmpty()) {
                item.setCfop(pf.getCfopPadraoCodigo());
            } else {
                item.setCfop(gt.getCfopSaida());
            }
        }
    }
}
