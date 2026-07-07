package bancoDentes.repository;

import bancoDentes.model.ItemAnalise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemAnaliseRepository extends JpaRepository<ItemAnalise, Long> {

    List<ItemAnalise> findByAnaliseSolicitacaoCodigo(Long codAnalise);
}
