package bancoDentes.dto;

import bancoDentes.model.Estudante;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.*;

import java.time.LocalDateTime;

public record SolicitacaoDTO(
        Long codSolicitacao,
        Long estudante,
        StatusSolicitacao status,
        LocalDateTime datSolicitacao,
        Long quantidade,
        Long posicao,
        Maxilar maxilar,
        TipoDente tipoDente,
        EstadoDente estadoDente,
        Denticao denticao
) {

        public static Object empty() {
                return new SolicitacaoDTO(null,null,null,null,null,null,null,null,null,null);
        }

        public Solicitacao mapearSolicitacao(Estudante estudante) {
                Solicitacao sol = new Solicitacao();
                sol.setCodigo(this.codSolicitacao());
                sol.setEstudante(estudante);
                sol.setStatusSolicitacao(this.status());
                sol.setDatSolicitacao(this.datSolicitacao());
                sol.setQuantidade(this.quantidade());
                sol.setPosicao(this.posicao);
                sol.setMaxilar(this.maxilar);
                sol.setTipoDente(this.tipoDente);
                sol.setEstado(this.estadoDente);
                sol.setDenticao(this.denticao);
                return sol;
        }

}
