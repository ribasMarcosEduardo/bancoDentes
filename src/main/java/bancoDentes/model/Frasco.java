package bancoDentes.model;

import bancoDentes.exception.FrascoException;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.NomeDente;
import bancoDentes.model.enumModels.StatusSolicitacao;
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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODFRASCO")
    private Long codigo;

    @Column(name = "DATCAD", nullable = false)
    private LocalDateTime datCad;

    @Column(name = "DATMANUTENCAO")
    private LocalDateTime datManutencao;

    @Enumerated(EnumType.STRING)
    @Column(name = "NOMDENTE", nullable = true)
    private NomeDente nomDente;

    @Column(name = "POSICAO")
    private Long posicao;

    @Enumerated(EnumType.STRING)
    @Column(name = "MAXILAR")
    private Maxilar maxilar;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = true)
    private EstadoDente estado;

    @Column(name = "QUANTIDADE", nullable = false)
    private Long quantidade;

    @Column(name = "IDENTIFICACAO", nullable = true)
    private  String identificacao;

    @Column(name = "MISTO", length = 1, nullable = false)
    private String misto;

    @PrePersist
    protected void onCreate() {
        this.datCad = LocalDateTime.now();
        if (this.misto == null) {
            this.misto = "N";
        }
    }

    // Método que gera a identificação do frasco
    public void gerarIdentificacao() {
        if (codigo == null) {
            throw new FrascoException("Impossível gerar etiqueta: ID do frasco ainda não foi gerado.");
        }
        if ("S".equalsIgnoreCase(this.misto)) {
            this.identificacao = String.format("ENDO-MISTO-%s", codigo);
        } else {
            String siglaMaxilar = (maxilar != null) ? maxilar.getSigla() : "";
            this.identificacao = String.format("%s%s%s-%s",
                    nomDente.getSigla(),
                    siglaMaxilar,
                    estado.getSigla(),
                    codigo);
        }
    }
}