package bancoDentes.repository;

import bancoDentes.model.Solicitacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {

    List<Solicitacao> findByEstudante_CodEstudante(Long codEstudante);
}
