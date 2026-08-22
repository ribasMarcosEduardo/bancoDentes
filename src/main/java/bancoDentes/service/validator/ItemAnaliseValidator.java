package bancoDentes.service.validator;

import bancoDentes.exception.AnaliseException;
import bancoDentes.exception.FrascoException;
import bancoDentes.exception.SolicitacaoException;
import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.model.Frasco;
import bancoDentes.model.ItemAnalise;
import bancoDentes.model.Solicitacao;
import bancoDentes.repository.AnaliseSolicitacaoRepository;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.ItemAnaliseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Componente responsável por centralizar e aplicar as regras de negócio e de
 * validação para a entidade ItemAnalise.
 *
 * @author Marcos Eduardo Ribas
 */
@Component
@RequiredArgsConstructor
public class ItemAnaliseValidator {

    private final AnaliseSolicitacaoRepository analiseSolicitacaoRepository;
    private final FrascoRepository frascoRepository;

    public void validaItem(ItemAnalise itemAnalise) throws AnaliseException, FrascoException {
        if (itemAnalise.getQuantidade() != null && itemAnalise.getQuantidade() > 0) {
            AnaliseSolicitacao analise = analiseSolicitacaoRepository
                    .findById(itemAnalise.getAnaliseSolicitacao().getCodigo())
                    .orElseThrow(() -> new AnaliseException("error.analise.nao.encontrada"));

            Frasco frasco = frascoRepository
                    .findById(itemAnalise.getFrasco().getCodigo())
                    .orElseThrow(() -> new FrascoException("error.frasco.nao.encontrado"));

            itemAnalise.setAnaliseSolicitacao(analise);
            itemAnalise.setFrasco(frasco);
        }
    }
}
