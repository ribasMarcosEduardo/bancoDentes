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
     * Recupera todas as movimentações cadastradas no sistema.
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

        boolean temItensOrigem = dto.itens() != null && !dto.itens().isEmpty();

        long novaQuantidadeDestino;
        if (temItensOrigem) {
            novaQuantidadeDestino = saldoAtual + quantidadeTotalTransferencias;
        } else {
            novaQuantidadeDestino = saldoAtual + qtdEntradaInformada;
        }

        frascoDestino.setQuantidade(novaQuantidadeDestino);

        long qtdFinal = quantidadeTotalTransferencias > 0 ? quantidadeTotalTransferencias : qtdEntradaInformada;
        movimentacaoEntrada.setQuantidade(qtdFinal);

        manutencaoService.registrarManutencao(new ManutencaoDTO(
                frascoDestino.getCodigo(),
                novaQuantidadeDestino,
                OrigemManutencao.MANUTENCAO
        ));

        frascoDestino.emManutencao();
        frascoRepository.save(frascoDestino);

        movimentacoesSalvas.add(0, movimentacaoRepository.save(movimentacaoEntrada));

        return movimentacoesSalvas;
    }

    /**
     * Processa os frascos de origem para movimentações de Entrada e gera Transferências.
     */
    private long processarItensEQuantidadeEntrada(MovimentacaoDTO dto, Movimentacao movimentacaoEntrada, List<Movimentacao> movimentacoesSalvas) throws MovimentacaoException {
        long quantidadeTotal = 0L;

        if (dto.itens() != null && !dto.itens().isEmpty()) {
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
     */
    private List<Movimentacao> salvarMovimentacaoSaida(MovimentacaoDTO dto) throws Exception {
        List<Movimentacao> movimentacoesSalvas = new ArrayList<>();

        if (dto.itens() != null && !dto.itens().isEmpty()) {
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
        }

        return movimentacoesSalvas;
    }

    /**
     * Registra a manutenção para um frasco em uma operação de Saída.
     */
    private void registrarManutencaoSaida(Frasco frascoOrigem, long saldoAtual, long qtdSaida) throws ManutencaoException {
        long novaQuantidadeCalculada = Math.max(0, saldoAtual - qtdSaida);
        frascoOrigem.setQuantidade(novaQuantidadeCalculada);

        if (novaQuantidadeCalculada == 0L) {
            frascoOrigem.inativo();
        } else {
            manutencaoService.registrarManutencao(new ManutencaoDTO(
                    frascoOrigem.getCodigo(),
                    novaQuantidadeCalculada,
                    OrigemManutencao.MANUTENCAO
            ));
            frascoOrigem.emManutencao();
        }

        frascoRepository.save(frascoOrigem);
    }
}