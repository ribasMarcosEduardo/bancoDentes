package bancoDentes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ITEM_MOVIMENTACAO")
public class ItemMovimentacao {

    @Version
    @Column(name = "VERSION", nullable = false)
    private Long version;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODITEMMOV")
    private Long codigo;

    @ManyToOne
    @JoinColumn(name = "CODFRASCO", nullable = false)
    private Frasco frasco;

    @ManyToOne
    @JoinColumn(name = "CODMOVIMENTACAO", nullable = false)
    private Movimentacao movimentacao;

    @Column(name = "QUANTIDADE", nullable = false)
    private Long quantidade;

}
