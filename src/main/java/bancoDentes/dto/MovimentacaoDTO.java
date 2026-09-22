package bancoDentes.dto;

import bancoDentes.model.Frasco;
import bancoDentes.model.Movimentacao;
import bancoDentes.model.enumModels.Local;
import bancoDentes.model.enumModels.TipoMovimentacao;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public record MovimentacaoDTO(
        Long version,
        Long codigo,
        TipoMovimentacao tipoMovimentacao,
        Long quantidade,
        @DateTimeFormat(pattern = "yyyy-MM-dd")
        LocalDate datManutencao,
        Long codFrasco,
        Local local,
        String observacao,
        List<ItemMovimentacaoDTO> itens
) {

    public static MovimentacaoDTO empty() {
        return new MovimentacaoDTO(null, null, null, null, null, null, null, null, new ArrayList<>());
    }

    public Movimentacao mapearMovimentacao(Frasco frascoPrincipal) {
        Movimentacao movimentacao = new Movimentacao();
        movimentacao.setCodigo(this.codigo);
        movimentacao.setVersion(this.version);
        movimentacao.setTipoMovimentacao(this.tipoMovimentacao);
        movimentacao.setDatMovimentacao(this.datManutencao != null ? this.datManutencao.atStartOfDay() : LocalDateTime.now());
        movimentacao.setLocal(this.local);
        movimentacao.setObservacao(this.observacao);
        movimentacao.setFrasco(frascoPrincipal);

        return movimentacao;
    }
}