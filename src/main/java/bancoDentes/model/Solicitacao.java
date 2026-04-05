package bancoDentes.model;

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

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemSolicitacao> itens = new ArrayList<>();

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

    @PrePersist
    protected void onCreate() {
        this.datSolicitacao = LocalDateTime.now();
        if (this.statusSolicitacao == null) {
            this.statusSolicitacao = StatusSolicitacao.PENDENTE;
        }
    }



}
