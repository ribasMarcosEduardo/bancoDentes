package bancoDentes.service.validator;

import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.service.BaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Componente responsável por centralizar e aplicar as regras de negócio e de
 * validação para a impressão de etiquetas dos Frasco.
 *
 * @author Marcos Eduardo Ribas
 */
@Component
@RequiredArgsConstructor
public class FrascoImpressaoValidator extends BaseService {

    public void validaListaFrascosImpressao(List<Frasco> frascoList){
        if (frascoList.isEmpty()) {
            throw new FrascoException(getText("error.etiqueta.nenhumFrasco"));
        }
    }

    public void validaImpressaoEtiqueta (Frasco frasco){
        if (!frasco.isPodeEnviarParaImpressao()) {
            throw new FrascoException(this.getText("error.frasco.enviarImpressao.status"));
        }
    }


}
