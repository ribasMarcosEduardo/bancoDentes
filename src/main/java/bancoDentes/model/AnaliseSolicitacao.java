package bancoDentes.model;

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
@Table(name = "ANALISE_SOLICITACAO")
public class AnaliseSolicitacao {

    @Version
    @Column(name = "VERSION", nullable = false)
    private Long version;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODANALISE")
    private Long codigo;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CODSOLICITACAO", nullable = false)
    private Solicitacao solicitacao;

    @Column(name = "DATALTERACAO", nullable = false)
    private LocalDateTime dataAlteracao;

    @Column(name = "JUSTIFICATIVA", length = 500)
    private String justificativa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CODUSUARIO")
    private Usuario analista;

    @PrePersist
    @PreUpdate
    protected void onPersistOrUpdate() {
        this.dataAlteracao = LocalDateTime.now();
    }

    public void negar(String justificativa) {
        this.justificativa = justificativa;
        this.solicitacao.negar();
    }

    public void reabrir() {
        this.justificativa = null;
        this.solicitacao.reabrir();
    }

    public void emSeparacao() {
        this.solicitacao.emSeparacao();
    }

    public void aguardandoRetirada() {
        this.solicitacao.aguardandoRetirada();
    }

    public void concluir() {
        this.solicitacao.concluir();
    }

}