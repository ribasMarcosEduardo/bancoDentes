package bancoDentes.repository;

import bancoDentes.model.Movimentacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimentacaoRepository  extends JpaRepository<Movimentacao, Long> {
}
