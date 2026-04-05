package bancoDentes.dto;

import bancoDentes.model.Estudante;
import bancoDentes.model.ItemSolicitacao;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.StatusSolicitacao;

import java.time.LocalDateTime;
import java.util.List;

public record SolicitacaoDTO(
        Long codSolicitacao,
        Long codEstudante,
        String nomeEstudante,
        List<ItemSolicitacaoDTO> itens,
        StatusSolicitacao status,
        LocalDateTime datSolicitacao
) {

        public static Object empty() {
                return new SolicitacaoDTO(null,null,null,null,null,null);
        }

        public Solicitacao mapearSolicitacao(Estudante estudante) {
                Solicitacao sol = new Solicitacao();
                sol.setCodigo(this.codSolicitacao());
                sol.setEstudante(estudante);
                sol.setStatusSolicitacao(this.status());
                sol.setDatSolicitacao(this.datSolicitacao());
                return sol;
        }

}
