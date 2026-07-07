package bancoDentes.service;

import bancoDentes.dto.AnaliseSolicitacaoDTO;
import bancoDentes.exception.AnaliseException;
import bancoDentes.exception.AnaliseNaoEncontradaException;
import bancoDentes.exception.SolicitacaoException;
import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.model.Solicitacao;
import bancoDentes.repository.AnaliseSolicitacaoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AnaliseSolicitacaoService extends BaseService {

    private final SolicitacaoService solicitacaoService;
    private final AnaliseSolicitacaoRepository analiseSolicitacaoRepository;

    public AnaliseSolicitacao save(final Long codSolicitacao) throws AnaliseException, SolicitacaoException {
        Optional<AnaliseSolicitacao> analise = analiseSolicitacaoRepository.findBySolicitacaoCodigo(codSolicitacao);

        if (analise.isPresent()) {
            return analise.get();
        }

        return iniciaNovaAnalise(codSolicitacao);
    }

    @Transactional
    private AnaliseSolicitacao iniciaNovaAnalise(final Long codSolicitacao) throws SolicitacaoException {
            Solicitacao solicitacao = solicitacaoService.buscarPorCodigo(codSolicitacao);
            solicitacao.iniciarAnalise();

            AnaliseSolicitacao analise = new AnaliseSolicitacao();
            analise.setSolicitacao(solicitacao);

            return analiseSolicitacaoRepository.save(analise);
    }

    @Transactional
    public AnaliseSolicitacao rejeitarSolicitacao(final AnaliseSolicitacaoDTO analiseSolicitacaoDTO) throws AnaliseException {
        AnaliseSolicitacao analise = analiseSolicitacaoRepository
                .findById(analiseSolicitacaoDTO.codigo())
                .orElseThrow(() -> new AnaliseNaoEncontradaException(this.getText("error.analise.nao.encontrada")));

        analise.rejeitar(analiseSolicitacaoDTO.justificativa());

        return analiseSolicitacaoRepository.save(analise);
    }

    @Transactional
    public AnaliseSolicitacao reabrirSolicitacao(final AnaliseSolicitacaoDTO analiseSolicitacaoDTO) throws AnaliseException {
        AnaliseSolicitacao analise = analiseSolicitacaoRepository
                .findBySolicitacaoCodigo(analiseSolicitacaoDTO.solicitacao().getCodigo())
                .orElseThrow(() -> new AnaliseNaoEncontradaException(this.getText("error.analise.nao.encontrada")));

        analise.reabrir();

        return analiseSolicitacaoRepository.save(analise);
    }

    public AnaliseSolicitacao buscarPorCodSolicitacao(Long codSolicitacao) throws AnaliseException {
        return analiseSolicitacaoRepository.findBySolicitacaoCodigo(codSolicitacao)
                .orElseThrow(() -> new AnaliseNaoEncontradaException(this.getText("error.solicitacao.nao.encontrada")));
    }

    public AnaliseSolicitacao buscarPorCodAnalise(Long codAnalise) throws AnaliseException {
        return analiseSolicitacaoRepository.findById(codAnalise)
                .orElseThrow(() -> new AnaliseNaoEncontradaException(this.getText("error.analise.nao.encontrada")));
    }


}
