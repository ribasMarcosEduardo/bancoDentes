package bancoDentes.model;

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
    @Column(name = "CODESTUDANTE")
    private Long codUsuario;

    @Column(name = "CREDITO")
    private Long credito;

    @Column(name = "CODIGO_AD", unique = true, nullable = false)
    private String codigoAd;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "VERIFICADO")
    private boolean verificado = false;
}