package bancoDentes.repository;

import bancoDentes.model.Frasco;
import bancoDentes.model.Movimentacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimentacaoRepository  extends JpaRepository<Movimentacao, Long> {

    void deleteByFrasco(Frasco frasco);
}
