package bancoDentes.model;

import bancoDentes.model.enumModels.Local;
import bancoDentes.model.enumModels.OrigemMovimentacao;
import bancoDentes.model.enumModels.TipoMovimentacao;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    /**
     * Fluxo que gerou a movimentação (cadastro, registro manual, manutenção...).
     * Nullable no banco só pra coluna poder ser adicionada pelo ddl-auto; sempre
     * preenchida pelo código.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "ORIGEM", length = 20)
    private OrigemMovimentacao origem;

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

    /**
     * Transferências dos frascos de origem que alimentaram esta Entrada.
     * Vazia numa Entrada significa origem externa (Doação/Outros).
     */
    @OneToMany(mappedBy = "movimentacaoVinculada", fetch = FetchType.LAZY)
    private List<Movimentacao> transferencias = new ArrayList<>();

    public void transferencia(){
        this.tipoMovimentacao = TipoMovimentacao.TRANSFERENCIA;
    }

    /**
     * Quantidade do frasco logo após a movimentação, calculada a partir do saldo anterior.
     * Transferência esvazia o frasco de origem (ver MovimentacaoService).
     */
    @Transient
    public Long getSaldoPosterior() {
        if (saldoAnterior == null || quantidade == null || tipoMovimentacao == null) {
            return null;
        }
        return switch (tipoMovimentacao) {
            case ENTRADA -> saldoAnterior + quantidade;
            case SAIDA -> Math.max(0L, saldoAnterior - quantidade);
            case TRANSFERENCIA -> 0L;
        };
    }

    public Movimentacao(TipoMovimentacao tipoMovimentacao, OrigemMovimentacao origem, LocalDateTime datMovimentacao, Local local, String observacao, Frasco frasco, Long quantidade, Long saldoAnterior, Movimentacao movimentacaoVinculada) {
        this.tipoMovimentacao = tipoMovimentacao;
        this.origem = origem;
        this.datMovimentacao = datMovimentacao != null ? datMovimentacao : LocalDateTime.now();
        this.local = local;
        this.observacao = observacao;
        this.frasco = frasco;
        this.quantidade = quantidade;
        this.saldoAnterior = saldoAnterior;
        this.movimentacaoVinculada = movimentacaoVinculada;
    }
}