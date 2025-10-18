package bancoDentes.repository;

import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.NomeDente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FrascoRepository extends JpaRepository<Frasco, Long> {
    @Query("""
    SELECT f FROM Frasco f
    WHERE (:dente IS NULL OR f.nomDente = :dente)
      AND (:status IS NULL OR f.estado = :status)
      AND (:max IS NULL OR f.maxilar = :max)
""")
    List<Frasco> getFrascosFiltrados(
            @Param("dente") NomeDente nomDente,
            @Param("status") EstadoDente estado,
            @Param("max") Maxilar maxilar
    );
}
