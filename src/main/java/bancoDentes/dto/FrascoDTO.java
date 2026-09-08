package bancoDentes.dto;

import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public record FrascoDTO(
        Long codigo,
        Long version,
        @DateTimeFormat(pattern = "yyyy-MM-dd")
        LocalDate datCad,
        @DateTimeFormat(pattern = "yyyy-MM-dd")
        LocalDate datManutencao,
        EstadoDente estadoDente,
        Long quantidade,
        TipoDente tipoDente,
        Long posicao,
        Arcada arcada,
        Denticao denticao,
        String identificacao,
        Local local
) {

    public static FrascoDTO empty() {
        return new FrascoDTO(null,null,null,null, null, null, null, null, null, null,null,null);
    }

    public Frasco mapearFrasco(){
        Frasco frasco = new Frasco();
        frasco.setCodigo(this.codigo);
        frasco.setVersion(this.version);
        if (this.datCad != null) {
            frasco.setDatCad(this.datCad.atStartOfDay());
        }
        if (this.datManutencao != null) {
            frasco.setDatManutencao(this.datManutencao.atStartOfDay());
        }
        frasco.setEstado(this.estadoDente);
        frasco.setQuantidade(this.quantidade);
        frasco.setTipoDente(this.tipoDente);
        frasco.setPosicao(this.posicao);
        frasco.setArcada(this.arcada);
        frasco.setDenticao(this.denticao);
        frasco.setLocal(this.local);
        return frasco;
    }

    public static FrascoDTO recuperaFrasco(Frasco frasco) {
        return new FrascoDTO(
                frasco.getCodigo(),
                frasco.getVersion(),
                frasco.getDatCad() != null ? frasco.getDatCad().toLocalDate() : null,
                frasco.getDatManutencao() != null ? frasco.getDatManutencao().toLocalDate() : null,frasco.getEstado(),
                frasco.getQuantidade(),
                frasco.getTipoDente(),
                frasco.getPosicao(),
                frasco.getArcada(),
                frasco.getDenticao(),
                frasco.getIdentificacao(),
                frasco.getLocal()
        );
    }
}