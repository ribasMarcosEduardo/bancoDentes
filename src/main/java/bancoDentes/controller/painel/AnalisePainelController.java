package bancoDentes.controller.painel;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.service.SolicitacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controlle  referente ao painel de Análise das solicitações feitas pelos estudantes.
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("analiseSolicitacao")
@RequiredArgsConstructor
public class AnalisePainelController extends BaseController{

    private final SolicitacaoService solicitacaoService;

    /**
     * Exibe o painel principal do avaliador, listando todas as solicitações que
     * estão aptas para passarem por análise.
     *
     * @param model
     */
    @GetMapping("/painel")
    public String exibePainelSolicitacoes(Model model) {
        model.addAttribute("solicitacoes", solicitacaoService.getSolicitacoesAptas());
        return "painel/painelAnalise";
    }

}
