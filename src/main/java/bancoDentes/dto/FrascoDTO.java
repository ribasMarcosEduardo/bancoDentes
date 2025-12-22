package bancoDentes.dto;

import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.NomeDente;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.lang.Contract;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public record FrascoDTO(
        Long codFrasco,
        @DateTimeFormat(pattern = "yyyy-MM-dd")
        LocalDate datCad,
        LocalDateTime datManutencao,
        EstadoDente estadoDente,
        Long quantidade,
        NomeDente nomeDente,
        Long posicao,
        Maxilar maxilar,
        String identificacao
) {

    public static FrascoDTO empty() {
        return new FrascoDTO(null, null, null, null, null, null, null, null,null    );
    }
    /**
     * Mapeia este DTO para a entidade Frasco (já unificada).
     * @return um objeto Frasco preenchido com os dados do DTO.
     */
    public Frasco mapearFrasco(){
        Frasco frasco = new Frasco();
        frasco.setCodFrasco(this.codFrasco);

        if (this.datCad != null) {
            frasco.setDatCad(this.datCad.atStartOfDay());

        }

        frasco.setDatManutencao(this.datManutencao);
        frasco.setEstado(this.estadoDente);
        frasco.setQuantidade(this.quantidade);
        frasco.setNomDente(this.nomeDente);
        frasco.setPosicao(this.posicao);
        frasco.setMaxilar(this.maxilar);

        return frasco;
    }

    public static FrascoDTO recuperaFrasco(Frasco frasco) {
        return new FrascoDTO(
                frasco.getCodFrasco(),
                frasco.getDatCad() != null ? frasco.getDatCad().toLocalDate() : null,
                frasco.getDatManutencao(),
                frasco.getEstado(),
                frasco.getQuantidade(),
                frasco.getNomDente(),
                frasco.getPosicao(),
                frasco.getMaxilar(),
                frasco.getIdentificacao()
        );
    }
}