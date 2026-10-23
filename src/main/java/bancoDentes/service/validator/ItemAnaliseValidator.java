package bancoDentes.service.validator;

import bancoDentes.exception.AnaliseException;
import bancoDentes.exception.FrascoException;
import bancoDentes.exception.SolicitacaoException;
import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.model.Frasco;
import bancoDentes.model.ItemAnalise;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.Local;
import bancoDentes.repository.AnaliseSolicitacaoRepository;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.ItemAnaliseRepository;
import bancoDentes.service.BaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Componente responsável por centralizar e aplicar as regras de negócio e de
 * validação para a entidade ItemAnalise.
 *
 * @author Marcos Eduardo Ribas
 */
@Component
@RequiredArgsConstructor
public class ItemAnaliseValidator extends BaseService {

    private final AnaliseSolicitacaoRepository analiseSolicitacaoRepository;
    private final FrascoRepository frascoRepository;

    public void validaItem(ItemAnalise itemAnalise) throws AnaliseException, FrascoException {
        if (itemAnalise.getQuantidade() != null && itemAnalise.getQuantidade() > 0) {
            AnaliseSolicitacao analise = analiseSolicitacaoRepository
                    .findById(itemAnalise.getAnaliseSolicitacao().getCodigo())
                    .orElseThrow(() -> new AnaliseException(getText("error.analise.nao.encontrada")));

            Frasco frasco = frascoRepository
                    .findById(itemAnalise.getFrasco().getCodigo())
                    .orElseThrow(() -> new FrascoException(getText("error.frasco.nao.encontrado")));

            // Solicitação é sempre retirada no Banco de Dentes Humanos
            if (frasco.getLocal() != Local.BDH) {
                throw new AnaliseException(getText("error.item.localInvalido"));
            }

            itemAnalise.setAnaliseSolicitacao(analise);
            itemAnalise.setFrasco(frasco);
        }
    }

    public void validaItensSelecao(List<ItemAnalise> itensSeparados) throws AnaliseException {
        if (itensSeparados.isEmpty()) {
            throw new AnaliseException(getText("error.item.naoInformado"));
        }
    }

}
