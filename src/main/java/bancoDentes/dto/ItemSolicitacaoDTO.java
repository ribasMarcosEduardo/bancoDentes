package bancoDentes.dto;

import bancoDentes.model.Frasco;
import bancoDentes.model.ItemSolicitacao;

public record ItemSolicitacaoDTO(
        Long codFrasco,
        Long quantidade
) {
    public ItemSolicitacao mapearItem(Frasco frasco) {
        ItemSolicitacao item = new ItemSolicitacao();
        item.setFrasco(frasco);
        item.setQuantidade(this.quantidade);
        return item;
    }
}
