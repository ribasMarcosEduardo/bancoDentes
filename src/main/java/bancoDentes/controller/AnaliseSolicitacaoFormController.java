package bancoDentes.controller;

import bancoDentes.model.Solicitacao;
import bancoDentes.service.AnaliseEtapasService;
import bancoDentes.service.SolicitacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("analiseSolicitacao")
@RequiredArgsConstructor
public class AnaliseSolicitacaoFormController {

    private final AnaliseEtapasService analiseEtapasService;
    private final SolicitacaoService solicitacaoService;

    @GetMapping("/painel")
    public String exibePainelSolicitacoes(Model model) {
        List<Solicitacao> listaSolicitacoes = solicitacaoService.listarSolicitacoes();
        model.addAttribute("solicitacoes", listaSolicitacoes);
        return "painelAnalise/analiseList";
    }

    @GetMapping("/visualizaSolicitacao/{codigo}")
    public String exibePrimeiraEtapa(@PathVariable("codigo") Long codigo, Model model) {
        model.addAttribute("solicitacao", solicitacaoService.buscarPorId(codigo));
        model.addAttribute("etapas", analiseEtapaService.buscarPorSolicitacao(codigo));
        return "analiseEtapas/visualizaSolicitacao";
    }

    @PostMapping("/etapa1/prosseguir")
    public String prosseguirEtapa1(
            @RequestParam("codSolicitacao") Long codSolicitacao,
            @RequestParam(value = "observacao", required = false) String observacao,
            RedirectAttributes redirectAttributes) {

        try {
          //  analiseSolicitacaoService.prosseguirRevisao(codSolicitacao, observacao);
            return "redirect:/analiseSolicitacao/etapa2?codigo=" + codSolicitacao;
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("mensagemErro", e.getMessage());
            return "redirect:/analiseSolicitacao/etapa1?codigo=" + codSolicitacao;
        }
    }

    @PostMapping("/etapa1/negar")
    public String negarSolicitacao(
            @RequestParam("codSolicitacao") Long codSolicitacao,
            @RequestParam("justificativa") String justificativa,
            RedirectAttributes redirectAttributes) {

        try {
           // analiseSolicitacaoService.negarSolicitacao(codSolicitacao, justificativa);
            redirectAttributes.addFlashAttribute("mensagemSucesso", "Solicitação negada com sucesso.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("mensagemErro", e.getMessage());
        }

        return "redirect:/analiseSolicitacao/painel";
    }

    // ─── ETAPA 2: SEPARAÇÃO ────────────────────────────────────────────────────

    @GetMapping("/etapa2")
    public String exibeEtapa2(@RequestParam("codigo") Long id, Model model) {
        model.addAttribute("solicitacao", solicitacaoService.buscarPorId(id));
      //  model.addAttribute("frascos", analiseSolicitacaoService.buscarFrascosDiposniveis(id));
        return "form/analiseSolicitacaoEtapa2";
    }

    @PostMapping("/etapa2/salvar")
    public String salvarEtapa2(
            @RequestParam("codSolicitacao") Long codSolicitacao,
            @RequestParam("codFrasco") List<Long> codFrasco,
            @RequestParam("quantidadesRetiradas") List<Integer> quantidadesRetiradas,
            RedirectAttributes redirectAttributes) {

        try {
            //List<ItemSolicitacaoDTO> itens = analiseSolicitacaoService
            //        .montarItens(codFrasco, quantidadesRetiradas); // ← monta o DTO corretamente
          //  analiseSolicitacaoService.salvarSeparacao(codSolicitacao, itens);
            return "redirect:/analiseSolicitacao/etapa3?codigo=" + codSolicitacao;
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("mensagemErro", e.getMessage());
            return "redirect:/analiseSolicitacao/etapa2?codigo=" + codSolicitacao;
        }
    }

    // ─── ETAPA 3: RESUMO / CONFIRMAÇÃO FINAL ──────────────────────────────────

    @GetMapping("/etapa3")
    public String exibeEtapa3(@RequestParam("codigo") Long id, Model model) {
        model.addAttribute("solicitacao", solicitacaoService.buscarPorId(id));
        //model.addAttribute("resumo", analiseSolicitacaoService.gerarResumo(id));
        return "form/analiseSolicitacaoEtapa3";
    }

    @PostMapping("/etapa3/confirmar")
    public String confirmarAnalise(
            @RequestParam("codSolicitacao") Long codSolicitacao,
            RedirectAttributes redirectAttributes) {

        try {
            //analiseSolicitacaoService.confirmarAnalise(codSolicitacao);
            redirectAttributes.addFlashAttribute("mensagemSucesso", "Análise confirmada com sucesso!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("mensagemErro", e.getMessage());
            return "redirect:/analiseSolicitacao/etapa3?codigo=" + codSolicitacao;
        }

        return "redirect:/analiseSolicitacao/painel";
    }
}


