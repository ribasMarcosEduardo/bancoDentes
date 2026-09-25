package bancoDentes.service;

import bancoDentes.dto.ItemMovimentacaoDTO;
import bancoDentes.dto.MovimentacaoDTO;
import bancoDentes.exception.MovimentacaoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.ItemMovimentacao;
import bancoDentes.model.Movimentacao;
import bancoDentes.model.enumModels.TipoMovimentacao;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.ItemMovimentacaoRepository;
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
    private final ItemMovimentacaoRepository itemMovimentacaoRepository;
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

        return List.of(salvarMovimentacaoEntrada(dto));
    }

    /**
     * Cria uma única movimentação vinculada ao frasco destino.
     * @param dto
     */
    private Movimentacao salvarMovimentacaoEntrada(MovimentacaoDTO dto) throws MovimentacaoException {

        Frasco frascoDestino = frascoRepository.findById(dto.codFrasco())
                .orElseThrow(() ->  new MovimentacaoException(getText("error.frasco.naoEncontrado")));

        Movimentacao movimentacao = dto.mapearMovimentacao(frascoDestino);
        long quantidadeTotal = processarItensEQuantidadeEntrada(dto, movimentacao);
        movimentacao.setQuantidade(quantidadeTotal);

        frascoDestino.emManutencao();
        frascoRepository.save(frascoDestino);

        return movimentacaoRepository.save(movimentacao);
    }

    /**
     * Processa os frascos de origem para movimentações de Entrada.
     * @param dto
     * @param movimentacao
     */
    private long processarItensEQuantidadeEntrada(MovimentacaoDTO dto, Movimentacao movimentacao) throws MovimentacaoException {
        if (dto.itens() != null && !dto.itens().isEmpty()) {
            List<ItemMovimentacao> itensEntidade = new ArrayList<>();
            long quantidadeTotal = 0L;

            for (ItemMovimentacaoDTO itemDto : dto.itens()) {
                if (itemDto != null && itemDto.codFrasco() != null) {
                    Frasco frascoOrigem = frascoRepository.findById(itemDto.codFrasco())
                            .orElseThrow(() ->  new MovimentacaoException(getText("error.frasco.naoEncontrado")));

                    long qtdTransferida = (itemDto.quantidade() != null) ? itemDto.quantidade() : 0L;
                    quantidadeTotal += qtdTransferida;

                    ItemMovimentacao item = itemDto.mapearItemMovimentacao(frascoOrigem, movimentacao);
                    item.setQuantidade(qtdTransferida);
                    itensEntidade.add(item);

                    frascoOrigem.emManutencao();
                    frascoRepository.save(frascoOrigem);
                }
            }

            movimentacao.setItens(itensEntidade);
            return quantidadeTotal;
        }

        return (dto.quantidade() != null) ? dto.quantidade() : 0L;
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
                    Movimentacao movimentacao = new Movimentacao();

                    movimentacao.setTipoMovimentacao(TipoMovimentacao.SAIDA);
                    movimentacao.setDatMovimentacao(dto.datManutencao() != null ? dto.datManutencao().atStartOfDay() : LocalDateTime.now());
                    movimentacao.setLocal(dto.local());
                    movimentacao.setObservacao(dto.observacao());

                    movimentacao.setFrasco(frascoOrigem);
                    movimentacao.setQuantidade(qtdSaida);
                    movimentacao.setItens(new ArrayList<>());

                    frascoOrigem.emManutencao();
                    frascoRepository.save(frascoOrigem);

                    movimentacoesSalvas.add(movimentacaoRepository.save(movimentacao));
                }
            }
        }

        return movimentacoesSalvas;
    }
}