package bancoDentes.controller.painel;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.service.ManutencaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


/**
 * Controller referente ao painel de manutenções.
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("manutencao")
@RequiredArgsConstructor
public class ManutencaoPainelController extends BaseController {

    final private ManutencaoService manutencaoService;

    /**
     * Exibe o painel principal com a listagem de todas as manuteções cadastrados.
     *
     * @param model
     */
    @GetMapping("/painel")
    public String exibePainelManutencoes(Model model) {
       model.addAttribute("manutencao", manutencaoService.getManutencao());
        return "painel/painelManutencoes";
    }
}
