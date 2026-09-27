package bancoDentes.service;

import bancoDentes.model.Manutencao;
import bancoDentes.repository.ManutencaoRepository;
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

    final private ManutencaoRepository manutencaoRepository;

    /**
     * Recupera todas as manutenções cadastrados no sistema.
     */
    public List<Manutencao> getManutencao() {
        return manutencaoRepository.findAll();
    }
}
