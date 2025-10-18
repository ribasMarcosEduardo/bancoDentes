package bancoDentes.dto;

import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.NomeDente;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public record FrascoDTO(
        Long codFrasco,
        LocalDateTime datCad,
        LocalDateTime datManutencao,
        EstadoDente estadoDente,
        Long quantidade,
        NomeDente nomeDente,
        Long posicao,
        Maxilar maxilar
) {

    public static FrascoDTO empty() {
        return new FrascoDTO(null, null, null, null, null, null, null, null);
    }
    /**
     * Mapeia este DTO para a entidade Frasco (já unificada).
     * @return um objeto Frasco preenchido com os dados do DTO.
     */
    public Frasco mapearFrasco(){
        Frasco frasco = new Frasco();
        frasco.setCodFrasco(this.codFrasco);
        frasco.setDatCad(this.datCad);
        frasco.setDatManutencao(this.datManutencao);
        frasco.setEstado(this.estadoDente);
        frasco.setQuantidade(this.quantidade);
        frasco.setNomDente(this.nomeDente);
        frasco.setPosicao(this.posicao);
        frasco.setMaxilar(this.maxilar);

        return frasco;
    }
}