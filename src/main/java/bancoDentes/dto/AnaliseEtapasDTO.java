package bancoDentes.dto;

import bancoDentes.model.AnaliseEtapas;
import bancoDentes.model.Estudante;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.StatusEtapa;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public record AnaliseEtapasDTO(
        Long version,
        Long codigo,
        Solicitacao solicitacao,
        @DateTimeFormat(pattern = "yyyy-MM-dd")
        LocalDate dataAlteracao,
        StatusEtapa statusEtapa,
        String justificativa,
        Estudante analista
) {

    public static Object empty() {
        return new AnaliseEtapasDTO(null, null, null, null, null, null, null);
    }

    public AnaliseEtapas mapearAnaliseEtapas() {
        AnaliseEtapas analiseEtapas = new AnaliseEtapas();
        analiseEtapas.setCodigo(this.codigo);
        analiseEtapas.setVersion(this.version);
        analiseEtapas.setSolicitacao(this.solicitacao);

        if (this.dataAlteracao != null) {
            analiseEtapas.setDataAlteracao(this.dataAlteracao.atStartOfDay());
        }

        analiseEtapas.setStatusEtapa(this.statusEtapa);
        analiseEtapas.setJustificativa(this.justificativa);
        analiseEtapas.setAnalista(this.analista);
        return analiseEtapas;
    }
}
