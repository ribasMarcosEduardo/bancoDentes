package bancoDentes.repository;

import bancoDentes.model.Frasco;
import bancoDentes.model.Manutencao;
import bancoDentes.model.enumModels.StatusManutencao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManutencaoRepository extends JpaRepository<Manutencao, Long> {

    List<Manutencao> findByFrascoAndStatusManutencao(Frasco frasco, StatusManutencao statusManutencao);

    List<Manutencao> findByStatusManutencao(StatusManutencao statusManutencao);

}
