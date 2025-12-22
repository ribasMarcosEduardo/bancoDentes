package bancoDentes.model;

import bancoDentes.exception.FrascoException;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.NomeDente;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "FRASCO")
public class Frasco {

    // Tabela e colunas
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODFRASCO")
    private Long codFrasco;

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
        if (codFrasco == null) {
            throw new FrascoException("Impossível gerar etiqueta: ID do frasco ainda não foi gerado.");
        }
        if (nomDente == null) {
            throw new FrascoException("Impossível gerar etiqueta: Tipo de dente não informado.");
        }

        this.identificacao = String.format("%s-%s", nomDente.getSigla(), codFrasco);
    }
}