package bancoDentes.dto;

import bancoDentes.model.Frasco;
import bancoDentes.model.ItemSolicitacao;
import bancoDentes.model.Solicitacao;

public record ItemSolicitacaoDTO(
        Long codItem,
        Long codSolicitacao,
        Long codFrasco
) {

    public static Object empty(){
        return new ItemSolicitacaoDTO(null,null,null);
    }

    public ItemSolicitacao mapearItemSolicitacao(Solicitacao solicitacao, Frasco frasco) {
        ItemSolicitacao itemSol = new ItemSolicitacao();
        itemSol.setCodigo(this.codItem);
        itemSol.setSolicitacao(solicitacao);
        itemSol.setFrasco(frasco);
        return itemSol;
    }

}
