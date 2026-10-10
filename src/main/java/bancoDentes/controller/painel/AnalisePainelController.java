package bancoDentes.controller.painel;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.dto.AnaliseSolicitacaoDTO;
import bancoDentes.exception.AnaliseException;
import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.model.ItemAnalise;
import bancoDentes.model.Solicitacao;
import bancoDentes.service.AnaliseSolicitacaoService;
import bancoDentes.service.FrascoService;
import bancoDentes.service.ItemAnaliseService;
import bancoDentes.service.SolicitacaoService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

/**
 * Controlle  referente ao painel de Análise das solicitações feitas pelos estudantes.
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("analiseSolicitacao")
@RequiredArgsConstructor
public class AnalisePainelController extends BaseController{

    private final AnaliseSolicitacaoService analiseSolicitacaoService;
    private final SolicitacaoService solicitacaoService;
    private final FrascoService frascoService;
    private final ItemAnaliseService itemAnaliseService;

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

    /**
     * Inicia formalmente o processo de análise de uma solicitação, alterando
     * o status dela e criando a entidade de acompanhamento.
     *
     * @param codSolicitacao
     */
    @PostMapping("/analisar/{codSolicitacao}")
    public String analisar(@PathVariable("codSolicitacao") Long codSolicitacao) {
        try {
            analiseSolicitacaoService.save(codSolicitacao);
            return "redirect:/analiseSolicitacao/visualizaSolicitacao/" + codSolicitacao;
        } catch (AnaliseException e) {
            this.saveError(e.getMessage());
            return "redirect:/analiseSolicitacao/painel";
        } catch (Exception e) {
            this.saveError(this.getText("error.analise.processamento"));
            return "redirect:/analiseSolicitacao/painel";
        }
    }

    /**
     * Processa a recusa de uma solicitação por parte do avaliador.
     * Estorna os créditos do estudante, salva a justificativa e finaliza o processo.
     *
     * @param dto
     * @param request
     */
    @PostMapping("/negarSolicitacao")
    public String negarSolicitacao(@ModelAttribute("analiseSolicitacaoDTO") AnaliseSolicitacaoDTO dto, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        try {
            analiseSolicitacaoService.negarSolicitacao(dto);
            this.saveMessage(this.getText("msg.sucesso.analise.finalizada"));
            return "redirect:/analiseSolicitacao/painel";
        } catch (AnaliseException e) {
            this.saveError(e.getMessage());
            return "redirect:/analiseSolicitacao/painel";
        } catch (Exception e) {
            this.saveError(this.getText("error.analise.processamento"));
            return "redirect:/analiseSolicitacao/painel";
        }
    }

    /**
     * Reabre uma solicitação que estava fechada, validando
     * novamente os créditos do estudante para retomar a análise.
     *
     * @param dto
     */
    @PostMapping("/reabrirSolicitacao")
    public String reabrirSolicitacao(@ModelAttribute("analiseSolicitacaoDTO") AnaliseSolicitacaoDTO dto, RedirectAttributes redirectAttributes) {
        try {
            analiseSolicitacaoService.reabrirSolicitacao(dto);
            this.saveMessage(this.getText("msg.sucesso.analise.reaberta"));
            return "redirect:/analiseSolicitacao/painel";
        } catch (AnaliseException e) {
            this.saveError(e.getMessage());
            return "redirect:/analiseSolicitacao/painel";
        } catch (Exception e) {
            this.saveError(this.getText("error.analise.processamento"));
            return "redirect:/analiseSolicitacao/painel";
        }
    }

    /**
     * Exibe a primeira etapa do fluxo de avaliação: a visualização detalhada
     * dos dados do pedido feito pelo estudante.
     *
     * @param codSolicitacao
     * @param model
     */
    @GetMapping("/visualizaSolicitacao/{codSolicitacao}")
    public String visualizaSolicitacao(@PathVariable("codSolicitacao") Long codSolicitacao, Model model, RedirectAttributes redirectAttributes) {
        try {
            Solicitacao solicitacao = solicitacaoService.buscarPorCodigo(codSolicitacao);
            AnaliseSolicitacao analise = analiseSolicitacaoService.buscarPorCodSolicitacao(codSolicitacao);

            List<ItemAnalise> itensSalvos = itemAnaliseService.buscarItensPorAnalise(analise.getCodigo());

            model.addAttribute("solicitacao", solicitacao);
            model.addAttribute("analise", analise);
            model.addAttribute("itensSalvos", itensSalvos);
            model.addAttribute("totalJaSeparado", itensSalvos.stream().mapToLong(ItemAnalise::getQuantidade).sum());
            model.addAttribute("frascos", frascoService.getFrascosFiltrados(solicitacao));

            return "analiseEtapas/visualizaSolicitacao";
        } catch (AnaliseException e) {
            this.saveError(e.getMessage());
            return "redirect:/analiseSolicitacao/painel";
        } catch (Exception e) {
            this.saveError(this.getText("error.analise.processamento"));
            return "redirect:/analiseSolicitacao/painel";
        }
    }

}
