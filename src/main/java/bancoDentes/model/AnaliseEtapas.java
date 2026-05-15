package bancoDentes.model;

import bancoDentes.model.enumModels.StatusEtapa;
import bancoDentes.model.enumModels.StatusSolicitacao; // Certifique-se de que o caminho do seu Enum está correto
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
@Table(name = "ANALISE_ETAPA")
public class AnaliseEtapas {

    @Version
    @Column(name = "VERSION", nullable = false)
    private Long version;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODETAPA")
    private Long codigo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CODSOLICITACAO", nullable = false)
    private Solicitacao solicitacao;

    @Column(name = "DATALTERACAO", nullable = false)
    private LocalDateTime dataAlteracao;

    @Enumerated(EnumType.STRING)
    @Column(name = "STAETAPA", nullable = false)
    private StatusEtapa statusEtapa;

    @Column(name = "JUSTIFICATIVA", length = 500)
    private String justificativa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CODUSUARIO")
    private Estudante analista;

    @PrePersist
    @PreUpdate
    protected void onPersistOrUpdate() {
        this.dataAlteracao = LocalDateTime.now();
        this.statusEtapa = statusEtapa.EM_ANDAMENTO;
    }

}