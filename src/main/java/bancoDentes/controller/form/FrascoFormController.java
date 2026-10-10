package bancoDentes.controller.form;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.dto.FrascoDTO;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.service.FrascoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para requisições de frascos
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("frasco")
@RequiredArgsConstructor
public class FrascoFormController extends BaseController {

    private final FrascoService frascoService;

    /**
     * Salva um uma edição ou adição de um frasco
     *
     * @param frascoDTO
     */
    @PostMapping("/save")
    public String saveFrasco(@Validated @ModelAttribute("frascoDTO") FrascoDTO frascoDTO,
                             @RequestParam(name = "cadastrarOutro", defaultValue = "false") boolean cadastrarOutro) {
        try {
            Frasco frasco = frascoService.save(frascoDTO);
            this.saveMessage(this.getText("msg.sucesso.frasco.cadastrado", frasco.getIdentificacao()));

            if (cadastrarOutro) {
                return "redirect:/frasco/cadastraFrasco";
            }

            return "redirect:/frasco/painel";

        } catch (FrascoException e) {
            this.saveError(e.getMessage());
            return "redirect:/frasco/painel";
        } catch (Exception e) {
            this.saveError("Erro ao processar: " + e.getMessage());
            return "redirect:/frasco/painel";
        }
    }

}