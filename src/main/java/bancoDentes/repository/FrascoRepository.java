package bancoDentes.repository;

import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.TipoDente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface FrascoRepository extends JpaRepository<Frasco, Long> {
    @Query("""
    SELECT f FROM Frasco f
    WHERE (:dente IS NULL OR f.tipoDente = :dente)
      AND (:status IS NULL OR f.estado = :status)
      AND (:max IS NULL OR f.maxilar = :max)
""")
    List<Frasco> getFrascosFiltrados(
            @Param("dente") TipoDente tipoDente,
            @Param("status") EstadoDente estado,
            @Param("max") Maxilar maxilar
    );

    @Query("""
    SELECT new map(
        f.tipoDente as nome,
        COUNT(f) as quantidade
    )
    FROM Frasco f
    GROUP BY f.tipoDente
""")
    List<Map<String, Object>> contarPorTipoDente();

    // Busca todos os frascos, EXCETO os que possuem itens em solicitações PENDENTES
    @Query("""
        SELECT f FROM Frasco f 
        WHERE f.codigo NOT IN (
            SELECT i.frasco.codigo 
            FROM ItemSolicitacao i 
            WHERE i.solicitacao.statusSolicitacao = bancoDentes.model.enumModels.StatusSolicitacao.PENDENTE
        )
    """)
    List<Frasco> findAllDisponiveis();
}



