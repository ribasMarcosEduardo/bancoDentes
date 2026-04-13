package bancoDentes.service.validator;

import bancoDentes.dto.SolicitacaoDTO;
import bancoDentes.model.Estudante;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SolicitacaoValidator {

    public void saveValidator(SolicitacaoDTO dto, Estudante estudante) {
        validaCreditos(estudante.getCredito(),dto.quantidade());
    }

    public void validaCreditos(Long estCredito, Long quantidade){
        if(estCredito < quantidade){
            throw new RuntimeException("Créditos insuficientes para solicitação");
        }
    }

}
