package bancoDentes.service.validator;

import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.StatusFrasco;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.service.BaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Componente responsável por centralizar e aplicar as regras de negócio e de
 * validação para a entidade Frasco.
 *
 * @author Marcos Eduardo Ribas
 */
@Component
@RequiredArgsConstructor
public class FrascoValidator extends BaseService {

    private final FrascoRepository frascoRepository;

    public void validaFrasco(Frasco frasco){
        if (frasco.isInativo()) {
            throw new FrascoException(this.getText("error.frasco.inativo.editar"));
        }
        if (!frasco.isNaFilaImpressao()) {
            throw new FrascoException(this.getText("error.etiqueta.foraDaFila"));
        }
    }

    public void validaFrascoInativacao(Frasco frasco){
        if (frasco.getStatusFrasco() == StatusFrasco.INATIVO) {
            throw new FrascoException(this.getText("error.frasco.inativar.jaInativo"));
        }
        if (frasco.isEmManutencao()) {
            throw new FrascoException(this.getText("error.frasco.inativar.emManutencao"));
        }
    }

    public void validaFrascoExclusao(Frasco frasco){
        if (frascoRepository.possuiVinculo(frasco.getCodigo())) {
            throw new FrascoException(this.getText("error.frasco.excluir.possuiVinculo"));
        }
    }

}
