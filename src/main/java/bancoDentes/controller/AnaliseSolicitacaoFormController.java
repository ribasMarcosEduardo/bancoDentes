package bancoDentes.controller;

import bancoDentes.dto.AnaliseSolicitacaoDTO;
import bancoDentes.dto.ItemAnaliseDTO;
import bancoDentes.exception.AnaliseException;
import bancoDentes.exception.ItemAnaliseException;
import bancoDentes.model.AnaliseSolicitacao;
import bancoDentes.model.ItemAnalise;
import bancoDentes.service.AnaliseSolicitacaoService;
import bancoDentes.service.FrascoService;
import bancoDentes.service.ItemAnaliseService;
import bancoDentes.service.SolicitacaoService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("analiseSolicitacao")
@RequiredArgsConstructor
public class AnaliseSolicitacaoFormController extends BaseController {

    private final AnaliseSolicitacaoService analiseSolicitacaoService;
    private final SolicitacaoService solicitacaoService;
    private final FrascoService frascoService;
    private final ItemAnaliseService itemAnaliseService;

    @GetMapping("/painel")
    public String exibePainelSolicitacoes(Model model) {
        model.addAttribute("solicitacoes", solicitacaoService.getSolicitacoesAptas());
        return "painelAnalise/analiseList";
    }

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

    @GetMapping("/visualizaSolicitacao/{codSolicitacao}")
    public String exibePrimeiraEtapa(@PathVariable("codSolicitacao") Long codSolicitacao, Model model) {
        try{
            model.addAttribute("solicitacao", solicitacaoService.buscarPorCodigo(codSolicitacao));
            model.addAttribute("analise", analiseSolicitacaoService.buscarPorCodSolicitacao(codSolicitacao));
            return "analiseEtapas/visualizaSolicitacao";
        } catch (AnaliseException e) {
            this.saveError(e.getMessage());
            return "redirect:/analiseSolicitacao/painel";
        } catch (Exception e) {
            this.saveError(this.getText("error.analise.processamento"));
            return "redirect:/analiseSolicitacao/painel";
        }
    }

    @PostMapping("/negarSolicitacao")
    public String negarSolicitacao(@ModelAttribute("analiseSolicitacaoDTO") AnaliseSolicitacaoDTO dto, HttpServletRequest request) {
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

    @PostMapping("/reabrir")
    public String reabrir(@ModelAttribute("analiseSolicitacaoDTO") AnaliseSolicitacaoDTO dto) {
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

    @GetMapping("/separacao/{codAnalise}")
    public String separacaoDentes(@PathVariable("codAnalise") Long codAnalise, Model model) {
        try {
            AnaliseSolicitacao analise = analiseSolicitacaoService.buscarPorCodAnalise(codAnalise);
            List<ItemAnalise> itensSalvos = itemAnaliseService.buscarItensPorAnalise(codAnalise);

            model.addAttribute("analise", analise);
            model.addAttribute("itensSalvos", itensSalvos);
            model.addAttribute("totalJaSeparado", itensSalvos.stream()
                    .mapToLong(ItemAnalise::getQuantidade)
                    .sum());
            model.addAttribute("frascos", frascoService.getFrascosFiltrados(analise.getSolicitacao()));

            return "analiseEtapas/separacaoSolicitacao";

        } catch (AnaliseException e) {
            this.saveError(e.getMessage());
            return "redirect:/analiseSolicitacao/painel";
        } catch (Exception e) {
            this.saveError(this.getText("error.analise.processamento"));
            return "redirect:/analiseSolicitacao/painel";
        }
    }

    @PostMapping("/selecionaFrasco")
    public String selecionaFrasco(@ModelAttribute ItemAnaliseDTO dto) {
        try {
            itemAnaliseService.save(dto);
            this.saveMessage(this.getText("msg.sucesso.frasco.alocado"));
        } catch (AnaliseException e) {
            this.saveError(e.getMessage());
        } catch (Exception e) {
            this.saveError(this.getText("error.frasco.alocado", e.getMessage()));
        }
        return "redirect:/analiseSolicitacao/separacao/" + dto.analiseSolicitacao().getCodigo();
    }

    @PostMapping("/removerItem/{codigo}")
    public String removerItem(@PathVariable("codigo") Long codigo) {
        try {
            itemAnaliseService.removerItem(codigo);
            this.saveMessage(this.getText("msg.sucesso.item.removido"));
        } catch (ItemAnaliseException e) {
            this.saveError(e.getMessage());
        } catch (Exception e) {
            this.saveError(this.getText("error.item.removido", e.getMessage()));
        }
        return "redirect:/frasco/painel";
    }


}


