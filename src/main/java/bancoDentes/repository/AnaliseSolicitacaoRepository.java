package bancoDentes.repository;

import bancoDentes.model.AnaliseSolicitacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnaliseSolicitacaoRepository extends JpaRepository<AnaliseSolicitacao, Long> {

    Optional<AnaliseSolicitacao> findBySolicitacaoCodigo(Long codigo);

}
