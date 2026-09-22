package bancoDentes.model;

import bancoDentes.model.enumModels.Local;
import bancoDentes.model.enumModels.TipoMovimentacao;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "MOVIMENTACAO")
public class Movimentacao {

    @Version
    @Column(name = "VERSION", nullable = false)
    private Long version;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODMOVIMENTACAO")
    private Long codigo;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_MOVIMENTACAO", nullable = false)
    private TipoMovimentacao tipoMovimentacao;

    @Column(name = "DATMOVIMENTACAO", nullable = false)
    private LocalDateTime datMovimentacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CODFRASCO", nullable = false)
    private Frasco frasco;

    @Enumerated(EnumType.STRING)
    @Column(name = "LOCAL", nullable = true)
    private Local local;

    @Column(name = "OBSERVACAO", nullable = false)
    private String observacao;

    @OneToMany(mappedBy = "movimentacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemMovimentacao> itens = new ArrayList<>();


}