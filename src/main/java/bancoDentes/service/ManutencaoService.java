package bancoDentes.service;

import bancoDentes.dto.ManutencaoDTO;
import bancoDentes.exception.ManutencaoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.Manutencao;
import bancoDentes.model.enumModels.OrigemManutencao;
import bancoDentes.model.enumModels.StatusFrasco;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.ManutencaoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    /**
     * Conclui a manutenção de um frasco, atualizando a sua quantidade final
     * e retornando-o ao status ATIVO. Após a conclusão, o registro de
     * manutenção é removido da fila.
     *
     * @param codManutencao
     * @param novaQuantidade
     */
    @Transactional
    public void concluirManutencao(Long codManutencao, Long novaQuantidade) throws ManutencaoException {

        Manutencao manutencao = manutencaoRepository.findById(codManutencao)
                .orElseThrow(() -> new ManutencaoException(getText("error.manutencao.naoEncontrado")));

        Frasco frasco = manutencao.getFrasco();
        frasco.setQuantidade(novaQuantidade);

        frasco.setDatCad(LocalDateTime.now());
        frasco.setDatManutencao(LocalDateTime.now().plusYears(1));

        frasco.setStatusFrasco(novaQuantidade == 0 ? StatusFrasco.INATIVO : StatusFrasco.DIS_IMPRESSAO);

        frascoRepository.save(frasco);

        manutencao.setStatusManutencao(bancoDentes.model.enumModels.StatusManutencao.FINALIZADA);
        manutencaoRepository.save(manutencao);
    }

    /**
     * Registra uma manutenção diretamente para o frasco, utilizando sua quantidade atual.
     */
    @Transactional
    public void registrarManutencaoDireta(Long codFrasco) throws ManutencaoException {
        Frasco frasco = frascoRepository.findById(codFrasco)
                .orElseThrow(() -> new ManutencaoException(getText("error.frasco.naoEncontrado")));

        if (frasco.isEmManutencao()) {
            throw new ManutencaoException(getText("error.manutencao.frascoJaEmManutencao"));
        }

        registrarManutencao(new ManutencaoDTO(
                frasco.getCodigo(),
                frasco.getQuantidade(),
                OrigemManutencao.MANUTENCAO
        ));

        frasco.emManutencao();
        frascoRepository.save(frasco);
    }
}
