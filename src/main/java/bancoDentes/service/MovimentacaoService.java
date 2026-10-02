package bancoDentes.service;

import bancoDentes.dto.ItemMovimentacaoDTO;
import bancoDentes.dto.ManutencaoDTO;
import bancoDentes.dto.MovimentacaoDTO;
import bancoDentes.exception.ManutencaoException;
import bancoDentes.exception.MovimentacaoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.Movimentacao;
import bancoDentes.model.enumModels.OrigemManutencao;
import bancoDentes.model.enumModels.TipoMovimentacao;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.MovimentacaoRepository;
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

    /**
     * Recupera todos os frascos cadastrados no sistema.
     */
    public List<Movimentacao> getMovimentacoes() {
        return movimentacaoRepository.findAll();
    }

    @Transactional
    public List<Movimentacao> save(MovimentacaoDTO dto) throws Exception {

        if (TipoMovimentacao.SAIDA.equals(dto.tipoMovimentacao())) {
            return salvarMovimentacaoSaida(dto);
        }

        return salvarMovimentacaoEntrada(dto);
    }

    /**
     * Cria a movimentação principal de Entrada e as movimentações de Transferência
     * para os frascos de origem (se houverem).
     * @param dto
     */
    private List<Movimentacao> salvarMovimentacaoEntrada(MovimentacaoDTO dto) throws Exception {
        List<Movimentacao> movimentacoesSalvas = new ArrayList<>();

        Frasco frascoDestino = frascoRepository.findById(dto.codFrasco())
                .orElseThrow(() -> new MovimentacaoException(getText("error.frasco.naoEncontrado")));

        Movimentacao movimentacaoEntrada = dto.mapearMovimentacao(frascoDestino);
        long saldoAtual = frascoDestino.getQuantidade() != null ? frascoDestino.getQuantidade() : 0L;
        movimentacaoEntrada.setSaldoAnterior(saldoAtual);

        movimentacaoEntrada = movimentacaoRepository.save(movimentacaoEntrada);

        long quantidadeTotalTransferencias = processarItensEQuantidadeEntrada(dto, movimentacaoEntrada, movimentacoesSalvas);

        long qtdEntradaInformada = dto.quantidade() != null ? dto.quantidade() : 0L;
        long qtdFinal = quantidadeTotalTransferencias > 0 ? quantidadeTotalTransferencias : qtdEntradaInformada;
        movimentacaoEntrada.setQuantidade(qtdFinal);

        registrarManutencaoEntrada(dto, frascoDestino, saldoAtual, qtdEntradaInformada);

        movimentacoesSalvas.add(0, movimentacaoRepository.save(movimentacaoEntrada));

        return movimentacoesSalvas;
    }

    /**
     * Processa os frascos de origem para movimentações de Entrada e gera Transferências.
     * @param dto
     */
    private long processarItensEQuantidadeEntrada(MovimentacaoDTO dto, Movimentacao movimentacaoEntrada, List<Movimentacao> movimentacoesSalvas) throws MovimentacaoException {
        long quantidadeTotal = 0L;

        if (!dto.itens().isEmpty()) {
            for (ItemMovimentacaoDTO itemDto : dto.itens()) {
                if (itemDto != null && itemDto.codFrasco() != null) {
                    Frasco frascoOrigem = frascoRepository.findById(itemDto.codFrasco())
                            .orElseThrow(() ->  new MovimentacaoException(getText("error.frasco.naoEncontrado")));

                    long qtdTransferida = (itemDto.quantidade() != null) ? itemDto.quantidade() : 0L;
                    quantidadeTotal += qtdTransferida;

                    long saldoAnteriorOrigem = frascoOrigem.getQuantidade() != null ? frascoOrigem.getQuantidade() : 0L;

                    frascoOrigem.setQuantidade(0L);

                    frascoOrigem.setStatusFrasco(bancoDentes.model.enumModels.StatusFrasco.INATIVO);

                    frascoRepository.save(frascoOrigem);

                    if (qtdTransferida > 0L) {
                        Movimentacao transferencia = new Movimentacao(
                                TipoMovimentacao.TRANSFERENCIA,
                                dto.datManutencao() != null ? dto.datManutencao().atStartOfDay() : LocalDateTime.now(),
                                dto.local(),
                                dto.observacao(),
                                frascoOrigem,
                                qtdTransferida,
                                saldoAnteriorOrigem,
                                movimentacaoEntrada
                        );

                        movimentacoesSalvas.add(movimentacaoRepository.save(transferencia));
                    }
                }
            }
        }
        return quantidadeTotal;
    }

    /**
     * Processa os frascos de origem para movimentações de Saída.
     * @param dto
     */
    private List<Movimentacao> salvarMovimentacaoSaida(MovimentacaoDTO dto) throws Exception {
        List<Movimentacao> movimentacoesSalvas = new ArrayList<>();

        for (ItemMovimentacaoDTO itemDto : dto.itens()) {
            if (itemDto != null && itemDto.codFrasco() != null) {

                Frasco frascoOrigem = frascoRepository.findById(itemDto.codFrasco())
                        .orElseThrow(() -> new MovimentacaoException(getText("error.frasco.naoEncontrado")));

                long qtdSaida = (itemDto.quantidade() != null) ? itemDto.quantidade() : 0L;
                long saldoAtual = frascoOrigem.getQuantidade() != null ? frascoOrigem.getQuantidade() : 0L;

                if (qtdSaida > 0L) {
                    registrarManutencaoSaida(frascoOrigem, saldoAtual, qtdSaida);

                    Movimentacao movimentacao = new Movimentacao(
                            TipoMovimentacao.SAIDA,
                            dto.datManutencao() != null ? dto.datManutencao().atStartOfDay() : LocalDateTime.now(),
                            dto.local(),
                            dto.observacao(),
                            frascoOrigem,
                            qtdSaida,
                            saldoAtual,
                            null
                    );

                    movimentacoesSalvas.add(movimentacaoRepository.save(movimentacao));
                }
            }
        }

        return movimentacoesSalvas;
    }

    /**
     * Registra a manutenção para um frasco de destino em uma operação de Entrada.
     * Caso a operação seja uma entrada normal (sem frascos de origem vinculados na lista de itens),
     * o método projeta a nova quantidade do frasco e gera um registro histórico de Manutenção.
     * @param dto
     * @param frascoDestino
     * @param saldoAtual
     * @param qtdEntradaInformada
     */
    private void registrarManutencaoEntrada(MovimentacaoDTO dto, Frasco frascoDestino, long saldoAtual, long qtdEntradaInformada) throws ManutencaoException {
        boolean isEntradaNormal = dto.itens().isEmpty();

        if (isEntradaNormal) {
            long novaQuantidadeCalculada = saldoAtual + qtdEntradaInformada;
            manutencaoService.registrarManutencao(new ManutencaoDTO(
                    frascoDestino.getCodigo(),
                    novaQuantidadeCalculada,
                    OrigemManutencao.MANUTENCAO
            ));
        }

        frascoDestino.emManutencao();
        frascoRepository.save(frascoDestino);
    }

    /**
     * Registra a manutenção para um frasco em uma operação de Saída.
     * Calcula a nova quantidade projetada do frasco subtraindo a quantidade retirada do saldo atual
     * @param frascoOrigem
     * @param saldoAtual
     * @param qtdSaida
     */
    private void registrarManutencaoSaida(Frasco frascoOrigem, long saldoAtual, long qtdSaida) throws ManutencaoException {
        long novaQuantidadeCalculada = Math.max(0, saldoAtual - qtdSaida);
        manutencaoService.registrarManutencao(new ManutencaoDTO(
                frascoOrigem.getCodigo(),
                novaQuantidadeCalculada,
                OrigemManutencao.MANUTENCAO
        ));

        frascoOrigem.emManutencao();
        frascoRepository.save(frascoOrigem);
    }
}