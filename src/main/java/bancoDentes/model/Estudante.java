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
@Table(name = "ESTUDANTE")
public class Estudante {
//classe teste

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODESTUDANTE")
    private Long codEstudante;

    @Column(name = "NOME")
    private String nome;

    @Column(name = "CREDITO")
    private Long Credito;


}
