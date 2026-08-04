    package bancoDentes.service.validator;

    import bancoDentes.dto.SolicitacaoDTO;
    import bancoDentes.exception.SolicitacaoCreditoException;
    import bancoDentes.exception.SolicitacaoException;
    import bancoDentes.exception.SolicitacaoStatusException;
    import bancoDentes.model.Estudante;
    import bancoDentes.model.Solicitacao;
    import bancoDentes.model.enumModels.StatusSolicitacao;
    import bancoDentes.service.BaseService;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Component;

    @Component
    @RequiredArgsConstructor
    public class SolicitacaoValidator extends BaseService {

        public void saveValidator(SolicitacaoDTO dto, Estudante estudante) throws SolicitacaoException{
            validaCreditos(estudante.getCredito(),dto.quantidade());
        }

        public void exclusaoValidator(Solicitacao solicitacao) throws SolicitacaoException {
            this.validaStatusPendente(solicitacao.getStatusSolicitacao());
        }
    
        public void validaCreditos(Long estCredito, Long quantidade) throws SolicitacaoException {
            if(estCredito < quantidade){
                throw new SolicitacaoCreditoException(this.getText("error.solicitacao.credito"));
            }
        }

        private void validaStatusPendente(StatusSolicitacao statusSolicitacao) throws SolicitacaoException{
            if(!StatusSolicitacao.PENDENTE.equals((statusSolicitacao))){
                throw new SolicitacaoStatusException(this.getText("error.solicitacao.statusDiferenteDePendente"));
            }
        }


    }
