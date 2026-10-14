package bancoDentes.repository;

import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface FrascoRepository extends JpaRepository<Frasco, Long> {

    @Query("SELECT f FROM Frasco f " +
            "WHERE f.tipoDente = :tipoDente " +
            "AND (:denticao IS NULL OR f.denticao = :denticao) " +
            "AND (:arcada IS NULL OR f.arcada = :arcada) " +
            "AND (:estadoDente IS NULL OR f.estado = :estadoDente) " +
            "AND f.quantidade > 0 " +
            "AND (f.statusFrasco IS NULL OR f.statusFrasco <> 'INATIVO')")
    List<Frasco> getFrascosFiltrados(
            @Param("tipoDente") TipoDente tipoDente,
            @Param("denticao") Denticao denticao,
            @Param("arcada") Arcada arcada,
            @Param("estadoDente") EstadoDente estadoDente
    );

    List<Frasco> findByStatusFrasco(StatusFrasco statusFrasco);

    @Query("SELECT f FROM Frasco f WHERE f.statusFrasco IN ('DISPONIVEL', 'DIS_IMPRESSAO')")
    List<Frasco> findFrascosDisponiveis();

    /**
     * Códigos dos frascos que possuem histórico (movimentação, manutenção ou item de análise)
     * e por isso não podem ser excluídos fisicamente, apenas inativados.
     */
    @Query("SELECT f.codigo FROM Frasco f " +
            "WHERE EXISTS (SELECT m FROM Movimentacao m WHERE m.frasco = f) " +
            "OR EXISTS (SELECT mt FROM Manutencao mt WHERE mt.frasco = f) " +
            "OR EXISTS (SELECT i FROM ItemAnalise i WHERE i.frasco = f)")
    Set<Long> findCodigosComVinculo();

    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Frasco f " +
            "WHERE f.codigo = :codigo " +
            "AND (EXISTS (SELECT m FROM Movimentacao m WHERE m.frasco = f) " +
            "OR EXISTS (SELECT mt FROM Manutencao mt WHERE mt.frasco = f) " +
            "OR EXISTS (SELECT i FROM ItemAnalise i WHERE i.frasco = f))")
    boolean possuiVinculo(@Param("codigo") Long codigo);

}



