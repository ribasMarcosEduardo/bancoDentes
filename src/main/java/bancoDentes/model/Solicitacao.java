package bancoDentes.model;

import bancoDentes.model.enumModels.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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
    @Column(name = "STASOLICITACAO", nullable = true)
    private StatusSolicitacao statusSolicitacao;

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

    @PrePersist
    protected void onCreate() {
        this.datSolicitacao = LocalDateTime.now();
        if (this.statusSolicitacao == null) {
            this.statusSolicitacao = StatusSolicitacao.PENDENTE;
        }
    }



}
