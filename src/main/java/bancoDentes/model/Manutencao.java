package bancoDentes.model;

import bancoDentes.model.enumModels.OrigemManutencao;
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
@Table(name = "MANUTENCAO")
public class Manutencao {

    @Version
    @Column(name = "VERSION", nullable = false)
    private Long version;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODMANUTENCAO")
    private Long codigo; 

    @ManyToOne
    @JoinColumn(name = "CODFRASCO", nullable = false)
    private Frasco frasco;

    @Column(name = "DATCADASTRO", nullable = false)
    private LocalDateTime datCadastro;

    @Enumerated(EnumType.STRING)
    @Column(name = "ORIGEM", nullable = true)
    private OrigemManutencao origem;

    @Column(name = "OBSERVACAO", nullable = false)
    private String observacao;

}
