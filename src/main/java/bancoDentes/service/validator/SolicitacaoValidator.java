package bancoDentes.service.validator;

import bancoDentes.dto.SolicitacaoDTO;
import bancoDentes.exception.SolicitacaoCreditoException;
import bancoDentes.exception.SolicitacaoException;
import bancoDentes.exception.SolicitacaoStatusException;
import bancoDentes.model.Usuario;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.StatusSolicitacao;
import bancoDentes.service.BaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente responsável por centralizar e aplicar as regras de negócio e de 
 * validação para a entidade Solicitacao.
 *
 * @author Marcos Eduardo Ribas
 */
@Component
@RequiredArgsConstructor
public class SolicitacaoValidator extends BaseService {

    /**
     * Aplica o conjunto de validações necessárias antes de persistir uma solicitação no banco de dados.
     *
     * @param dto
     * @param estudante
     */
    public void saveValidator(SolicitacaoDTO dto, Usuario estudante) throws SolicitacaoException {
        validaCreditos(estudante.getCredito(), dto.quantidade());
    }

    /**
     * Aplica as validações necessárias para garantir que uma solicitação possa 
     * ser deletada/cancelada com segurança.
     *
     * A principal regra é que uma solicitação só pode ser excluída pelo aluno se
     * o avaliador ainda não tiver começado a analisá-la.
     *
     * @param solicitacao
     */
    public void exclusaoValidator(Solicitacao solicitacao) throws SolicitacaoException {
        this.validaStatusPendente(solicitacao.getStatusSolicitacao());
    }

    /**
     * Valida se o saldo atual de créditos do estudante é igual ou superior à 
     * quantidade de dentes que ele está tentando solicitar.
     *
     * @param estCredito
     * @param quantidade
     */
    public void validaCreditos(Long estCredito, Long quantidade) throws SolicitacaoException {
        if (estCredito < quantidade) {
            throw new SolicitacaoCreditoException(this.getText("error.solicitacao.credito"));
        }
    }

    /**
     * Verifica se o status atual da solicitação é o status "PENDENTE".
     *
     * Evita que solicitações que já estão "EM ANÁLISE", "CONCLUÍDO" ou "NEGADO" 
     * sejam alteradas ou excluídas inadvertidamente pelo estudante.
     *
     * @param statusSolicitacao
     */
    private void validaStatusPendente(StatusSolicitacao statusSolicitacao) throws SolicitacaoException {
        if (!StatusSolicitacao.PENDENTE.equals(statusSolicitacao)) {
            throw new SolicitacaoStatusException(this.getText("error.solicitacao.statusDiferenteDePendente"));
        }
    }

}