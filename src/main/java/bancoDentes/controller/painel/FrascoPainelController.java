package bancoDentes.controller.painel;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.service.FrascoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller referente ao painel de frascos
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("frasco")
@RequiredArgsConstructor
public class FrascoPainelController extends BaseController {

    private final FrascoService frascoService;

    /**
     * Exibe o painel principal com a listagem de todos os frascos cadastrados.
     *
     * @param model
     */
    @GetMapping("/painel")
    public String exibePainelFrascos(Model model) {
        model.addAttribute("frascos", frascoService.getFrascos());
        return "painel/painelFrascos";
    }
}
