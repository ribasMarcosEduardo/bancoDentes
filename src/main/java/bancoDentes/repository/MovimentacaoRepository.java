package bancoDentes.repository;

import bancoDentes.model.Frasco;
import bancoDentes.model.Movimentacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MovimentacaoRepository  extends JpaRepository<Movimentacao, Long> {

    void deleteByFrasco(Frasco frasco);

    List<Movimentacao> findByFrascoCodigo(Long codigo);

    /**
     * Soma das quantidades movimentadas por frasco, tipo e origem da movimentação.
     * Cada linha: [codFrasco (Long), tipo (TipoMovimentacao), origem (OrigemMovimentacao), soma (Long)].
     */
    @Query("SELECT m.frasco.codigo, m.tipoMovimentacao, m.origem, SUM(m.quantidade) FROM Movimentacao m " +
            "GROUP BY m.frasco.codigo, m.tipoMovimentacao, m.origem")
    List<Object[]> somarQuantidadesPorFrascoTipoEOrigem();
}
