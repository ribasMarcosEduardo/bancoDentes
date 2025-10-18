package bancoDentes.service;

import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.NomeDente;
import bancoDentes.repository.FrascoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FrascoService {
    private final FrascoRepository frascoRepository;

    public Frasco save(Frasco frasco){
        return frascoRepository.save(frasco);
    }

    public List<Frasco> getPainelFrasco() {
        return frascoRepository.findAll();
    }

    public List<Frasco> getFrascosFiltrados(NomeDente nomeDente, EstadoDente estadoDente, Maxilar maxilar) {
        if (nomeDente == null && estadoDente == null && maxilar == null) {
            return frascoRepository.findAll();
        }

        return frascoRepository.getFrascosFiltrados(nomeDente, estadoDente, maxilar);
    }
}
