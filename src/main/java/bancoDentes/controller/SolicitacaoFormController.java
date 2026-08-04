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
    public String cadastrarSolicitacao(Model model) {
        try {
            Estudante usuarioLogado = this.estudanteService.buscarPorId(2L);
            model.addAttribute("solicitacaoDTO", SolicitacaoDTO.empty());
            model.addAttribute("usuarioLogado", usuarioLogado);

            return "form/solicitacaoForm";

        } catch (EstudanteException e) {
            this.saveError(e.getMessage());
            return "redirect:/solicitacao/painel";
        } catch (Exception e) {
            this.saveError(this.getText("error.solicitacao.processamento"));
            return "redirect:/solicitacao/painel";
        }
    }

    @GetMapping("/edit/{codSolicitacao}")
    public String editSolicitacao(@PathVariable Long codSolicitacao, Model model) {
        try {
            Estudante usuarioLogado = this.estudanteService.buscarPorId(2L);
            Solicitacao solicitacao = this.solicitacaoService.buscarPorCodigo(codSolicitacao);

            SolicitacaoDTO dto = SolicitacaoDTO.recuperaSolicitacao(solicitacao);

            model.addAttribute("solicitacaoDTO", dto);
            model.addAttribute("usuarioLogado", usuarioLogado);

            return "form/solicitacaoForm";

        } catch (Exception e) {
            this.saveError(this.getText("error.solicitacao.processamento"));
            return "redirect:/solicitacao/painel";
        }
    }

    @PostMapping("/save")
    public String saveSolicitacao(@ModelAttribute("solicitacaoDTO") SolicitacaoDTO dto) {
        try {
            solicitacaoService.save(dto);
            this.saveMessage(this.getText("msg.sucesso.solicitacao.enviada"));
            return "redirect:/solicitacao/painel";

        } catch (SolicitacaoException e) {
            this.saveError(e.getMessage());
            return "redirect:/solicitacao/painel";
        } catch (Exception e) {
            this.saveError(this.getText("error.solicitacao.salvar", e.getMessage()));
            return "redirect:/solicitacao/painel";
        }
    }

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

    @GetMapping("/painel")
    public String exibePainelSolicitacoes(Model model) {
        try {
            Estudante usuarioLogado = this.estudanteService.buscarPorId(2L);
            List<Solicitacao> solicitacoes = solicitacaoService.buscarPorEstudante(usuarioLogado.getCodEstudante());

            model.addAttribute("solicitacoes", solicitacoes);
            model.addAttribute("pendentes", solicitacaoService.getPendentes(solicitacoes));
            model.addAttribute("concluidas", solicitacaoService.getConcluidas(solicitacoes));
            model.addAttribute("usuarioLogado", usuarioLogado);

            return "painelSolicitacao/solicitacaoList";

        } catch (Exception e) {
            this.saveError(this.getText("error.solicitacao.processamento"));
            return "redirect:/";
        }
    }
}