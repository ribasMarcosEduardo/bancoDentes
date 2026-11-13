package bancoDentes.controller.form;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.dto.SolicitacaoDTO;
import bancoDentes.exception.SolicitacaoException;
import bancoDentes.service.UsuarioService;
import bancoDentes.service.SolicitacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador responsável pelo gerenciamento das requisições web
 * referentes às Solicitações de dentes feitas pelos estudantes.
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("solicitacao")
@RequiredArgsConstructor
public class SolicitacaoFormController extends BaseController {

    private final SolicitacaoService solicitacaoService;
    private final UsuarioService usuarioService;

    /**
     * Processa a submissão do formulário para salvar (criar ou atualizar) uma solicitação.
     *
     * @param dto
     */
    @PostMapping("/save")
    public String saveSolicitacao(@ModelAttribute("solicitacaoDTO") SolicitacaoDTO dto,
                                  @RequestParam(name = "cadastrarOutro", defaultValue = "false") boolean cadastrarOutro) {
        try {
            solicitacaoService.save(dto);
            this.saveMessage(this.getText("msg.sucesso.solicitacao.enviada"));

            // Sem saldo sobrando, "Salvar e Continuar" volta pro painel
            if (cadastrarOutro && this.usuarioService.getUsuarioLogado().getCredito() > 0) {
                return "redirect:/solicitacao/cadastrarSolicitacao";
            }

            return "redirect:/solicitacao/painel";

        } catch (SolicitacaoException e) {
            this.saveError(e.getMessage());
            return "redirect:/solicitacao/painel";
        } catch (Exception e) {
            this.saveError(this.getText("error.solicitacao.salvar"));
            return "redirect:/solicitacao/painel";
        }
    }

}