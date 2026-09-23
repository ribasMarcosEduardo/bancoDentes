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
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
     * Regra para ENTRADA: Cria uma única movimentação vinculada ao frasco destino.
     */
    private Movimentacao salvarMovimentacaoEntrada(MovimentacaoDTO dto) throws MovimentacaoException {

        Frasco frascoDestino = frascoRepository.findById(dto.codFrasco())
                .orElseThrow(() ->  new MovimentacaoException(getText("error.frasco.naoEncontrado")));

        Movimentacao movimentacao = dto.mapearMovimentacao(frascoDestino);
        long quantidadeTotal = processarItensEQuantidadeEntrada(dto, movimentacao);
        movimentacao.setQuantidade(quantidadeTotal);

        return movimentacaoRepository.save(movimentacao);
    }

    /**
     * Processa os frascos de origem para movimentações de ENTRADA.
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
                }
            }

            movimentacao.setItens(itensEntidade);
            return quantidadeTotal;
        }

        return (dto.quantidade() != null) ? dto.quantidade() : 0L;
    }

    /**
     * Regra para SAÍDA: Gera um registro de Movimentação para CADA frasco selecionado.
     */
    private List<Movimentacao> salvarMovimentacaoSaida(MovimentacaoDTO dto) throws MovimentacaoException {
        List<Movimentacao> movimentacoesSalvas = new ArrayList<>();

        if (dto.itens() != null && !dto.itens().isEmpty()) {
            for (ItemMovimentacaoDTO itemDto : dto.itens()) {
                if (itemDto != null && itemDto.codFrasco() != null) {
                    Frasco frasco = frascoRepository.findById(itemDto.codFrasco())
                            .orElseThrow(() -> new EntityNotFoundException("Frasco não encontrado com o ID: " + itemDto.codFrasco()));

                    Movimentacao movSaida = new Movimentacao();
                    movSaida.setTipoMovimentacao(TipoMovimentacao.SAIDA);
                    movSaida.setDatMovimentacao(dto.datManutencao() != null ? dto.datManutencao().atStartOfDay() : LocalDateTime.now());
                    movSaida.setLocal(dto.local());
                    movSaida.setObservacao(dto.observacao());
                    movSaida.setFrasco(frasco);
                    movSaida.setQuantidade(itemDto.quantidade() != null ? itemDto.quantidade() : 0L);

                    movimentacoesSalvas.add(movimentacaoRepository.save(movSaida));
                }
            }
        }
        return movimentacoesSalvas;
    }
}