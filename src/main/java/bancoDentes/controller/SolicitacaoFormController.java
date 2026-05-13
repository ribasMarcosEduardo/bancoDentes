package bancoDentes.controller;

import bancoDentes.dto.SolicitacaoDTO;
import bancoDentes.model.Estudante;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.TipoDente;
import bancoDentes.repository.EstudanteRepository;
import bancoDentes.service.EstudanteService;
import bancoDentes.service.FrascoService;
import bancoDentes.service.SolicitacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("solicitacao")
@RequiredArgsConstructor
public class SolicitacaoFormController {
    private final SolicitacaoService solicitacaoService;
    private final EstudanteService estudanteService;

    @GetMapping
    public String cadastrarSolicitacao(Model model){

        Estudante usuarioLogado = this.estudanteService.buscarPorId(2L);
        model.addAttribute("solicitacaoDTO", SolicitacaoDTO.empty());
        model.addAttribute("usuarioLogado", usuarioLogado);
        return "form/solicitacaoForm";
    }

    @PostMapping("/save")
    public String saveSolicitacao(@ModelAttribute("solicitacaoDTO") SolicitacaoDTO dto,
                       RedirectAttributes redirectAttributes) {

        try {
            solicitacaoService.save(dto);
            redirectAttributes.addFlashAttribute("mensagemSucesso", "Solicitação enviada com sucesso!");
            return "redirect:/solicitacao/painel";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("mensagemErro", "Erro ao solicitar: " + e.getMessage());
            return "redirect:/solicitacao/painel";
        }
    }

    @PostMapping("/cancelar/{codigo}")
    public String cancelarSolicitacao(@PathVariable("codigo") Long codigo,
                                     RedirectAttributes redirectAttributes){

        try{
            solicitacaoService.excluirSolicitacao(codigo);
            redirectAttributes.addFlashAttribute("mensagemSucesso", "Solicitação excluído com sucesso!");
        }catch (Exception e){
            redirectAttributes.addFlashAttribute("mensagemErro", "Erro ao excluir: " + e.getMessage());
        }
        return "redirect:/solicitacao/painel";
    }

    @GetMapping("/painel")
    public String exibePainelSolicitacoes(Model model) {

        Long usuarioLogado = 2L;
        List<Solicitacao> listaSolicitacoes = solicitacaoService.buscarPorEstudante(usuarioLogado);
        model.addAttribute("solicitacoes", listaSolicitacoes);

        return "painelSolicitacao/solicitacaoList";
    }

}