package bancoDentes.dto;

import bancoDentes.model.Frasco;
import bancoDentes.model.ItemSolicitacao;
import bancoDentes.model.Solicitacao;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

public record ItemSolicitacaoDTO(
        Long codigo,
        Long version,
        Long codSolicitacao,
        Long codFrasco,
        Long quantiade

) {

    public static Object empty(){
        return new ItemSolicitacaoDTO(null,null,null,null,null);
    }

    public ItemSolicitacao mapearItemSolicitacao(Solicitacao solicitacao, Frasco frasco) {
        ItemSolicitacao itemSol = new ItemSolicitacao();
        itemSol.setCodigo(this.codigo);
        itemSol.setVersion(this.version);
        itemSol.setSolicitacao(solicitacao);
        itemSol.setFrasco(frasco);
        itemSol.setQuantidade(this.quantiade);
        return itemSol;
    }

    @Data
    public class AnaliseFinalDTO {
        private Long codSolicitacao;
        private List<ItemSolicitacaoDTO> itens = new ArrayList<>();
    }

}
