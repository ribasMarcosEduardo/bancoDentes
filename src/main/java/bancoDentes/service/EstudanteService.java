package bancoDentes.service;

import bancoDentes.model.Estudante;
import bancoDentes.repository.EstudanteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EstudanteService {

    //ISSO TUDO É TEMPOÁRIO
    private final EstudanteRepository estudanteRepository;

    public Estudante buscarPorId(Long id) {
        return estudanteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estudante com ID " + id + " não encontrado no banco de dados."));
    }
}
