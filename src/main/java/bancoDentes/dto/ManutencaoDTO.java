package bancoDentes.dto;

import bancoDentes.model.Frasco;
import bancoDentes.model.Manutencao;
import bancoDentes.model.enumModels.OrigemManutencao;

import java.time.LocalDateTime;

public record ManutencaoDTO(
        Long codFrasco,
        Long quantidadeCalculada,
        OrigemManutencao origem
) {

    public Manutencao mapearManutencao(Frasco frasco) {
        Manutencao manutencao = new Manutencao();
        manutencao.setFrasco(frasco);
        manutencao.setDatCadastro(LocalDateTime.now());
        manutencao.setQuantidade(this.quantidadeCalculada);
        manutencao.setOrigem(this.origem);

        return manutencao;
    }
}