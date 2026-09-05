package bancoDentes.model;

import bancoDentes.exception.FrascoException;
import bancoDentes.model.enumModels.Denticao;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Arcada;
import bancoDentes.model.enumModels.TipoDente;
import jakarta.persistence.*;
import lombok.*;

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

    // Método que gera a identificação do frasco
    public void gerarIdentificacao() {
        if (codigo == null) {
            throw new FrascoException("Impossível gerar etiqueta: ID do frasco ainda não foi gerado.");
        }
            String siglaArcada = (arcada != null) ? arcada.getSigla() : "";
            String siglaTipo = (tipoDente != null) ? tipoDente.getSigla() : "";
            String siglaEstado = (estado != null) ? estado.getSigla() : "";
            String siglaDenticao = (denticao != null) ? denticao.getSigla() : "";

            this.identificacao = String.format("%s%s%s%s-%s",
                    siglaTipo,
                    siglaArcada,
                    siglaEstado,
                    siglaDenticao,
                    codigo);
    }
}