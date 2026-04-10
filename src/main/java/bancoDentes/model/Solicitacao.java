package bancoDentes.model;

import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.NomeDente;
import bancoDentes.model.enumModels.StatusSolicitacao;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "SOLICITACAO")
public class Solicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODSOLICITACAO")
    private Long codigo;

    @ManyToOne
    @JoinColumn(name = "CODESTUDANTE")
    private Estudante estudante;

    @Enumerated(EnumType.STRING)
    @Column(name = "STASOLICITACAO")
    private StatusSolicitacao statusSolicitacao;

    @Column(name = "DATSOLICITACAO")
    private LocalDateTime datSolicitacao;

    @Column(name = "DATFINALIZACAO")
    private LocalDateTime dataFinalizacao;

    @Column(name = "QUANTIDADE")
    private Long quantidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false)
    private EstadoDente estado;

    @Enumerated(EnumType.STRING)
    @Column(name = "MAXILAR")
    private Maxilar maxilar;

    @Column(name = "POSICAO")
    private Long posicao;

    @Enumerated(EnumType.STRING)
    @Column(name = "NOMDENTE", nullable = false)
    private NomeDente nomDente;

    @PrePersist
    protected void onCreate() {
        this.datSolicitacao = LocalDateTime.now();
        if (this.statusSolicitacao == null) {
            this.statusSolicitacao = StatusSolicitacao.PENDENTE;
        }
    }



}
