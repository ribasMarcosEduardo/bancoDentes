package bancoDentes.service;

import bancoDentes.dto.FrascoDTO;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.StatusFrasco;
import bancoDentes.repository.FrascoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service responsável por centralizar as regras de negócio e operações
 * relacionadas à entidade Frasco
 *
 * @author Marcos Eduardo Ribas
 */
@Service
@RequiredArgsConstructor
public class FrascoService extends BaseService{

    private final FrascoRepository frascoRepository;

    /**
     * Salva um novo frasco ou atualiza um frasco já existente no banco de dados.
     *
     * @param frascoDTO
     */
    @Transactional
    public Frasco save(FrascoDTO frascoDTO) {
        Frasco frasco = frascoDTO.mapearFrasco();

        if (frasco.getCodigo() != null) {
            Frasco frascoDoBanco = buscarPorId(frasco.getCodigo());
            BeanUtils.copyProperties(frasco, frascoDoBanco, "codigo", "identificacao");
            frasco = frascoDoBanco;
        }

        frasco = frascoRepository.save(frasco);
        frasco.gerarIdentificacao();
        return frascoRepository.save(frasco);
    }

    /**
     * Recupera todos os frascos cadastrados no sistema.
     */
    public List<Frasco> getFrascos() {
        return frascoRepository.findAll();
    }

    /**
     * Recupera todos os frascos com base no status do frasco.
     */
    public List<Frasco> getFrascosPorStatusFrasco(StatusFrasco statusFrasco) {
        return frascoRepository.findByStatusFrasco(statusFrasco);
    }
    /**
     * Recupera todos os frascos disponíveis no sistema.
     */
    public List<Frasco> getFrascosDisponiveis() {
        return frascoRepository.findFrascosDisponiveis();
    }

    /**
     * Busca um frasco específico no banco de dados a partir do seu código
     *
     * @param codFrasco
     */
    public Frasco buscarPorId(Long codFrasco) {
        return frascoRepository.findById(codFrasco)
                .orElseThrow(() -> new FrascoException(this.getText("error.frasco.naoEncontrado")));
    }

    /**
     * Exclui frasco com base no código.
     *
     * @param codigoFrasco
     */
    public void excluirFrasco(Long codigoFrasco) {
        frascoRepository.deleteById(codigoFrasco);
    }

    public List<Frasco> getFrascosFiltrados(Solicitacao solicitacao) {
        return frascoRepository.getFrascosFiltrados(
                solicitacao.getTipoDente(),
                solicitacao.getDenticao(),
                solicitacao.getArcada(),
                solicitacao.getEstado()
        );
    }

}
