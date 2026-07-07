package bancoDentes.controller;

import bancoDentes.dto.SolicitacaoDTO;
import bancoDentes.exception.EstudanteException;
import bancoDentes.exception.SolicitacaoException;
import bancoDentes.model.Estudante;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.TipoDente;
import bancoDentes.repository.EstudanteRepository;
import bancoDentes.service.EstudanteService;
import bancoDentes.service.FrascoService;
import bancoDentes.service.SolicitacaoService;
import jakarta.servlet.http.HttpServletRequest;
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
public class SolicitacaoFormController extends BaseController{

    private final SolicitacaoService solicitacaoService;
    private final EstudanteService estudanteService;

    @GetMapping
    public String cadastrarSolicitacao(Model model, HttpServletRequest request) {
        try {
            Estudante usuarioLogado = this.estudanteService.buscarPorId(2L);
            model.addAttribute("solicitacaoDTO", SolicitacaoDTO.empty());
            model.addAttribute("usuarioLogado", usuarioLogado);

            return "form/solicitacaoForm";

        } catch (EstudanteException e) {
            this.saveError(request, e.getMessage());
            return "redirect:/solicitacao/painel";
        } catch (Exception e) {
            this.saveError(request, this.getText("error.solicitacao.processamento"));
            return "redirect:/solicitacao/painel";
        }
    }

    @PostMapping("/save")
    public String saveSolicitacao(@ModelAttribute("solicitacaoDTO") SolicitacaoDTO dto, HttpServletRequest request) {
        try {
            solicitacaoService.save(dto);
            this.saveMessage(request, this.getText("msg.sucesso.solicitacao.enviada"));
            return "redirect:/solicitacao/painel";

        } catch (SolicitacaoException e) {
            this.saveError(request, e.getMessage());
            return "redirect:/solicitacao/painel";
        } catch (Exception e) {
            this.saveError(request, this.getText("error.solicitacao.salvar", e.getMessage()));
            return "redirect:/solicitacao/painel";
        }
    }

    @PostMapping("/cancelar/{codigo}")
    public String cancelarSolicitacao(@PathVariable("codigo") Long codigo, HttpServletRequest request) {
        try {
            solicitacaoService.excluirSolicitacao(codigo);
            this.saveMessage(request, this.getText("msg.sucesso.solicitacao.excluida"));

        } catch (SolicitacaoException e) {
            this.saveError(request, e.getMessage());
        } catch (Exception e) {
            this.saveError(request, this.getText("error.solicitacao.excluir", e.getMessage()));
        }

        return "redirect:/solicitacao/painel";
    }

    @GetMapping("/painel")
    public String exibePainelSolicitacoes(Model model, HttpServletRequest request) {
        try {
            Long usuarioLogado = 2L;
            model.addAttribute("solicitacoes", solicitacaoService.buscarPorEstudante(usuarioLogado));
            return "painelSolicitacao/solicitacaoList";
        } catch (Exception e) {
            this.saveError(request, this.getText("error.solicitacao.processamento"));
            return "redirect:/";
        }
    }
}