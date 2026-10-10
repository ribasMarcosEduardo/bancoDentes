package bancoDentes.repository;

import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface FrascoRepository extends JpaRepository<Frasco, Long> {

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

    List<Frasco> findByStatusFrasco(StatusFrasco statusFrasco);

    @Query("SELECT f FROM Frasco f WHERE f.statusFrasco IN ('DISPONIVEL', 'DIS_IMPRESSAO')")
    List<Frasco> findFrascosDisponiveis();

}



