package bancoDentes.dto;

import bancoDentes.model.enumModels.TipoMovimentacao;

/**
 * Resumo dos dentes que passaram por um frasco ao longo da vida dele,
 * calculado a partir das movimentações (cadastro, entradas, saídas,
 * descartes na manutenção e transferências).
 *
 * @param entradas       dentes que entraram (cadastro, doações e transferências recebidas)
 * @param saidas         dentes que saíram por saída manual ou descarte na manutenção
 * @param transferencias dentes transferidos para outros frascos
 */
public record HistoricoFrascoDTO(long entradas, long saidas, long transferencias) {

    public static HistoricoFrascoDTO vazio() {
        return new HistoricoFrascoDTO(0L, 0L, 0L);
    }

    public HistoricoFrascoDTO somar(TipoMovimentacao tipo, long quantidade) {
        return switch (tipo) {
            case ENTRADA -> new HistoricoFrascoDTO(entradas + quantidade, saidas, transferencias);
            case SAIDA -> new HistoricoFrascoDTO(entradas, saidas + quantidade, transferencias);
            case TRANSFERENCIA -> new HistoricoFrascoDTO(entradas, saidas, transferencias + quantidade);
        };
    }
}
