package bancoDentes.dto;

import bancoDentes.model.enumModels.OrigemMovimentacao;
import bancoDentes.model.enumModels.TipoMovimentacao;

/**
 * Resumo dos dentes que passaram por um frasco ao longo da vida dele,
 * calculado a partir das movimentações (cadastro, entradas, saídas,
 * descartes na manutenção e transferências).
 *
 * @param entradas       dentes que entraram (cadastro, doações e transferências recebidas)
 * @param saidas         dentes que saíram por saída registrada (manual ou, no futuro, por solicitação)
 * @param descartes      dentes descartados na conclusão de manutenções
 * @param transferencias dentes transferidos para outros frascos
 */
public record HistoricoFrascoDTO(long entradas, long saidas, long descartes, long transferencias) {

    public static HistoricoFrascoDTO vazio() {
        return new HistoricoFrascoDTO(0L, 0L, 0L, 0L);
    }

    public HistoricoFrascoDTO somar(TipoMovimentacao tipo, OrigemMovimentacao origem, long quantidade) {
        return switch (tipo) {
            case ENTRADA -> new HistoricoFrascoDTO(entradas + quantidade, saidas, descartes, transferencias);
            case SAIDA -> origem == OrigemMovimentacao.MANUTENCAO
                    ? new HistoricoFrascoDTO(entradas, saidas, descartes + quantidade, transferencias)
                    : new HistoricoFrascoDTO(entradas, saidas + quantidade, descartes, transferencias);
            case TRANSFERENCIA -> new HistoricoFrascoDTO(entradas, saidas, descartes, transferencias + quantidade);
        };
    }
}
