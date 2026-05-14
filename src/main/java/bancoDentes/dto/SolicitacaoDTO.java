package bancoDentes.dto;

import bancoDentes.model.Estudante;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.*;

import java.time.LocalDateTime;

public record SolicitacaoDTO(
        Long codigo,
        Long version,
        Long estudante,
        LocalDateTime datSolicitacao,
        Long quantidade,
        Long posicao,
        Maxilar maxilar,
        TipoDente tipoDente,
        EstadoDente estadoDente,
        Denticao denticao,
        String justificativa
) {

        public static Object empty() {
                return new SolicitacaoDTO(null,null,null,null,null,null,null,null,null,null, null);
        }

        public Solicitacao mapearSolicitacao(Estudante estudante) {
                Solicitacao sol = new Solicitacao();
                sol.setCodigo(this.codigo);
                sol.setVersion(this.version);
                sol.setEstudante(estudante);
                sol.setDatSolicitacao(this.datSolicitacao);
                sol.setQuantidade(this.quantidade);
                sol.setPosicao(this.posicao);
                sol.setMaxilar(this.maxilar);
                sol.setTipoDente(this.tipoDente);
                sol.setEstado(this.estadoDente);
                sol.setDenticao(this.denticao);
                sol.setJustificativa(this.justificativa);
                return sol;
        }

}
