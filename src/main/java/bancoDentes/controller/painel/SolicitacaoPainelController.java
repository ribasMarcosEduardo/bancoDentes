package bancoDentes.controller.painel;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.dto.SolicitacaoDTO;
import bancoDentes.exception.SolicitacaoException;
import bancoDentes.exception.UsuarioException;
import bancoDentes.model.Usuario;
import bancoDentes.model.Solicitacao;
import bancoDentes.service.UsuarioService;
import bancoDentes.service.SolicitacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
    private final UsuarioService usuarioService;

    /**
     * Exibe o painel do estudante listando todas as suas solicitações.
     *
     * @param model
     */
    @GetMapping("/painel")
    public String exibePainelSolicitacoes(Model model) {
        try {
            Usuario usuarioLogado = this.usuarioService.getUsuarioLogado();
            List<Solicitacao> solicitacoes = solicitacaoService.buscarPorUsuario(usuarioLogado.getCodigo());

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

    /**
     * Renderiza o formulário em branco para a criação de uma nova solicitação de dentes.
     *
     * @param model
     */
    @GetMapping("/cadastrarSolicitacao")
    public String cadastrarSolicitacao(Model model) {
        try {
            Usuario usuarioLogado = this.usuarioService.getUsuarioPorCodigo(2L);
            model.addAttribute("solicitacaoDTO", SolicitacaoDTO.empty());
            model.addAttribute("usuarioLogado", usuarioLogado);

            return "form/solicitacaoForm";

        } catch (UsuarioException e) {
            this.saveError(e.getMessage());
            return "redirect:/solicitacao/painel";
        } catch (Exception e) {
            this.saveError(this.getText("error.carregamento"));
            return "redirect:/solicitacao/painel";
        }
    }

    /**
     * Processa a requisição para excluir logicamente ou fisicamente uma solicitação existente.
     *
     * @param codigo
     */
    @PostMapping("/excluir/{codigo}")
    public String excluirSolicitacao(@PathVariable("codigo") Long codigo) {
        try {
            solicitacaoService.excluirSolicitacao(codigo);
            this.saveMessage(this.getText("msg.sucesso.solicitacao.excluida"));

        } catch (SolicitacaoException e) {
            this.saveError(e.getMessage());
        } catch (Exception e) {
            this.saveError(this.getText("error.solicitacao.excluir", e.getMessage()));
        }

        return "redirect:/solicitacao/painel";
    }
}
