package bancoDentes.dto;

import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.Denticao;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.TipoDente;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record FrascoDTO(
        Long codigo,
        @DateTimeFormat(pattern = "yyyy-MM-dd")
        LocalDate datCad,
        LocalDateTime datManutencao,
        EstadoDente estadoDente,
        Long quantidade,
        TipoDente tipoDente,
        Long posicao,
        Maxilar maxilar,
        Denticao denticao,
        String identificacao
) {

    public static FrascoDTO empty() {
        return new FrascoDTO(null,null, null, null, null, null, null, null,null,null);
    }

    public Frasco mapearFrasco(){
        Frasco frasco = new Frasco();
        frasco.setCodigo(this.codigo);

        if (this.datCad != null) {
            frasco.setDatCad(this.datCad.atStartOfDay());

        }

        frasco.setDatManutencao(this.datManutencao);
        frasco.setEstado(this.estadoDente);
        frasco.setQuantidade(this.quantidade);
        frasco.setTipoDente(this.tipoDente);
        frasco.setPosicao(this.posicao);
        frasco.setMaxilar(this.maxilar);
        frasco.setDenticao(this.denticao);
        return frasco;
    }

    public static FrascoDTO recuperaFrasco(Frasco frasco) {
        return new FrascoDTO(
                frasco.getCodigo(),
                frasco.getDatCad() != null ? frasco.getDatCad().toLocalDate() : null,
                frasco.getDatManutencao(),
                frasco.getEstado(),
                frasco.getQuantidade(),
                frasco.getTipoDente(),
                frasco.getPosicao(),
                frasco.getMaxilar(),
                frasco.getDenticao(),
                frasco.getIdentificacao()
        );
    }
}