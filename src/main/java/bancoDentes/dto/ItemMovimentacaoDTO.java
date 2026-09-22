package bancoDentes.dto;

import bancoDentes.model.Frasco;
import bancoDentes.model.ItemMovimentacao;
import bancoDentes.model.Movimentacao;

public record ItemMovimentacaoDTO(
        Long codigo,
        Long version,
        Movimentacao movimentacao,
        Long codFrasco,
        Long quantidade
) {

    public static ItemMovimentacaoDTO empty() {
        return new ItemMovimentacaoDTO(null, null, null, null, null);
    }

    /**
     * Mapeia o DTO associando o Frasco e a Movimentação informados explicitamente.
     */
    public ItemMovimentacao mapearItemMovimentacao(Frasco frasco, Movimentacao movimentacao) {
        ItemMovimentacao itemMov = new ItemMovimentacao();
        itemMov.setCodigo(this.codigo);
        itemMov.setVersion(this.version);
        itemMov.setMovimentacao(movimentacao != null ? movimentacao : this.movimentacao);
        itemMov.setFrasco(frasco);
        itemMov.setQuantidade(this.quantidade);
        return itemMov;
    }

    /**
     * Mapeia o DTO associando o Frasco informado e utilizando a Movimentação interna do DTO.
     */
    public ItemMovimentacao mapearItemMovimentacao(Frasco frasco) {
        return mapearItemMovimentacao(frasco, this.movimentacao);
    }
}