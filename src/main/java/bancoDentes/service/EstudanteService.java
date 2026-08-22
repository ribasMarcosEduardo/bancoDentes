package bancoDentes.service;

import bancoDentes.exception.EstudanteException;
import bancoDentes.model.Estudante;
import bancoDentes.repository.EstudanteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EstudanteService {

    //ISSO TUDO É TEMPOÁRIO
    private final EstudanteRepository estudanteRepository;

    public Estudante buscarPorId(Long id) throws EstudanteException {
        return estudanteRepository.findById(id)
                .orElseThrow(() -> new EstudanteException("Estudante com ID " + id + " não encontrado no banco de dados."));
    }
}
