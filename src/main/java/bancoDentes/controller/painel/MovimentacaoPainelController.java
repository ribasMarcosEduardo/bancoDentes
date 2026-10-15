package bancoDentes.controller.painel;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.dto.MovimentacaoDTO;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.service.FrascoService;
import bancoDentes.service.MovimentacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

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
    private final FrascoService frascoService;

    /**
     * Exibe o painel principal com a listagem de todas as movimentações cadastrados.
     * Com o parâmetro "frasco", lista só as movimentações daquele frasco
     * (link "Ver movimentações" do painel de frascos).
     *
     * @param codFrasco
     * @param model
     */
    @GetMapping("/painel")
    public String exibePainelMovimentacoes(@RequestParam(name = "frasco", required = false) Long codFrasco, Model model) {
        if (codFrasco == null) {
            model.addAttribute("movimentacao", movimentacaoService.getMovimentacoes());
            return "painel/painelMovimentacoes";
        }

        try {
            Frasco frasco = frascoService.buscarPorId(codFrasco);
            model.addAttribute("frascoFiltro", frasco);
            model.addAttribute("movimentacao", movimentacaoService.getMovimentacoesDoFrasco(codFrasco));
        } catch (FrascoException e) {
            this.saveError(e.getMessage());
            return "redirect:/movimentacao/painel";
        }
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
