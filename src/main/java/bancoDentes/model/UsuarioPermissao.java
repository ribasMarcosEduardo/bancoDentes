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
@Table(name = "USUARIO_PERMISSAO")
public class UsuarioPermissao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODUSUARIOPERMISSAO")
    private Long codigo;

    @Enumerated(EnumType.STRING)
    @Column(name = "PERMISSAO", nullable = false)
    private Permissao permissao;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CODUSUARIO", nullable = false)
    private Usuario usuario;
}