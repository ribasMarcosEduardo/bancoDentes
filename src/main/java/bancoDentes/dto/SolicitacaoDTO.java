package bancoDentes.dto;

import bancoDentes.model.Usuario;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.*;

import java.time.LocalDateTime;

public record SolicitacaoDTO(
        Long codigo,
        Long version,
        Long usuario,
        LocalDateTime datSolicitacao,
        Long quantidade,
        Long posicao,
        Arcada arcada,
        TipoDente tipoDente,
        EstadoDente estadoDente,
        Denticao denticao,
        String justificativa
) {

        public static SolicitacaoDTO empty() {
                return new SolicitacaoDTO(null,null,null,null,null,null,null,null,null,null, null);
        }

        public Solicitacao mapearSolicitacao(Usuario usuario) {
                Solicitacao sol = new Solicitacao();
                sol.setCodigo(this.codigo);
                sol.setVersion(this.version);
                sol.setUsuario(usuario);
                sol.setDatSolicitacao(this.datSolicitacao);
                sol.setQuantidade(this.quantidade);
                sol.setPosicao(this.posicao);
                sol.setArcada(this.arcada);
                sol.setTipoDente(this.tipoDente);
                sol.setEstado(this.estadoDente);
                sol.setDenticao(this.denticao);
                sol.setJustificativa(this.justificativa);
                return sol;
        }

        public static SolicitacaoDTO recuperaSolicitacao(Solicitacao solicitacao) {
                return new SolicitacaoDTO(
                        solicitacao.getCodigo(),
                        solicitacao.getVersion(),
                        solicitacao.getUsuario().getCodUsuario(),
                        solicitacao.getDatSolicitacao(),
                        solicitacao.getQuantidade(),
                        solicitacao.getPosicao(),
                        solicitacao.getArcada(),
                        solicitacao.getTipoDente(),
                        solicitacao.getEstado(),
                        solicitacao.getDenticao(),
                        solicitacao.getJustificativa()
                );
        }
}
