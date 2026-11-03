package bancoDentes.model;

import bancoDentes.model.enumModels.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @Column(name = "ARCADA",nullable = true)
    private Arcada arcada;

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

    @OneToOne(mappedBy = "solicitacao")
    @JsonIgnore
    private AnaliseSolicitacao analiseSolicitacao;

    @PrePersist
    @PreUpdate
    public void prePersistOrUpdate() {
        if (this.tipoDente == TipoDente.ENDO) {
            this.posicao = null;
            this.arcada = null;
            this.estado = null;
            this.denticao = null;
        }
        if (this.datSolicitacao == null) {
            this.datSolicitacao = LocalDateTime.now();
        }
        if (this.statusSolicitacao == null) {
            this.statusSolicitacao = StatusSolicitacao.PENDENTE;
        }
    }
    public void iniciarAnalise(){
        this.statusSolicitacao = StatusSolicitacao.EM_ANALISE;
    }

    public void negar() {
        this.statusSolicitacao = StatusSolicitacao.NEGADO;
        this.dataFinalizacao = LocalDateTime.now();
    }

    public void reabrir() {
        this.iniciarAnalise();
        this.dataFinalizacao = null;
    }

    public void aguardandoRetirada() {
        this.statusSolicitacao = StatusSolicitacao.AGUARDANDO_RETIRADA;
    }

    public void concluir() {
        this.statusSolicitacao = StatusSolicitacao.CONCLUIDO;
        this.dataFinalizacao = LocalDateTime.now();
    }

    public boolean isApto() {
        return LocalDateTime.now().isAfter(this.datSolicitacao.plusHours(4));
    }

    public boolean isEditavel() {
        return !this.isApto() && StatusSolicitacao.PENDENTE.equals(this.statusSolicitacao);
    }

    public void emSeparacao(){
        this.statusSolicitacao = StatusSolicitacao.EM_SEPARACAO;
    }

    public boolean isNegar() {
        return StatusSolicitacao.PENDENTE.equals(this.statusSolicitacao)
                || StatusSolicitacao.EM_ANALISE.equals(this.statusSolicitacao);
    }

    public boolean isContinuar() {
        return StatusSolicitacao.EM_ANALISE.equals(this.statusSolicitacao)
                || StatusSolicitacao.EM_SEPARACAO.equals(this.statusSolicitacao)
                || StatusSolicitacao.AGUARDANDO_RETIRADA.equals(this.statusSolicitacao);
    }

    public boolean isReabrir() {
        return StatusSolicitacao.CONCLUIDO.equals(this.statusSolicitacao)
                || StatusSolicitacao.NEGADO.equals(this.statusSolicitacao);
    }

    public boolean isPendente() {
        return StatusSolicitacao.PENDENTE.equals(this.statusSolicitacao);
    }

}
