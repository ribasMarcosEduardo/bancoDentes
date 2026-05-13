package bancoDentes.controller;

import bancoDentes.dto.ItemSolicitacaoDTO;
import bancoDentes.dto.SolicitacaoDTO;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.TipoDente;
import bancoDentes.service.AnaliseSolicitacaoService;
import bancoDentes.service.SolicitacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("analiseSolicitacao")
@RequiredArgsConstructor
public class AnaliseSolicitacaoFormController {

    private final AnaliseSolicitacaoService analiseSolicitacaoService;
    private final SolicitacaoService solicitacaoService;

    @GetMapping
    public String analiseSolicitacao(@RequestParam(value = "codSolicitacao", required = false) Long id, Model model){
        model.addAttribute("itemSolicitacaoDTO", ItemSolicitacaoDTO.empty());
        return "form/analiseSolicitacaoForm";
    }

    @GetMapping("/painel")
    public String exibePainelSolicitacoes(Model model) {
        List<Solicitacao> listaSolicitacoes = solicitacaoService.listarSolicitacoes();
        model.addAttribute("solicitacoes", listaSolicitacoes);
        return "painelAnalise/analiseList";
    }

}
