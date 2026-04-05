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
    private Long codItem;

    @ManyToOne
    @JoinColumn(name = "CODSOLICITACAO")
    private Solicitacao solicitacao;

    @ManyToOne
    @JoinColumn(name = "CODFRASCO")
    private Frasco frasco;

    @Column(name = "QUANTIDADE")
    private Long quantidade;
}