package bancoDentes.service;

import bancoDentes.dto.MovimentacaoDTO;
import bancoDentes.exception.MovimentacaoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.ItemMovimentacao;
import bancoDentes.model.Movimentacao;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.ItemMovimentacaoRepository;
import bancoDentes.repository.MovimentacaoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
    public Movimentacao save(MovimentacaoDTO dto) throws MovimentacaoException {

        Frasco frasco = frascoRepository.findById(dto.codFrasco())
                .orElseThrow(() -> new MovimentacaoException(getText("error.frasco.naoEncontrado")));

        Movimentacao movimentacao = dto.mapearMovimentacao(frasco);

        // 3. Mapeia e vincula a lista de itens caso existam
        if (dto.itens() != null && !dto.itens().isEmpty()) {
            List<ItemMovimentacao> itensEntidade = dto.itens().stream()
                    .filter(itemDto -> itemDto != null && itemDto.codFrasco() != null)
                    .map(itemDto -> {
                        Frasco frascoItem = frascoRepository.findById(itemDto.codFrasco())
                                .orElseThrow(() -> new EntityNotFoundException("Frasco do item não encontrado com o ID: " + itemDto.codFrasco()));
                        return itemDto.mapearItemMovimentacao(frascoItem, movimentacao);
                    })
                    .collect(Collectors.toList());

            movimentacao.setItens(itensEntidade);
        }

        return movimentacaoRepository.save(movimentacao);
    }
}