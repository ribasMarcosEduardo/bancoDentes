package bancoDentes.service;

import bancoDentes.dto.ItemAnaliseDTO;
import bancoDentes.exception.AnaliseException;
import bancoDentes.exception.ItemAnaliseException;
import bancoDentes.exception.ItemNaoEncontradoException;
import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.model.Frasco;
import bancoDentes.model.ItemAnalise;
import bancoDentes.repository.AnaliseSolicitacaoRepository;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.ItemAnaliseRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemAnaliseService extends BaseService {

    private final ItemAnaliseRepository itemAnaliseRepository;
    private final FrascoRepository frascoRepository;
    private final AnaliseSolicitacaoRepository analiseSolicitacaoRepository;

    @Transactional
    public ItemAnalise save(ItemAnaliseDTO dto) throws AnaliseException {
        ItemAnalise itemAnalise = dto.mapearItemSolicitacao();

        AnaliseSolicitacao analiseRef = analiseSolicitacaoRepository.findById(itemAnalise.getAnaliseSolicitacao().getCodigo())
                .orElseThrow(() -> new AnaliseException(this.getText("error.analise.nao.encontrada")));

        Frasco frascoRef = frascoRepository.findById(itemAnalise.getFrasco().getCodigo())
                .orElseThrow(() -> new AnaliseException(this.getText("error.frasco.nao.encontrado")));

        itemAnalise.setAnaliseSolicitacao(analiseRef);
        itemAnalise.setFrasco(frascoRef);

        return itemAnaliseRepository.save(itemAnalise);
    }

    public List<ItemAnalise> buscarItensPorAnalise(Long codAnalise) {
        return itemAnaliseRepository.findByAnaliseSolicitacaoCodigo(codAnalise);
    }

    public void removerItem(Long codItem) throws ItemNaoEncontradoException {
        ItemAnalise item = itemAnaliseRepository.findById(codItem)
                .orElseThrow(() -> new ItemNaoEncontradoException(this.getText("error.item.nao.encontrado")));

        itemAnaliseRepository.delete(item);
    }

}
