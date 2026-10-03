package bancoDentes.model;

import bancoDentes.model.enumModels.Local;
import bancoDentes.model.enumModels.TipoMovimentacao;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "MOVIMENTACAO")
public class Movimentacao {

    @Version
    @Column(name = "VERSION", nullable = false)
    private Long version;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODMOVIMENTACAO")
    private Long codigo;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_MOVIMENTACAO", nullable = false, length = 20)
    private TipoMovimentacao tipoMovimentacao;

    @Column(name = "DATMOVIMENTACAO", nullable = false)
    private LocalDateTime datMovimentacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CODFRASCO", nullable = false)
    private Frasco frasco;

    @Enumerated(EnumType.STRING)
    @Column(name = "LOCAL", nullable = true)
    private Local local;

    @Column(name = "OBSERVACAO", nullable = false)
    private String observacao;

    @Column(name = "QUANTIDADE", nullable = false)
    private Long quantidade;

    @Column(name = "SALDO_ANTERIOR", nullable = false)
    private Long saldoAnterior;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CODMOVIMENTACAO_VINCULADA")
    private Movimentacao movimentacaoVinculada;

    public void transferencia(){
        this.tipoMovimentacao = TipoMovimentacao.TRANSFERENCIA;
    }

    public Movimentacao(TipoMovimentacao tipoMovimentacao, LocalDateTime datMovimentacao, Local local, String observacao, Frasco frasco, Long quantidade, Long saldoAnterior, Movimentacao movimentacaoVinculada) {
        this.tipoMovimentacao = tipoMovimentacao;
        this.datMovimentacao = datMovimentacao != null ? datMovimentacao : LocalDateTime.now();
        this.local = local;
        this.observacao = observacao;
        this.frasco = frasco;
        this.quantidade = quantidade;
        this.saldoAnterior = saldoAnterior;
        this.movimentacaoVinculada = movimentacaoVinculada;
    }
}