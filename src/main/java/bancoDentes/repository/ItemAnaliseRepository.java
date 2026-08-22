package bancoDentes.repository;

import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.model.Frasco;
import bancoDentes.model.ItemAnalise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemAnaliseRepository extends JpaRepository<ItemAnalise, Long> {

    List<ItemAnalise> findByAnaliseSolicitacaoCodigo(Long codAnalise);

    Optional<ItemAnalise> findByAnaliseSolicitacaoAndFrasco(AnaliseSolicitacao analiseSolicitacao, Frasco frasco);

}
