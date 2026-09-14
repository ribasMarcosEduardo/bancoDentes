package bancoDentes.dto;

import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.model.Estudante;
import bancoDentes.model.Solicitacao;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public record AnaliseSolicitacaoDTO(
        Long version,
        Long codigo,
        Solicitacao solicitacao,
        @DateTimeFormat(pattern = "yyyy-MM-dd")
        LocalDate dataAlteracao,
        String justificativa,
        Estudante analista
) {

    public static AnaliseSolicitacaoDTO empty() {
        return new AnaliseSolicitacaoDTO(null, null, null, null, null, null);
    }

    public AnaliseSolicitacao mapearAnaliseEtapas() {
        AnaliseSolicitacao analiseSolicitacao = new AnaliseSolicitacao();
        analiseSolicitacao.setCodigo(this.codigo);
        analiseSolicitacao.setVersion(this.version);
        analiseSolicitacao.setSolicitacao(this.solicitacao);

        if (this.dataAlteracao != null) {
            analiseSolicitacao.setDataAlteracao(this.dataAlteracao.atStartOfDay());
        }

        analiseSolicitacao.setJustificativa(this.justificativa);
        analiseSolicitacao.setAnalista(this.analista);
        return analiseSolicitacao;
    }
}
