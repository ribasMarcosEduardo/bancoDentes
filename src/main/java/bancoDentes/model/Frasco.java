package bancoDentes.model;

import bancoDentes.exception.FrascoException;
import bancoDentes.model.enumModels.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "FRASCO")
public class Frasco {

    @Version
    @Column(name = "VERSION", nullable = false)
    private Long version;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODFRASCO")
    private Long codigo;

    @Column(name = "DATCAD", nullable = false)
    private LocalDateTime datCad;

    @Column(name = "DATMANUTENCAO")
    private LocalDateTime datManutencao;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPDENTE", nullable = true)
    private TipoDente tipoDente;

    @Column(name = "POSICAO")
    private Long posicao;

    @Enumerated(EnumType.STRING)
    @Column(name = "ARCADA")
    private Arcada arcada;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = true)
    private EstadoDente estado;

    @Enumerated(EnumType.STRING)
    @Column(name = "DENTICAO", nullable = true)
    private Denticao denticao;

    @Column(name = "QUANTIDADE", nullable = false)
    private Long quantidade;

    @Column(name = "IDENTIFICACAO", nullable = true)
    private  String identificacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "LOCAL", nullable = true)
    private Local local;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUSFRASCO")
    private StatusFrasco statusFrasco;

    @PrePersist
    public void onPrePersist() {
        this.statusFrasco = StatusFrasco.DISPONIVEL;
        limparCamposSeEndo();
    }

    @PreUpdate
    public void onPreUpdate() {
        limparCamposSeEndo();
    }

    private void limparCamposSeEndo() {
        if (this.tipoDente == TipoDente.ENDO) {
            this.posicao = null;
            this.arcada = null;
            this.estado = EstadoDente.MISTO;
            this.denticao = null;
        }
    }

    /**
     * Situação da data de manutenção em relação a hoje (usada pelos painéis).
     * Calculada na leitura, não é persistida. Sem data de manutenção retorna null.
     */
    @Transient
    public PrazoManutencao getPrazoManutencao() {
        if (datManutencao == null) {
            return null;
        }
        LocalDate hoje = LocalDate.now();
        LocalDate manutencao = datManutencao.toLocalDate();
        if (manutencao.isBefore(hoje)) {
            return PrazoManutencao.VENCIDA;
        }
        if (!manutencao.isAfter(hoje.plusDays(PrazoManutencao.DIAS_PROXIMA))) {
            return PrazoManutencao.PROXIMA;
        }
        return PrazoManutencao.EM_DIA;
    }

    public void gerarIdentificacao() {
        if (codigo == null) {
            throw new FrascoException("Impossível gerar etiqueta: ID do frasco ainda não foi gerado.");
        }
            String siglaTipo = (tipoDente != null) ? tipoDente.getSigla() : "";
            String siglaLocal = (local != null) ? local.getSigla() : "";

            this.identificacao = String.format("%s%s-%s",
                    siglaTipo,
                    siglaLocal,
                    codigo);
    }

    public void emManutencao(){
        this.statusFrasco = StatusFrasco.EM_MANUTENCA;
    }

    public void inativo(){
        this.statusFrasco = StatusFrasco.INATIVO;
    }

    public void disponivel(){
        this.statusFrasco = StatusFrasco.DISPONIVEL;
    }

}