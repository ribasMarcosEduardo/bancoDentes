package bancoDentes.controller;

import bancoDentes.dto.AnaliseSolicitacaoDTO;
import bancoDentes.dto.ItemAnaliseDTO;
import bancoDentes.exception.AnaliseException;
import bancoDentes.exception.ItemAnaliseException;
import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.model.ItemAnalise;
import bancoDentes.model.Solicitacao;
import bancoDentes.service.AnaliseSolicitacaoService;
import bancoDentes.service.FrascoService;
import bancoDentes.service.ItemAnaliseService;
import bancoDentes.service.SolicitacaoService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

/**
 * Controlle responsável por gerenciar o fluxo de Análise das solicitações feitas pelos estudantes.
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("analiseSolicitacao")
@RequiredArgsConstructor
public class AnaliseSolicitacaoFormController extends BaseController {

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
        return "painelAnalise/analiseList";
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
     * Altera o status da solicitação para aguardando retirada.
     *
     * @param codSolicitacao
     */
    @PostMapping("/aguardandoRetirada")
    public String aguardandoRetirada(@RequestParam("codSolicitacao") Long codSolicitacao, RedirectAttributes redirectAttributes) {
        try {
            analiseSolicitacaoService.aguardandoRetirada(codSolicitacao);
            this.saveMessage(this.getText("msg.sucesso.separacao.concluida"));
            return "redirect:/analiseSolicitacao/visualizaSolicitacao/" + codSolicitacao;

        } catch (AnaliseException e) {
            this.saveError(e.getMessage());
            return "redirect:/analiseSolicitacao/visualizaSolicitacao/" + codSolicitacao;
        } catch (Exception e) {
            this.saveError(this.getText("error.analise.processamento"));
            return "redirect:/analiseSolicitacao/painel";
        }
    }

    /**
     * Conclui o processo de análise da solicitação.
     *
     * @param codSolicitacao
     */
    @PostMapping("/concluirSolicitacao")
    public String concluirSolicitacao(@RequestParam("codSolicitacao") Long codSolicitacao, RedirectAttributes redirectAttributes) {
        try {
            analiseSolicitacaoService.concluirSolicitacao(codSolicitacao);
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
     * Aloca um frasco selecionado ao processo de análise.
     *
     * @param dto
     */
    @PostMapping("/selecionaFrasco")
    public ResponseEntity<Void> selecionaFrasco(@ModelAttribute ItemAnaliseDTO dto, @RequestParam("codSolicitacao") Long codSolicitacao, RedirectAttributes redirectAttributes) {
        try {
            ItemAnalise itemSalvo = itemAnaliseService.save(dto);
            this.saveMessage(this.getText("msg.sucesso.frasco.alocado"));

            HttpHeaders headers = new HttpHeaders();
            if (itemSalvo != null && itemSalvo.getCodigo() != null) {
                headers.add("Codigo_Item_Analise", itemSalvo.getCodigo().toString());
            }

            return ResponseEntity.ok().headers(headers).build();
        } catch (AnaliseException e) {
            this.saveError(e.getMessage());
        } catch (Exception e) {
            this.saveError(this.getText("error.frasco.alocado", e.getMessage()));
        }
        return ResponseEntity.badRequest().build();
    }

    /**
     * Remove um frasco que havia sido previamente alocado na separação.
     *
     * @param codigo
     */
    @PostMapping("/removerItem/{codigo}")
    public String removerItem(@PathVariable("codigo") Long codigo, @RequestParam("codSolicitacao") Long codSolicitacao, RedirectAttributes redirectAttributes) {
        try {
            itemAnaliseService.removerItem(codigo);
            this.saveMessage(this.getText("msg.sucesso.item.removido"));
        } catch (ItemAnaliseException e) {
            this.saveError(e.getMessage());
        } catch (Exception e) {
            this.saveError(this.getText("error.item.removido", e.getMessage()));
        }
        return "redirect:/analiseSolicitacao/visualizaSolicitacao/" + codSolicitacao;
    }
}