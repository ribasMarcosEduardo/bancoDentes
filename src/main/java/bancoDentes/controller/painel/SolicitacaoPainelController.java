package bancoDentes.controller.painel;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.model.Estudante;
import bancoDentes.model.Solicitacao;
import bancoDentes.service.EstudanteService;
import bancoDentes.service.SolicitacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

/**
 * Controller referente ao painel de Solicitações de dentes feitas pelos estudantes.
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("solicitacao")
@RequiredArgsConstructor
public class SolicitacaoPainelController extends BaseController{

    private final SolicitacaoService solicitacaoService;
    private final EstudanteService estudanteService;

    /**
     * Exibe o painel do estudante listando todas as suas solicitações.
     *
     * @param model
     */
    @GetMapping("/painel")
    public String exibePainelSolicitacoes(Model model) {
        try {
            Estudante usuarioLogado = this.estudanteService.buscarPorId(2L);
            List<Solicitacao> solicitacoes = solicitacaoService.buscarPorEstudante(usuarioLogado.getCodEstudante());

            model.addAttribute("solicitacoes", solicitacoes);
            model.addAttribute("pendentes", solicitacaoService.getPendentes(solicitacoes));
            model.addAttribute("concluidas", solicitacaoService.getConcluidas(solicitacoes));
            model.addAttribute("usuarioLogado", usuarioLogado);

            return "painel/painelSolicitacao";

        } catch (Exception e) {
            this.saveError(this.getText("error.solicitacao.processamento"));
            return "redirect:/";
        }
    }

}
