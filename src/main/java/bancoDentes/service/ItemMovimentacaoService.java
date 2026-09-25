package bancoDentes.service;

import bancoDentes.dto.ItemMovimentacaoDTO;
import bancoDentes.exception.AnaliseException;
import bancoDentes.exception.FrascoException;
import bancoDentes.exception.ItemAnaliseException;
import bancoDentes.exception.ItemNaoEncontradoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.ItemMovimentacao;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.ItemMovimentacaoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service responsável por gerenciar os itens vinculados a um
 * processo de movimentação.
 *
 * @author Marcos Eduardo Ribas
 */
@Service
@RequiredArgsConstructor
public class ItemMovimentacaoService extends BaseService {

    private final ItemMovimentacaoRepository itemMovimentacaoRepository;
    private final FrascoRepository frascoRepository;

    /**
     * Vincula um novo frasco a uma análise de solicitação.
     *
     * @param dto
     */
    @Transactional
    public ItemMovimentacao save(ItemMovimentacaoDTO dto) throws AnaliseException, FrascoException, ItemAnaliseException {
        Frasco frasco = frascoRepository.findById(dto.codFrasco())
                .orElseThrow(() -> new FrascoException(this.getText("error.frasco.nao.encontrado")));

        ItemMovimentacao itemMovimentacao = dto.mapearItemMovimentacao(frasco);

        Optional<ItemMovimentacao> itemExistente =
                itemMovimentacaoRepository.findByMovimentacaoAndFrasco(
                        itemMovimentacao.getMovimentacao(),
                        itemMovimentacao.getFrasco()
                );

        if (itemExistente.isPresent() && (itemMovimentacao.getQuantidade() == null || itemMovimentacao.getQuantidade() <= 0)) {
            this.removerItem(itemExistente.get().getCodigo());
            return null;
        }

        ItemMovimentacao itemFinal = itemExistente.orElse(itemMovimentacao);
        itemFinal.setQuantidade(itemMovimentacao.getQuantidade());

        return itemMovimentacaoRepository.save(itemFinal);
    }

    /**
     * Desassocia um frasco do processo de análise.
     * @param codItem
     */
    @Transactional
    public void removerItem(Long codItem) throws ItemNaoEncontradoException {
        ItemMovimentacao item = itemMovimentacaoRepository.findById(codItem)
                .orElseThrow(() -> new ItemNaoEncontradoException(this.getText("error.item.nao.encontrado")));

        itemMovimentacaoRepository.delete(item);
    }
}