package bancoDentes.service;

import bancoDentes.model.Frasco;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service responsável por gerenciar processo de impressão de etiquetas para frascos
 */
@Service
@RequiredArgsConstructor
public class ImpressaoService extends BaseService{

    private final FrascoService frascoService;

    public Frasco enviarParaImpressao(Long codFrasco) {
        Frasco frascoAtualizado = frascoService.disponibilizarParaImpressao(codFrasco);
        return frascoAtualizado;
    }

}
