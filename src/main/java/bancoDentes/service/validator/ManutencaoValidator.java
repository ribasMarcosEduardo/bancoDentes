package bancoDentes.service.validator;

import bancoDentes.exception.ManutencaoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.Manutencao;
import bancoDentes.model.enumModels.StatusManutencao;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.ManutencaoRepository;
import bancoDentes.service.BaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente responsável por centralizar e aplicar as regras de negócio e de
 * validação para a entidade Manutenção.
 *
 * @author Marcos Eduardo Ribas
 */
@Component
@RequiredArgsConstructor
public class ManutencaoValidator extends BaseService {

    private final FrascoRepository frascoRepository;
    private final ManutencaoRepository manutencaoRepository;

    public Manutencao validarConclusaoManutencao(Long codManutencao, Long novaQuantidade) throws ManutencaoException {
        Manutencao manutencao = manutencaoRepository.findById(codManutencao)
                .orElseThrow(() -> new ManutencaoException(getText("error.manutencao.naoEncontrado")));

        if (manutencao.getStatusManutencao() != StatusManutencao.EM_ABERTO) {
            throw new ManutencaoException(getText("error.manutencao.jaFinalizada"));
        }

        Frasco frasco = manutencao.getFrasco();
        long quantidadeAtual = frasco.getQuantidade() != null ? frasco.getQuantidade() : 0L;

        // A conclusão só pode manter ou reduzir (descarte); aumento passa por movimentação
        if (novaQuantidade == null || novaQuantidade < 0 || novaQuantidade > quantidadeAtual) {
            throw new ManutencaoException(getText("error.manutencao.quantidadeInvalida", quantidadeAtual));
        }

        return manutencao;
    }

    public Frasco validarRegistroManutencaoDireta(Long codFrasco) throws ManutencaoException {
        Frasco frasco = frascoRepository.findById(codFrasco)
                .orElseThrow(() -> new ManutencaoException(getText("error.frasco.naoEncontrado")));

        if (frasco.isEmManutencao()) {
            throw new ManutencaoException(getText(getText("error.manutencao.frascoJaEmManutencao")));
        }
        if (frasco.isInativo()) {
            throw new ManutencaoException(getText(getText("error.manutencao.frascoInativo")));
        }

        return frasco;
    }
}