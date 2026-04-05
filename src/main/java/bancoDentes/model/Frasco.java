package bancoDentes.model;

import bancoDentes.exception.FrascoException;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.NomeDente;
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
    private LocalDateTime datCad = LocalDateTime.now();

    @Column(name = "DATMANUTENCAO")
    private LocalDateTime datManutencao;

    @Enumerated(EnumType.STRING)
    @Column(name = "NOMDENTE", nullable = false)
    private NomeDente nomDente;

    @Column(name = "POSICAO")
    private Long posicao;

    @Enumerated(EnumType.STRING)
    @Column(name = "MAXILAR")
    private Maxilar maxilar;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false)
    private EstadoDente estado;

    @Column(name = "QUANTIDADE", nullable = false)
    private Long quantidade;

    @Column(name = "IDENTIFICACAO", nullable = true)
    private  String identificacao;

    // Método que gera a identificação do frasco
    public void gerarIdentificacao() {
        if (codigo == null) {
            throw new FrascoException("Impossível gerar etiqueta: ID do frasco ainda não foi gerado.");
        }
        String siglaMaxilar = (maxilar != null) ? maxilar.getSigla() : "";

        this.identificacao = String.format("%s%s%s-%s",
                nomDente.getSigla(),
                siglaMaxilar,
                estado.getSigla(),
                codigo);
    }
}