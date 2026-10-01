package bancoDentes.service;

import bancoDentes.dto.ItemMovimentacaoDTO;
import bancoDentes.dto.MovimentacaoDTO;
import bancoDentes.exception.MovimentacaoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.Movimentacao;
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

    /**
     * Recupera todos os frascos cadastrados no sistema.
     */
    public List<Movimentacao> getMovimentacoes() {
        return movimentacaoRepository.findAll();
    }

    @Transactional
    public List<Movimentacao> save(MovimentacaoDTO dto) throws MovimentacaoException {

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
    private List<Movimentacao> salvarMovimentacaoEntrada(MovimentacaoDTO dto) throws MovimentacaoException {
        List<Movimentacao> movimentacoesSalvas = new ArrayList<>();

        Frasco frascoDestino = frascoRepository.findById(dto.codFrasco())
                .orElseThrow(() ->  new MovimentacaoException(getText("error.frasco.naoEncontrado")));

        Movimentacao movimentacaoEntrada = dto.mapearMovimentacao(frascoDestino);

        movimentacaoEntrada.setSaldoAnterior(frascoDestino.getQuantidade() != null ? frascoDestino.getQuantidade() : 0L);

        movimentacaoEntrada = movimentacaoRepository.save(movimentacaoEntrada);

        long quantidadeTotal = processarItensEQuantidadeEntrada(dto, movimentacaoEntrada, movimentacoesSalvas);

        long qtdFinal = quantidadeTotal > 0 ? quantidadeTotal : (dto.quantidade() != null ? dto.quantidade() : 0L);
        movimentacaoEntrada.setQuantidade(qtdFinal);

        frascoDestino.emManutencao();
        frascoRepository.save(frascoDestino);

        movimentacoesSalvas.add(0, movimentacaoRepository.save(movimentacaoEntrada));

        return movimentacoesSalvas;
    }

    /**
     * Processa os frascos de origem para movimentações de Entrada e gera Transferências.
     * @param dto
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

                    frascoOrigem.emManutencao();
                    frascoRepository.save(frascoOrigem);

                    if (qtdTransferida > 0L) {
                        Movimentacao transferencia = new Movimentacao(
                                TipoMovimentacao.TRANSFERENCIA,
                                dto.datManutencao() != null ? dto.datManutencao().atStartOfDay() : LocalDateTime.now(),
                                dto.local(),
                                dto.observacao(),
                                frascoOrigem,
                                qtdTransferida,
                                frascoOrigem.getQuantidade() != null ? frascoOrigem.getQuantidade() : 0L,
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
    private List<Movimentacao> salvarMovimentacaoSaida(MovimentacaoDTO dto) throws MovimentacaoException {
        List<Movimentacao> movimentacoesSalvas = new ArrayList<>();

        for (ItemMovimentacaoDTO itemDto : dto.itens()) {
            if (itemDto != null && itemDto.codFrasco() != null) {

                Frasco frascoOrigem = frascoRepository.findById(itemDto.codFrasco())
                        .orElseThrow(() -> new MovimentacaoException(getText("error.frasco.naoEncontrado")));

                long qtdSaida = (itemDto.quantidade() != null) ? itemDto.quantidade() : 0L;

                if (qtdSaida > 0L) {
                    Movimentacao movimentacao = new Movimentacao(
                            TipoMovimentacao.SAIDA,
                            dto.datManutencao() != null ? dto.datManutencao().atStartOfDay() : LocalDateTime.now(),
                            dto.local(),
                            dto.observacao(),
                            frascoOrigem,
                            qtdSaida,
                            frascoOrigem.getQuantidade() != null ? frascoOrigem.getQuantidade() : 0L,
                            null
                    );

                    frascoOrigem.emManutencao();
                    frascoRepository.save(frascoOrigem);

                    movimentacoesSalvas.add(movimentacaoRepository.save(movimentacao));
                }
            }
        }

        return movimentacoesSalvas;
    }
}