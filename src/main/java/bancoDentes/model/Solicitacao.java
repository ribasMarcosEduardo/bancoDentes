package bancoDentes.model;

import bancoDentes.model.enumModels.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.StringJoiner;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "SOLICITACAO")
public class Solicitacao {

    @Version
    @Column(name = "VERSION", nullable = false)
    private Long version;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODSOLICITACAO")
    private Long codigo;

    @ManyToOne
    @JoinColumn(name = "CODESTUDANTE")
    private Estudante estudante;

    @Column(name = "DATSOLICITACAO")
    private LocalDateTime datSolicitacao;

    @Column(name = "DATFINALIZACAO")
    private LocalDateTime dataFinalizacao;

    @Column(name = "QUANTIDADE")
    private Long quantidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = true)
    private EstadoDente estado;

    @Enumerated(EnumType.STRING)
    @Column(name = "MAXILAR",nullable = true)
    private Maxilar maxilar;

    @Enumerated(EnumType.STRING)
    @Column(name = "DENTICAO", nullable = true)
    private Denticao denticao;

    @Column(name = "POSICAO")
    private Long posicao;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPDENTE", nullable = false)
    private TipoDente tipoDente;

    @Enumerated(EnumType.STRING)
    @Column(name = "STASOLICITACAO", nullable = false)
    private StatusSolicitacao statusSolicitacao;

    @Column(name = "JUSTIFICATIVA", nullable = false)
    private String justificativa;

    @PrePersist
    protected void onCreate() {
        this.datSolicitacao = LocalDateTime.now();
        this.statusSolicitacao = StatusSolicitacao.PENDENTE;
    }



}
