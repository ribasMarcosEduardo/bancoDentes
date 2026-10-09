package bancoDentes.dto;

import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.model.Frasco;
import bancoDentes.model.ItemAnalise;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

public record ItemAnaliseDTO(
        Long codigo,
        Long version,
        AnaliseSolicitacao analiseSolicitacao,
        Frasco frasco,
        Long quantidade

) {

    public static ItemAnaliseDTO empty(){
        return new ItemAnaliseDTO(null, null, null, null, null);
    }

    public ItemAnalise mapearItemSolicitacao() {
        ItemAnalise itemSol = new ItemAnalise();
        itemSol.setCodigo(this.codigo);
        itemSol.setVersion(this.version);
        itemSol.setAnaliseSolicitacao(analiseSolicitacao);
        itemSol.setFrasco(frasco);
        itemSol.setQuantidade(this.quantidade);
        return itemSol;
    }

}