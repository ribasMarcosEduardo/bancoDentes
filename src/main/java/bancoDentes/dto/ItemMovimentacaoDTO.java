package bancoDentes.dto;

import bancoDentes.model.ItemMovimentacao;
import bancoDentes.model.Movimentacao;

public record ItemMovimentacaoDTO(
        Long codigo,
        Long version,
        Movimentacao movimentacao,
        Long codFrasco,
        Long quantidade
) {

    public static ItemMovimentacaoDTO empty(){
        return new ItemMovimentacaoDTO(null, null, null, null, null);
    }

    public ItemMovimentacao mapearItemMovimentacao() {
        ItemMovimentacao itemMov = new ItemMovimentacao();
        itemMov.setCodigo(this.codigo);
        itemMov.setVersion(this.version);
        itemMov.setMovimentacao(this.movimentacao);
        itemMov.setQuantidade(this.quantidade);
        return itemMov;
    }
}