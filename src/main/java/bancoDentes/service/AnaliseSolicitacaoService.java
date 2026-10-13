package bancoDentes.service;

import bancoDentes.dto.AnaliseSolicitacaoDTO;
import bancoDentes.dto.ManutencaoDTO;
import bancoDentes.exception.AnaliseException;
import bancoDentes.exception.AnaliseNaoEncontradaException;
import bancoDentes.exception.SolicitacaoException;
import bancoDentes.model.*;
import bancoDentes.model.enumModels.OrigemManutencao;
import bancoDentes.repository.AnaliseSolicitacaoRepository;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.ItemAnaliseRepository;
import bancoDentes.service.validator.ItemAnaliseValidator;
import bancoDentes.service.validator.SolicitacaoValidator;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
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
    private final ManutencaoService manutencaoService;
    private final SolicitacaoValidator solicitacaoValidator;
    private final ItemAnaliseValidator itemAnaliseValidator;
    private final AnaliseSolicitacaoRepository analiseSolicitacaoRepository;
    private final FrascoRepository frascoRepository;
    private final ItemAnaliseRepository itemAnaliseRepository;

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

        creditoService.manipulaCredito(analise.getSolicitacao().getUsuario(),
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
        Usuario est = sol.getUsuario();

        solicitacaoValidator.validaCreditos(est.getCredito(), sol.getQuantidade());
        creditoService.manipulaCredito(est, 0L, sol.getQuantidade());

        analise.reabrir();

        return analiseSolicitacaoRepository.save(analise);
    }

    /**
     * Altera o status da solicitação para aguardando retirada e gera as manutenções
     * para os frascos cujos dentes foram separados nesta análise.
     *
     * @param codSolicitacao
     */
    @Transactional(rollbackFor = Exception.class)
    public AnaliseSolicitacao aguardandoRetirada(final Long codSolicitacao) throws Exception {
        AnaliseSolicitacao analise = this.save(codSolicitacao);

        Solicitacao solicitacao = analise.getSolicitacao();
        solicitacao.aguardandoRetirada();

        List<ItemAnalise> itensSeparados = itemAnaliseRepository.findByAnaliseSolicitacaoCodigo(analise.getCodigo());

        itemAnaliseValidator.validaItensSelecao(itensSeparados);

        for (ItemAnalise item : itensSeparados) {
            Frasco frasco = item.getFrasco();

            long novaQuantidade = frasco.getQuantidade() - item.getQuantidade();
            novaQuantidade = Math.max(0L, novaQuantidade);

            frasco.setQuantidade(novaQuantidade);

            manutencaoService.registrarManutencao(new ManutencaoDTO(
                    frasco.getCodigo(),
                    novaQuantidade,
                    OrigemManutencao.SOLICITACAO
            ));

            if (novaQuantidade == 0L) {
                frasco.inativo();
            } else {
                frasco.emManutencao();
            }

            frascoRepository.save(frasco);
        }

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