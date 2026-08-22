package bancoDentes.service;

import bancoDentes.dto.AnaliseSolicitacaoDTO;
import bancoDentes.exception.AnaliseException;
import bancoDentes.exception.AnaliseNaoEncontradaException;
import bancoDentes.exception.SolicitacaoException;
import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.model.Estudante;
import bancoDentes.model.Solicitacao;
import bancoDentes.repository.AnaliseSolicitacaoRepository;
import bancoDentes.service.validator.SolicitacaoValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service responsável por gerenciar o fluxo de avaliação (Análise) das
 * solicitações de dentes feitas pelos estudantes.
 *
 * @author Marcos Eduardo Ribas
 */
@Service
@RequiredArgsConstructor
public class AnaliseSolicitacaoService extends BaseService {

    private final SolicitacaoService solicitacaoService;
    private final CreditoService creditoService;
    private final AnaliseSolicitacaoRepository analiseSolicitacaoRepository;
    private final SolicitacaoValidator solicitacaoValidator;

    /**
     * Busca uma análise existente vinculada à solicitação ou inicia uma nova análise
     * caso ela ainda não exista.
     *
     * @param codSolicitacao
     */
    public AnaliseSolicitacao save(final Long codSolicitacao) throws AnaliseException, SolicitacaoException {
        Optional<AnaliseSolicitacao> analise = analiseSolicitacaoRepository.findBySolicitacaoCodigo(codSolicitacao);

        if (analise.isPresent()) {
            return analise.get();
        }

        return iniciaNovaAnalise(codSolicitacao);
    }

    /**
     * Instancia e persiste uma nova análise para uma solicitação e altera o
     * status da solicitação associada para "EM ANÁLISE".
     *
     * @param codSolicitacao
     */
    @Transactional
    private AnaliseSolicitacao iniciaNovaAnalise(final Long codSolicitacao) throws SolicitacaoException {
        Solicitacao solicitacao = solicitacaoService.buscarPorCodigo(codSolicitacao);
        solicitacao.iniciarAnalise();

        AnaliseSolicitacao analise = new AnaliseSolicitacao();
        analise.setSolicitacao(solicitacao);

        return analiseSolicitacaoRepository.save(analise);
    }

    /**
     * Processa a negação de uma solicitação por parte do analista.
     *
     * @param analiseSolicitacaoDTO
     */
    @Transactional
    public AnaliseSolicitacao negarSolicitacao(final AnaliseSolicitacaoDTO analiseSolicitacaoDTO) throws AnaliseException, SolicitacaoException {
        Long codSolicitacao = analiseSolicitacaoDTO.solicitacao().getCodigo();
        AnaliseSolicitacao analise = this.save(codSolicitacao);

        creditoService.manipulaCredito(analise.getSolicitacao().getEstudante(),
                analise.getSolicitacao().getQuantidade(), 0L);

        analise.negar(analiseSolicitacaoDTO.justificativa());
        return analiseSolicitacaoRepository.save(analise);
    }

    /**
     * Reabre uma solicitação que estava anteriormente fechada ou negada, devolvendo-a
     * ao processo de avaliação.
     *
     * @param analiseSolicitacaoDTO
     */
    @Transactional
    public AnaliseSolicitacao reabrirSolicitacao(final AnaliseSolicitacaoDTO analiseSolicitacaoDTO) throws AnaliseException, SolicitacaoException {
        AnaliseSolicitacao analise = analiseSolicitacaoRepository
                .findBySolicitacaoCodigo(analiseSolicitacaoDTO.solicitacao().getCodigo())
                .orElseThrow(() -> new AnaliseNaoEncontradaException(this.getText("error.analise.nao.encontrada")));

        Solicitacao sol = analise.getSolicitacao();
        Estudante est = sol.getEstudante();

        solicitacaoValidator.validaCreditos(est.getCredito(), sol.getQuantidade());
        creditoService.manipulaCredito(est, 0L, sol.getQuantidade());

        analise.reabrir();

        return analiseSolicitacaoRepository.save(analise);
    }

    /**
     * Altera o status da solicitação para aguardando retirada.
     *
     * @param codSolicitacao
     */
    @Transactional
    public AnaliseSolicitacao aguardandoRetirada(final Long codSolicitacao) throws AnaliseException, SolicitacaoException {
        AnaliseSolicitacao analise = this.save(codSolicitacao);

        Solicitacao solicitacao = analise.getSolicitacao();
        solicitacao.aguardandoRetirada();

        return analiseSolicitacaoRepository.save(analise);
    }

    /**
     * Conclui o processo de análise da solicitação.
     *
     * @param codSolicitacao
     */
    @Transactional
    public AnaliseSolicitacao concluirSolicitacao(final Long codSolicitacao) throws AnaliseException, SolicitacaoException {
        AnaliseSolicitacao analise = this.save(codSolicitacao);

        Solicitacao solicitacao = analise.getSolicitacao();
        solicitacao.concluir();

        return analiseSolicitacaoRepository.save(analise);
    }

    /**
     * Recupera o processo de análise utilizando o código da solicitação associada.
     *
     * @param codSolicitacao
     */
    public AnaliseSolicitacao buscarPorCodSolicitacao(Long codSolicitacao) throws AnaliseException {
        return analiseSolicitacaoRepository.findBySolicitacaoCodigo(codSolicitacao)
                .orElseThrow(() -> new AnaliseNaoEncontradaException(this.getText("error.solicitacao.nao.encontrada")));
    }

    /**
     * Recupera o processo de análise através do seu próprio código.
     *
     * @param codAnalise
     */
    public AnaliseSolicitacao buscarPorCodAnalise(Long codAnalise) throws AnaliseException {
        return analiseSolicitacaoRepository.findById(codAnalise)
                .orElseThrow(() -> new AnaliseNaoEncontradaException(this.getText("error.analise.nao.encontrada")));
    }

}