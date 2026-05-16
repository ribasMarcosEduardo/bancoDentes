package bancoDentes.controller;

import bancoDentes.dto.AnaliseSolicitacaoDTO;
import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.service.AnaliseSolicitacaoService;
import bancoDentes.service.FrascoService;
import bancoDentes.service.SolicitacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("analiseSolicitacao")
@RequiredArgsConstructor
public class AnaliseSolicitacaoFormController {

    private final AnaliseSolicitacaoService analiseSolicitacaoService;
    private final SolicitacaoService solicitacaoService;
    private final FrascoService frascoService;

    @GetMapping("/painel")
    public String exibePainelSolicitacoes(Model model) {
        model.addAttribute("solicitacoes", solicitacaoService.getSolicitacoesAptas());
        return "painelAnalise/analiseList";
    }

    @PostMapping("/analisar/{codSolicitacao}")
    public String analisar(@PathVariable("codSolicitacao") Long codSolicitacao, RedirectAttributes redirectAttributes) {
        try {
            analiseSolicitacaoService.save(codSolicitacao);
            return "redirect:/analiseSolicitacao/visualizaSolicitacao/" + codSolicitacao;
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("mensagemErro", "Erro ao processar a análise do pedido!");
            return "redirect:/analiseSolicitacao/painel";
        }
    }

    @GetMapping("/visualizaSolicitacao/{codSolicitacao}")
    public String exibePrimeiraEtapa(@PathVariable("codSolicitacao") Long codSolicitacao, Model model) {
        model.addAttribute("solicitacao", solicitacaoService.buscarPorCodigo(codSolicitacao));
        model.addAttribute("analise", analiseSolicitacaoService.buscarPorCodSolicitacao(codSolicitacao));
        return "analiseEtapas/visualizaSolicitacao";
    }

    @PostMapping("/rejeitar")
    public String rejeitar(@ModelAttribute("analiseSolicitacaoDTO") AnaliseSolicitacaoDTO dto, RedirectAttributes redirectAttributes) {
        try {
            analiseSolicitacaoService.rejeitarSolicitacao(dto);
            redirectAttributes.addFlashAttribute("mensagemSucesso", "Análise finalizada!");
            return "redirect:/analiseSolicitacao/painel";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("mensagemErro", "Erro ao processar a análise do pedido!");
            return "redirect:/analiseSolicitacao/painel";
        }
    }

    @PostMapping("/reabrir")
    public String reabrir(@ModelAttribute("analiseSolicitacaoDTO") AnaliseSolicitacaoDTO dto, RedirectAttributes redirectAttributes) {
        try {
            analiseSolicitacaoService.reabrirSolicitacao(dto);
            redirectAttributes.addFlashAttribute("mensagemSucesso", "Análise reaberta!");
            return "redirect:/analiseSolicitacao/painel";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("mensagemErro", "Erro ao processar a análise do pedido!");
            return "redirect:/analiseSolicitacao/painel";
        }
    }

    @GetMapping("/separacao/{codAnalise}")
    public String separacaoDentes(@PathVariable("codAnalise") Long codAnalise, Model model) {
        AnaliseSolicitacao analise = analiseSolicitacaoService.buscarPorCodAnalise(codAnalise);
        model.addAttribute("analise", analise);
        model.addAttribute("frascos", frascoService.getFrascosFiltrados(analise.getSolicitacao()));
        return "analiseEtapas/separacaoSolicitacao";
    }

}


