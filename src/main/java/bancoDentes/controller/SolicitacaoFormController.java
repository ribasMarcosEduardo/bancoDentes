package bancoDentes.controller;

import bancoDentes.dto.SolicitacaoDTO;
import bancoDentes.model.Estudante;
import bancoDentes.model.Solicitacao;
import bancoDentes.repository.EstudanteRepository;
import bancoDentes.service.FrascoService;
import bancoDentes.service.SolicitacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("solicitacao")
@RequiredArgsConstructor
public class SolicitacaoFormController {
    private final SolicitacaoService solicitacaoService;
    private final FrascoService frascoService;


    @GetMapping
    public String cadastrarSolicitacao(Model model){
        model.addAttribute("solicitacaoDTO", SolicitacaoDTO.empty());
        model.addAttribute("frascos", frascoService.getPainelFrasco());
        return "form/solicitacaoForm";
    }

    @PostMapping("/save")
    public String saveSolicitacao(@ModelAttribute("solicitacaoDTO") SolicitacaoDTO dto,
                       RedirectAttributes redirectAttributes) {
        try {
            solicitacaoService.save(dto);
            redirectAttributes.addFlashAttribute("mensagemSucesso", "Solicitação enviada com sucesso!");
            return "redirect:/solicitacao";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("mensagemErro", "Erro ao solicitar: " + e.getMessage());
            return "redirect:/solicitacao";
        }
    }
}
