package bancoDentes.model;

import bancoDentes.exception.FrascoException;
import bancoDentes.model.enumModels.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

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
        this.statusFrasco = StatusFrasco.DIS_IMPRESSAO;
        limparCamposSeEndoOuSiso();
    }

    @PreUpdate
    public void onPreUpdate() {
        limparCamposSeEndoOuSiso();
    }

    private void limparCamposSeEndoOuSiso() {
        if (this.tipoDente == TipoDente.ENDO) {
            this.posicao = null;
            this.arcada = null;
            this.estado = EstadoDente.MISTO;
            this.denticao = null;
        }
        if (this.tipoDente == TipoDente.SISO) {
            this.posicao = null;
            this.arcada = null;
            this.estado = EstadoDente.MISTO;
            this.denticao = Denticao.PERMANENTE;
        }
    }

    /**
     * Situação da data de manutenção em relação a hoje (usada pelos painéis).
     * Calculada na leitura, não é persistida. Retorna null sem data de manutenção,
     * se o frasco estiver inativo (a data fica no banco, mas não tem mais prazo) ou
     * em manutenção (a data só é recalculada quando a manutenção é concluída).
     */
    @Transient
    public PrazoManutencao getPrazoManutencao() {
        if (datManutencao == null || isInativo() || isEmManutencao()) {
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

    @Transient
    public Arcada getArcadaEfetiva() {
        if (tipoDente == null || !tipoDente.isUsaNumeracao()) {
            return arcada;
        }
        if (posicao == null) {
            return Arcada.NAO_INFORMADA;
        }
        return switch ((int) (posicao / 10)) {
            case 1, 2, 5, 6 -> Arcada.SUPERIOR;
            case 3, 4, 7, 8 -> Arcada.INFERIOR;
            default -> Arcada.NAO_INFORMADA;
        };
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
                    formatarSequencial(codigo));
    }

    private static final int NUMEROS_POR_BLOCO = 999;

    // Sem I e O, que na etiqueta se confundem com 1 e 0
    private static final String LETRAS_SEQUENCIAL = "ABCDEFGHJKLMNPQRSTUVWXYZ";

    /**
     * 1 → A001, 999 → A999, 1000 → B001 ... Z999 → AA001, AA001 ... ZZ999 → AAA001.
     */
    static String formatarSequencial(long codigo) {
        long bloco = (codigo - 1) / NUMEROS_POR_BLOCO;
        long numero = (codigo - 1) % NUMEROS_POR_BLOCO + 1;
        int base = LETRAS_SEQUENCIAL.length();

        StringBuilder letras = new StringBuilder();
        for (long n = bloco + 1; n > 0; n = (n - 1) / base) {
            letras.insert(0, LETRAS_SEQUENCIAL.charAt((int) ((n - 1) % base)));
        }

        return String.format("%s%03d", letras, numero);
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

    public void disImpressao(){
        this.statusFrasco = StatusFrasco.DIS_IMPRESSAO;
    }

    /**
     * Só frascos disponíveis entram na fila de impressão manualmente — em manutenção
     * já voltam para a fila ao concluir, e inativos não recebem etiqueta.
     */
    @Transient
    public boolean isPodeEnviarParaImpressao() {
        return this.statusFrasco == StatusFrasco.DISPONIVEL;
    }

    @Transient
    public boolean isEmManutencao() {
        return this.statusFrasco == StatusFrasco.EM_MANUTENCA;
    }

    @Transient
    public boolean isDisponivel() {
        return this.statusFrasco == StatusFrasco.DISPONIVEL;
    }

    @Transient
    public boolean isNaFilaImpressao() {
        return this.statusFrasco == StatusFrasco.DIS_IMPRESSAO;
    }

    @Transient
    public boolean isInativo() {
        return this.statusFrasco == StatusFrasco.INATIVO;
    }

    public boolean isNew(){
        return this.version == null;
    }

    /**
     * Reavalia o status da etiqueta. Se a identificação mudou e o frasco está disponível,
     * envia o frasco novamente para a fila de impressão.
     */
    public void reavaliarEtiqueta(String identificacaoAnterior) {
        boolean identificacaoMudou = !Objects.equals(identificacaoAnterior, this.identificacao);

        if (identificacaoMudou && isDisponivel()) {
            disImpressao();
        }
    }

}