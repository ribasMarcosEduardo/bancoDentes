package bancoDentes.repository;

import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.Denticao;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Arcada;
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
      AND (:max IS NULL OR f.arcada = :max)
""")
    List<Frasco> getFrascosFiltrados(
            @Param("dente") TipoDente tipoDente,
            @Param("status") EstadoDente estado,
            @Param("max") Arcada arcada
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
            FROM ItemAnalise i 
         
        )
    """)
    List<Frasco> findAllDisponiveis();


    @Query("SELECT f FROM Frasco f " +
            "WHERE f.tipoDente = :tipoDente " +
            "AND (:denticao IS NULL OR f.denticao = :denticao) " +
            "AND (:arcada IS NULL OR f.arcada = :arcada) " +
            "AND (:estadoDente IS NULL OR f.estado = :estadoDente) " +
            "AND f.quantidade > 0")
    List<Frasco> getFrascosFiltrados(
            @Param("tipoDente") TipoDente tipoDente,
            @Param("denticao") Denticao denticao,
            @Param("arcada") Arcada arcada,
            @Param("estadoDente") EstadoDente estadoDente
    );
}



