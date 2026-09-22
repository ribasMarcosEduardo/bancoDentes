package bancoDentes.repository;

import bancoDentes.model.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemMovimentacaoRepository extends JpaRepository<ItemMovimentacao, Long> {

    List<ItemMovimentacao> findByMovimentacaoCodigo(Long codMovimentacao);

    Optional<ItemMovimentacao> findByMovimentacaoAndFrasco(Movimentacao movimentacao, Frasco frasco);
}
