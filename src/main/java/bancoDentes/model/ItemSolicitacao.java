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
@Table(name = "ITEM_SOLICITACAO")
public class ItemSolicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODITEM")
    private Long codigo;

    @ManyToOne
    @JoinColumn(name = "CODFRASCO", nullable = false)
    private Frasco frasco;

    @ManyToOne
    @JoinColumn(name = "CODSOLICITACAO", nullable = false)
    private Solicitacao solicitacao;

    @Column(name = "QUANTIDADE", nullable = false)
    private Long quantidade;
}