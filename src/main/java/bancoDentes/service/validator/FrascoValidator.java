package bancoDentes.service.validator;

import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.service.BaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Componente responsável por centralizar e aplicar as regras de negócio e de
 * validação para a entidade Frasco.
 *
 * @author Marcos Eduardo Ribas
 */
@Component
@RequiredArgsConstructor
public class FrascoValidator extends BaseService {

    public void validaFrasco(Frasco frasco){
        if (frasco.isInativo()) {
            throw new FrascoException(this.getText("error.frasco.inativo.editar"));
        }
    }

}
