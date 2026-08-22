package bancoDentes.controller;

import bancoDentes.dto.SolicitacaoDTO;
import bancoDentes.exception.EstudanteException;
import bancoDentes.exception.SolicitacaoException;
import bancoDentes.model.Estudante;
import bancoDentes.model.Solicitacao;
import bancoDentes.service.EstudanteService;
import bancoDentes.service.SolicitacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador responsável pelo gerenciamento das requisições web
 * referentes às Solicitações de dentes feitas pelos estudantes.
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("solicitacao")
@RequiredArgsConstructor
public class SolicitacaoFormController extends BaseController{

    private final SolicitacaoService solicitacaoService;
    private final EstudanteService estudanteService;

    /**
     * Renderiza o formulário em branco para a criação de uma nova solicitação de dentes.
     *
     * @param model
     */
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

    /**
     * Processa a submissão do formulário para salvar (criar ou atualizar) uma solicitação.
     *
     * @param dto
     */
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

    /**
     * Processa a requisição para excluir logicamente ou fisicamente uma solicitação existente.
     *
     * @param codigo
     */
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

    /**
     * Exibe o painel do estudante listando todas as suas solicitações.
     *
     * @param model
     */
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