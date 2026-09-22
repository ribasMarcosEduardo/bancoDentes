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
@Table(name = "ITEM_ANALISE")
public class ItemAnalise {

    @Version
    @Column(name = "VERSION", nullable = false)
    private Long version;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODITEMANALISE")
    private Long codigo;

    @ManyToOne
    @JoinColumn(name = "CODFRASCO", nullable = false)
    private Frasco frasco;

    @ManyToOne
    @JoinColumn(name = "CODANALISE", nullable = false)
    private AnaliseSolicitacao analiseSolicitacao;

    @Column(name = "QUANTIDADE", nullable = false)
    private Long quantidade;
}