package bancoDentes.service;

import bancoDentes.dto.ManutencaoDTO;
import bancoDentes.exception.ManutencaoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.Manutencao;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.ManutencaoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service responsável por gerenciar as regras de negócio referente
 * as manutenções.
 *
 * @author Marcos Eduardo Ribas
 */
@Service
@RequiredArgsConstructor
public class ManutencaoService extends BaseService{

    private final ManutencaoRepository manutencaoRepository;
    private final FrascoRepository frascoRepository;

    /**
     * Recupera todas as manutenções cadastrados no sistema.
     */
    public List<Manutencao> getManutencao() {
        return manutencaoRepository.findAll();
    }

    /**
     * Método centralizado para registrar uma Manutenção no sistema.
     * Pode ser chamado por qualquer outro Service (Movimentacao, Solicitacao, etc).
     */
    @Transactional
    public Manutencao registrarManutencao(ManutencaoDTO dto) throws ManutencaoException {

        Frasco frasco = frascoRepository.findById(dto.codFrasco())
                .orElseThrow(() -> new ManutencaoException(getText("error.frasco.naoEncontrado")));

        Manutencao manutencao = dto.mapearManutencao(frasco);

        return manutencaoRepository.save(manutencao);
    }
}
