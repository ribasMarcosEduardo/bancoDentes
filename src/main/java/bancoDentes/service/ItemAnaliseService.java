package bancoDentes.service;

import bancoDentes.dto.ItemAnaliseDTO;
import bancoDentes.exception.AnaliseException;
import bancoDentes.exception.FrascoException;
import bancoDentes.exception.ItemAnaliseException;
import bancoDentes.exception.ItemNaoEncontradoException;
import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.model.Frasco;
import bancoDentes.model.ItemAnalise;
import bancoDentes.repository.AnaliseSolicitacaoRepository;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.ItemAnaliseRepository;
import bancoDentes.service.validator.ItemAnaliseValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service responsável por gerenciar os itens vinculados a um
 * processo de avaliação (Análise de Solicitação).
 * <p>
 * Atua na separação dos dentes que atenderão ao pedido do estudante,
 * permitindo que o avaliador associe ou desassocie frascos específicos
 * do estoque dentro de uma análise em andamento.
 *
 * @author Marcos Eduardo Ribas
 */
@Service
@RequiredArgsConstructor
public class ItemAnaliseService extends BaseService {

    private final ItemAnaliseRepository itemAnaliseRepository;
    private final ItemAnaliseValidator itemAnaliseValidator;
    private final FrascoRepository frascoRepository;
    private final AnaliseSolicitacaoRepository analiseSolicitacaoRepository;

    /**
     * Vincula um novo frasco a uma análise de solicitação.
     *
     * @param dto
     */
    @Transactional
    public ItemAnalise save(ItemAnaliseDTO dto) throws AnaliseException, FrascoException, ItemAnaliseException {
        ItemAnalise itemMapeado = dto.mapearItemSolicitacao();

        itemAnaliseValidator.validaItem(itemMapeado);

        Optional<ItemAnalise> itemExistente =
                itemAnaliseRepository.findByAnaliseSolicitacaoAndFrasco(
                        itemMapeado.getAnaliseSolicitacao(),
                        itemMapeado.getFrasco()
                );

        if (itemExistente.isPresent() && (itemMapeado.getQuantidade() == null || itemMapeado.getQuantidade() <= 0)) {
            this.removerItem(itemExistente.get().getCodigo());
        }

        ItemAnalise itemFinal = itemExistente.orElse(itemMapeado);
        itemFinal.setQuantidade(itemMapeado.getQuantidade());
        itemFinal.getAnaliseSolicitacao().emSeparacao();

        return itemAnaliseRepository.save(itemFinal);
    }

    /**
     * Recupera todos os itens que já foram separados e vinculados
     * a uma análise específica.
     *
     * @param codAnalise
     */
    public List<ItemAnalise> buscarItensPorAnalise(Long codAnalise) {
        return itemAnaliseRepository.findByAnaliseSolicitacaoCodigo(codAnalise);
    }

    /**
     * Desassocia um frasco do processo de análise.
     *
     * @param codItem
     */
    @Transactional
    public void removerItem(Long codItem) throws ItemNaoEncontradoException {
        ItemAnalise item = itemAnaliseRepository.findById(codItem)
                .orElseThrow(() -> new ItemNaoEncontradoException(this.getText("error.item.nao.encontrado")));

        itemAnaliseRepository.delete(item);
    }


}