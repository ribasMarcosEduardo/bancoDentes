package bancoDentes.service;

import bancoDentes.dto.AnaliseSolicitacaoDTO;
import bancoDentes.exception.AnaliseExeption;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.model.Frasco;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.StatusSolicitacao;
import bancoDentes.repository.AnaliseSolicitacaoRepository;
import bancoDentes.repository.SolicitacaoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnaliseSolicitacaoService {

    private final SolicitacaoService solicitacaoService;
    private final AnaliseSolicitacaoRepository analiseSolicitacaoRepository;

    @Transactional
    public AnaliseSolicitacao save(final Long codSolicitacao) {
            return analiseSolicitacaoRepository.findBySolicitacaoCodigo(codSolicitacao)
                    .orElseGet(() -> iniciaNovaAnalise(codSolicitacao));
    }

    private AnaliseSolicitacao iniciaNovaAnalise(final Long codSolicitacao) {
            Solicitacao solicitacao = solicitacaoService.buscarPorCodigo(codSolicitacao);
            solicitacao.iniciarAnalise();

            AnaliseSolicitacao analise = new AnaliseSolicitacao();
            analise.setSolicitacao(solicitacao);

            return analiseSolicitacaoRepository.save(analise);
    }

    @Transactional
    public AnaliseSolicitacao rejeitarSolicitacao(final AnaliseSolicitacaoDTO analiseSolicitacaoDTO) {
        AnaliseSolicitacao analise = analiseSolicitacaoRepository
                .findById(analiseSolicitacaoDTO.codigo())
                .orElseThrow(() -> new AnaliseExeption("Análise não encontrada!"));

        analise.rejeitar(analiseSolicitacaoDTO.justificativa());

        return analiseSolicitacaoRepository.save(analise);
    }

    @Transactional
    public AnaliseSolicitacao reabrirSolicitacao(final AnaliseSolicitacaoDTO analiseSolicitacaoDTO) {
        AnaliseSolicitacao  analise = analiseSolicitacaoRepository
                    .findBySolicitacaoCodigo(analiseSolicitacaoDTO.solicitacao().getCodigo())
                    .orElseThrow(() -> new AnaliseExeption("Análise não encontrada para esta solicitação!"));

        analise.reabrir();

        return analiseSolicitacaoRepository.save(analise);
    }

    public AnaliseSolicitacao buscarPorCodSolicitacao(Long codSolicitacao) {
        return analiseSolicitacaoRepository.findBySolicitacaoCodigo(codSolicitacao)
                .orElseThrow(() -> new AnaliseExeption("Solicitação não encontrado"));
    }

    public AnaliseSolicitacao buscarPorCodAnalise(Long codAnalise) {
        return analiseSolicitacaoRepository.findById(codAnalise)
                .orElseThrow(() -> new AnaliseExeption("Não foi encontrado analise para esse código!"));
    }


}
