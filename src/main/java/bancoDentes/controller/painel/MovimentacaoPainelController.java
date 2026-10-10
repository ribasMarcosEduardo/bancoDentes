package bancoDentes.controller.painel;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.dto.MovimentacaoDTO;
import bancoDentes.service.MovimentacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller referente ao painel de movimentações.
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("movimentacao")
@RequiredArgsConstructor
public class MovimentacaoPainelController extends BaseController {

    private final MovimentacaoService movimentacaoService;

    /**
     * Exibe o painel principal com a listagem de todas as movimentações cadastrados.
     *
     * @param model
     */
    @GetMapping("/painel")
    public String exibePainelMovimentacoes(Model model) {
        model.addAttribute("movimentacao", movimentacaoService.getMovimentacoes());
        return "painel/painelMovimentacoes";
    }

    /**
     * Renderiza o formulário em branco para a criação de uma nova solicitação de dentes.
     *
     * @param model
     */
    @GetMapping("/cadastrarMovimentacao")
    public String cadastrarMovimentacao(Model model) {
        try {
            model.addAttribute("movimentacaoDTO", MovimentacaoDTO.empty());
            return "form/movimentacaoForm";

        } catch (Exception e) {
            this.saveError(this.getText("error.carregamento"));
            return "redirect:/movimentacao/painel";
        }
    }

}
