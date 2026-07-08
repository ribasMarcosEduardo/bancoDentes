package bancoDentes.service;

import bancoDentes.dto.SolicitacaoDTO;
import bancoDentes.exception.EstudanteSolicitacaoException;
import bancoDentes.exception.FrascoException;
import bancoDentes.exception.SolicitacaoException;
import bancoDentes.exception.SolicitacaoNaoEncontradaException;
import bancoDentes.model.Estudante;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.StatusSolicitacao;
import bancoDentes.repository.EstudanteRepository;
import bancoDentes.repository.SolicitacaoRepository;
import bancoDentes.service.validator.SolicitacaoValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitacaoService extends BaseService{

    private final SolicitacaoRepository solicitacaoRepository;
    private final EstudanteRepository estudanteRepository; // Apenas teste
    private final SolicitacaoValidator solicitacaoValidator;

    @Transactional
    public Solicitacao save(SolicitacaoDTO solicitacaoDTO) throws SolicitacaoException {
        Estudante estudante = estudanteRepository.findById(2L)
                .orElseThrow(() -> new EstudanteSolicitacaoException(this.getText("error.estudante.nao.encontrado")));

        solicitacaoValidator.saveValidator(solicitacaoDTO, estudante);
        Solicitacao solicitacao = solicitacaoDTO.mapearSolicitacao(estudante);

        if (solicitacao.getCodigo() != null){
            Solicitacao solBanco = buscarPorCodigo(solicitacao.getCodigo());
            manipulaCredito(estudante, solBanco.getQuantidade(), solicitacao.getQuantidade());
            BeanUtils.copyProperties(solicitacao, solBanco, "codigo");
            solicitacao = solBanco;
        } else {
            manipulaCredito(estudante, 0L, solicitacao.getQuantidade());
        }

        return solicitacaoRepository.save(solicitacao);
    }

    public Solicitacao buscarPorCodigo(Long codSolicitacao) throws SolicitacaoException {
        return solicitacaoRepository.findById(codSolicitacao)
                .orElseThrow(() -> new SolicitacaoNaoEncontradaException(this.getText("error.solicitacao.nao.encontrada")));
    }

    @Transactional
    public void excluirSolicitacao(Long codigoSol) throws SolicitacaoException {
        Solicitacao solicitacao = buscarPorCodigo(codigoSol);
        manipulaCredito(solicitacao.getEstudante(), solicitacao.getQuantidade(), 0L);
        solicitacaoRepository.delete(solicitacao);
    }

    private void manipulaCredito(Estudante estudante, Long quantidadeAntiga, Long quantidadeNova){
        Long diferenca = quantidadeNova - quantidadeAntiga;
        estudante.setCredito(estudante.getCredito() - diferenca);
    }

    public List<Solicitacao> buscarPorEstudante(Long codEstudante) {
        return solicitacaoRepository.findByEstudante_CodEstudante(codEstudante);
    }

    public List<Solicitacao> listarSolicitacoes() {
        return solicitacaoRepository.findAll();
    }

    public List<Solicitacao> getSolicitacoesAptas() {
        List<Solicitacao> listaAptas = this.listarSolicitacoes().stream()
                .filter(Solicitacao::isApto)
                .toList();

        return listaAptas;
    }

    public long getPendentes(List<Solicitacao> solicitacoes) {
        return solicitacoes.stream()
                .filter(s -> s.getStatusSolicitacao() == StatusSolicitacao.PENDENTE)
                .count();
    }

    public long getConcluidas(List<Solicitacao> solicitacoes) {
        return solicitacoes.stream()
                .filter(s -> s.getStatusSolicitacao() == StatusSolicitacao.FINALIZADO)
                .count();
    }

}
