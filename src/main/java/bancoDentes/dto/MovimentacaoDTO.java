package bancoDentes.dto;

import bancoDentes.model.Frasco;
import bancoDentes.model.Movimentacao;
import bancoDentes.model.enumModels.Local;
import bancoDentes.model.enumModels.TipoMovimentacao;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

public record MovimentacaoDTO(
        Long version,
        Long codigo,
        TipoMovimentacao tipoMovimentacao,
        Long quantidade,
         @DateTimeFormat(pattern = "yyyy-MM-dd")
        LocalDateTime datManutencao,
        Frasco frasco,
        Local local,
        String observacao
) {

    public static MovimentacaoDTO empty() {
        return new MovimentacaoDTO(null,null,null,null,null,null, null,null);
    }

    public Movimentacao mapearMovimentacao() {
        Movimentacao movimentacao = new Movimentacao();
        movimentacao.setCodigo(this.codigo);
        movimentacao.setVersion(this.version);
        movimentacao.setTipoMovimentacao(this.tipoMovimentacao);
        movimentacao.setQuantidade(this.quantidade);
        movimentacao.setDatMovimentacao(this.datManutencao);
        movimentacao.setFrasco(this.frasco);
        movimentacao.setLocal(this.local);
        movimentacao.setObservacao(this.observacao);

        return movimentacao;
    }

}
