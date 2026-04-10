package bancoDentes.dto;

import bancoDentes.model.Estudante;
import bancoDentes.model.ItemSolicitacao;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.NomeDente;
import bancoDentes.model.enumModels.StatusSolicitacao;

import java.time.LocalDateTime;
import java.util.List;

public record SolicitacaoDTO(
        Long codSolicitacao,
        Estudante estudante,
        StatusSolicitacao status,
        LocalDateTime datSolicitacao,
        Long quantidade,
        Long posicao,
        Maxilar maxilar,
        NomeDente nomeDente,
        EstadoDente estadoDente
) {

        public static Object empty() {
                return new SolicitacaoDTO(null,null,null,null,null,null,null,null,null);
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
                sol.setNomDente(this.nomeDente);
                sol.setEstado(this.estadoDente);
                return sol;
        }

}
