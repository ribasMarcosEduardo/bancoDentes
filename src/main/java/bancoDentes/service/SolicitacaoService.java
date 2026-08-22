package bancoDentes.service;

import bancoDentes.dto.SolicitacaoDTO;
import bancoDentes.exception.EstudanteSolicitacaoException;
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

/**
 * Serviço responsável por centralizar as regras de negócio e operações
 * relacionadas às solicitações
 * @author Marcos Eduardo Ribas
 */
@Service
@RequiredArgsConstructor
public class SolicitacaoService extends BaseService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final EstudanteRepository estudanteRepository; // TODO: Apenas teste, remover ao implementar Spring Security
    private final SolicitacaoValidator solicitacaoValidator;
    private final CreditoService creditoService;

    /**
     * Salva uma nova solicitação ou atualiza uma já existente no banco de dados.
     * O método primeiro resgata o estudantee aplica
     * as regras de validação. Caso seja uma atualização, ele recalcula a diferença
     * de créditos caso a quantidade de dentes solicitados tenha mudado. Caso seja uma
     * nova solicitação, ele debita integralmente os créditos necessários.
     *
     * @param solicitacaoDTO
     */
    @Transactional
    public Solicitacao save(SolicitacaoDTO solicitacaoDTO) throws SolicitacaoException {
        Estudante estudante = estudanteRepository.findById(2L)
                .orElseThrow(() -> new EstudanteSolicitacaoException(this.getText("error.estudante.nao.encontrado")));

        solicitacaoValidator.saveValidator(solicitacaoDTO, estudante);
        Solicitacao solicitacao = solicitacaoDTO.mapearSolicitacao(estudante);

        if (solicitacao.getCodigo() != null) {
            Solicitacao solBanco = buscarPorCodigo(solicitacao.getCodigo());
            if (!solBanco.getQuantidade().equals(solicitacao.getQuantidade())) {
                creditoService.manipulaCredito(estudante, solBanco.getQuantidade(), solicitacao.getQuantidade());
            }
            BeanUtils.copyProperties(solicitacao, solBanco, "codigo", "statusSolicitacao", "datSolicitacao");
            solicitacao = solBanco;
        } else {
            creditoService.manipulaCredito(estudante, 0L, solicitacao.getQuantidade());
        }

        return solicitacaoRepository.save(solicitacao);
    }

    /**
     * Busca uma solicitação específica no banco de dados a partir do seu código.
     * @param codSolicitacao
     */
    public Solicitacao buscarPorCodigo(Long codSolicitacao) throws SolicitacaoException {
        return solicitacaoRepository.findById(codSolicitacao)
                .orElseThrow(() -> new SolicitacaoNaoEncontradaException(this.getText("error.solicitacao.nao.encontrada")));
    }

    /**
     * Exclui uma solicitação do banco de dados, desde que ela atenda aos
     * critérios de exclusão estabelecidos pelo validador.
     * @param codigoSol
     */
    @Transactional
    public void excluirSolicitacao(Long codigoSol) throws SolicitacaoException {
        Solicitacao solicitacao = buscarPorCodigo(codigoSol);
        solicitacaoValidator.exclusaoValidator(solicitacao);
        creditoService.manipulaCredito(solicitacao.getEstudante(), solicitacao.getQuantidade(), 0L);
        solicitacaoRepository.delete(solicitacao);
    }

    /**
     * Recupera todas as solicitações vinculadas a um estudante específico.
     * @param codEstudante
     */
    public List<Solicitacao> buscarPorEstudante(Long codEstudante) {
        return solicitacaoRepository.findByEstudante_CodEstudante(codEstudante);
    }

    /**
     * Recupera todas as solicitações cadastradas no sistema.
     */
    public List<Solicitacao> listarSolicitacoes() {
        return solicitacaoRepository.findAll();
    }

    /**
     * Filtra e recupera apenas as solicitações que estão marcadas como aptas (isApto)
     * no banco de dados ou pelas regras de negócio.
     */
    public List<Solicitacao> getSolicitacoesAptas() {
        List<Solicitacao> listaAptas = this.listarSolicitacoes().stream()
                .filter(Solicitacao::isApto)
                .toList();

        return listaAptas;
    }

    /**
     * Conta o número total de solicitações cujo status atual seja PENDENTE dentro de uma lista.
     * @param solicitacoes
     */
    public long getPendentes(List<Solicitacao> solicitacoes) {
        return solicitacoes.stream()
                .filter(s -> s.getStatusSolicitacao() == StatusSolicitacao.PENDENTE)
                .count();
    }

    /**
     * Conta o número total de solicitações cujo status atual seja CONCLUIDO dentro de uma lista.
     * @param solicitacoes
     */
    public long getConcluidas(List<Solicitacao> solicitacoes) {
        return solicitacoes.stream()
                .filter(s -> s.getStatusSolicitacao() == StatusSolicitacao.CONCLUIDO)
                .count();
    }

}