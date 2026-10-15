package bancoDentes.service;

import bancoDentes.dto.ItemMovimentacaoDTO;
import bancoDentes.dto.MovimentacaoDTO;
import bancoDentes.exception.ManutencaoException;
import bancoDentes.exception.MovimentacaoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.Movimentacao;
import bancoDentes.model.enumModels.OrigemMovimentacao;
import bancoDentes.model.enumModels.TipoMovimentacao;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.MovimentacaoRepository;
import bancoDentes.service.validator.MovimentacaoValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service responsável por gerenciar as regras de negócio referente
 * as movimentações.
 *
 * @author Marcos Eduardo Ribas
 */
@Service
@RequiredArgsConstructor
public class MovimentacaoService extends BaseService {

    private final MovimentacaoRepository movimentacaoRepository;
    private final FrascoRepository frascoRepository;
    private final ManutencaoService manutencaoService;
    private final MovimentacaoValidator movimentacaoValidator;

    /**
     * Recupera todas as movimentações cadastradas no sistema.
     */
    public List<Movimentacao> getMovimentacoes() {
        return movimentacaoRepository.findAll();
    }

    /**
     * Recupera as movimentações de um frasco específico.
     *
     * @param codFrasco
     */
    public List<Movimentacao> getMovimentacoesDoFrasco(Long codFrasco) {
        return movimentacaoRepository.findByFrascoCodigo(codFrasco);
    }

    @Transactional(rollbackOn = Exception.class)
    public List<Movimentacao> save(MovimentacaoDTO dto) throws Exception {
        movimentacaoValidator.validarFrascosMovimentaveis(dto);

        if (TipoMovimentacao.SAIDA.equals(dto.tipoMovimentacao())) {
            return salvarMovimentacaoSaida(dto);
        }

        movimentacaoValidator.validarTransferencia(dto);
        return salvarMovimentacaoEntrada(dto);
    }

    /**
     * Cria a movimentação principal de Entrada e as movimentações de Transferência
     * para os frascos de origem (se houverem).
     */
    private List<Movimentacao> salvarMovimentacaoEntrada(MovimentacaoDTO dto) throws Exception {
        List<Movimentacao> movimentacoesSalvas = new ArrayList<>();

        Frasco frascoDestino = frascoRepository.findById(dto.codFrasco())
                .orElseThrow(() -> new MovimentacaoException(getText("error.frasco.naoEncontrado")));

        long saldoAtual = frascoDestino.getQuantidade() != null ? frascoDestino.getQuantidade() : 0L;

        Movimentacao movimentacaoEntrada = dto.mapearMovimentacao(frascoDestino);
        movimentacaoEntrada.setSaldoAnterior(saldoAtual);
        movimentacaoEntrada = movimentacaoRepository.save(movimentacaoEntrada); // Necessário pois é INSERT novo

        long quantidadeTotalTransferencias = processarItensEQuantidadeEntrada(dto, movimentacaoEntrada, movimentacoesSalvas);
        long qtdEntradaInformada = dto.quantidade() != null ? dto.quantidade() : 0L;
        boolean temItensOrigem = dto.itens() != null && !dto.itens().isEmpty();

        long novaQuantidadeDestino = temItensOrigem ? saldoAtual + quantidadeTotalTransferencias : saldoAtual + qtdEntradaInformada;
        long qtdFinal = quantidadeTotalTransferencias > 0 ? quantidadeTotalTransferencias : qtdEntradaInformada;

        frascoDestino.setQuantidade(novaQuantidadeDestino);
        movimentacaoEntrada.setQuantidade(qtdFinal);

        manutencaoService.registrarOuAtualizarManutencao(frascoDestino, novaQuantidadeDestino);
        frascoDestino.emManutencao();

        movimentacoesSalvas.add(0, movimentacaoRepository.save(movimentacaoEntrada));

        return movimentacoesSalvas;
    }

    /**
     * Processa os frascos de origem para movimentações de Entrada e gera Transferências.
     */
    private long processarItensEQuantidadeEntrada(MovimentacaoDTO dto, Movimentacao movimentacaoEntrada, List<Movimentacao> movimentacoesSalvas) throws MovimentacaoException {
        long quantidadeTotal = 0L;

        if (dto.itens() == null || dto.itens().isEmpty()) return 0L;

        for (ItemMovimentacaoDTO itemDto : dto.itens()) {
            if (itemDto == null || itemDto.codFrasco() == null) continue;

            Frasco frascoOrigem = frascoRepository.findById(itemDto.codFrasco())
                    .orElseThrow(() -> new MovimentacaoException(getText("error.frasco.naoEncontrado")));

            long qtdTransferida = frascoOrigem.getQuantidade() != null ? frascoOrigem.getQuantidade() : 0L;
            quantidadeTotal += qtdTransferida;

            frascoOrigem.setQuantidade(0L);
            frascoOrigem.inativo();

            manutencaoService.finalizarManutencoesAbertas(frascoOrigem);

            if (qtdTransferida > 0L) {
                Movimentacao transferencia = new Movimentacao(
                        TipoMovimentacao.TRANSFERENCIA,
                        OrigemMovimentacao.REGISTRO_MANUAL,
                        dto.datManutencao() != null ? dto.datManutencao().atStartOfDay() : LocalDateTime.now(),
                        dto.local(),
                        dto.observacao(),
                        frascoOrigem,
                        qtdTransferida,
                        qtdTransferida,
                        movimentacaoEntrada
                );
                movimentacoesSalvas.add(movimentacaoRepository.save(transferencia));
            }
        }
        return quantidadeTotal;
    }

    /**
     * Processa os frascos de origem para movimentações de Saída.
     */
    private List<Movimentacao> salvarMovimentacaoSaida(MovimentacaoDTO dto) throws Exception {
        List<Movimentacao> movimentacoesSalvas = new ArrayList<>();

        if (dto.itens() == null || dto.itens().isEmpty()) return movimentacoesSalvas;

        for (ItemMovimentacaoDTO itemDto : dto.itens()) {
            if (itemDto == null || itemDto.codFrasco() == null) continue;

            Frasco frascoOrigem = frascoRepository.findById(itemDto.codFrasco())
                    .orElseThrow(() -> new MovimentacaoException(getText("error.frasco.naoEncontrado")));

            long qtdSaida = (itemDto.quantidade() != null) ? itemDto.quantidade() : 0L;
            long saldoAtual = frascoOrigem.getQuantidade() != null ? frascoOrigem.getQuantidade() : 0L;

            if (qtdSaida > saldoAtual) {
                throw new MovimentacaoException(getText("error.movimentacao.saidaMaiorQueSaldo", frascoOrigem.getIdentificacao(), qtdSaida, saldoAtual));
            }

            if (qtdSaida > 0L) {
                registrarManutencaoSaida(frascoOrigem, saldoAtual, qtdSaida);

                Movimentacao movimentacao = new Movimentacao(
                        TipoMovimentacao.SAIDA, OrigemMovimentacao.REGISTRO_MANUAL,
                        dto.datManutencao() != null ? dto.datManutencao().atStartOfDay() : LocalDateTime.now(),
                        dto.local(), dto.observacao(), frascoOrigem, qtdSaida, saldoAtual, null
                );
                movimentacoesSalvas.add(movimentacaoRepository.save(movimentacao));
            }
        }
        return movimentacoesSalvas;
    }

    /**
     * Registra a manutenção para um frasco em uma operação de Saída.
     * Se o frasco já estiver em manutenção, a manutenção aberta é atualizada
     * (ou finalizada, se a saída zerar o frasco) em vez de abrir outra.
     */
    private void registrarManutencaoSaida(Frasco frascoOrigem, long saldoAtual, long qtdSaida) throws ManutencaoException {
        long novaQuantidadeCalculada = Math.max(0, saldoAtual - qtdSaida);
        frascoOrigem.setQuantidade(novaQuantidadeCalculada);

        if (novaQuantidadeCalculada == 0L) {
            manutencaoService.finalizarManutencoesAbertas(frascoOrigem);
            frascoOrigem.inativo();
        } else {
            manutencaoService.registrarOuAtualizarManutencao(frascoOrigem, novaQuantidadeCalculada);
            frascoOrigem.emManutencao();
        }
    }

    /**
     * Registra a quantidade inicial do frasco como uma Entrada sem frascos de origem
     * (equivalente a "Doação/Outros"), pra que o histórico de movimentações cubra
     * todos os dentes que já passaram pelo frasco.
     *
     * @param frasco
     */
    @Transactional
    public void registrarEntradaCadastro(Frasco frasco) {
        long quantidade = frasco.getQuantidade() != null ? frasco.getQuantidade() : 0L;
        if (quantidade <= 0L) return;

        movimentacaoRepository.save(new Movimentacao(
                TipoMovimentacao.ENTRADA, OrigemMovimentacao.CADASTRO, frasco.getDatCad(), frasco.getLocal(),
                this.getText("msg.movimentacao.cadastroFrasco", frasco.getIdentificacao()),
                frasco, quantidade, 0L, null
        ));
    }

}