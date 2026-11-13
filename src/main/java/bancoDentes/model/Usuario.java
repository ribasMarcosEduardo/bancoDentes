package bancoDentes.model;

import bancoDentes.model.enumModels.Permissao;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "USUARIO")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODUSUARIO")
    private Long codigo;

    @Column(name = "NOME")
    private String nome;

    @Column(name = "CREDITO")
    private Long credito;

    @JsonIgnore
    @Column(name = "CODIGO_AD", unique = true, nullable = false)
    private String codigoAd;

    @Column(name = "EMAIL")
    private String email;

    @JsonIgnore
    @Column(name = "VERIFICADO", length = 1, nullable = false)
    private String verificado;

    @Enumerated(EnumType.STRING)
    @Column(name = "PERMISSAO", nullable = false)
    private Permissao permissao;

    @PrePersist
    public void prePersist() {
        if (this.verificado == null || this.verificado.trim().isEmpty()) {
            this.verificado = "N";
        }
        if (this.permissao == null) {
            this.permissao = Permissao.ESTUDANTE;
        }
    }
}