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
        Long quantiade

) {

    public static Object empty(){
        return new ItemAnaliseDTO(null,null,null,null,null);
    }

    public ItemAnalise mapearItemSolicitacao(AnaliseSolicitacao analiseSolicitacao, Frasco frasco) {
        ItemAnalise itemSol = new ItemAnalise();
        itemSol.setCodigo(this.codigo);
        itemSol.setVersion(this.version);
        itemSol.setAnaliseSolicitacao(analiseSolicitacao);
        itemSol.setFrasco(frasco);
        itemSol.setQuantidade(this.quantiade);
        return itemSol;
    }

}
