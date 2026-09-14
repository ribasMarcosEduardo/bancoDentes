package bancoDentes.controller.form;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.dto.MovimentacaoDTO;
import bancoDentes.service.FrascoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller responsável pelo gerenciamento das requisições web
 * referentes às movimentações de dentes.
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("movimentacao")
@RequiredArgsConstructor
public class MovimentacaoFormController extends BaseController{

    final private FrascoService frascoService;

    /**
     * Renderiza o formulário em branco para a criação de uma nova solicitação de dentes.
     *
     * @param model
     */
    @GetMapping("/cadastrarMovimentacao")
    public String cadastrarMovimentacao(Model model) {
        try {
            model.addAttribute("movimentacaoDTO", MovimentacaoDTO.empty());
            model.addAttribute("catalogoFrascos", frascoService.getFrascos());

            return "form/movimentacaoForm";

        } catch (Exception e) {
            this.saveError(this.getText("error.carregamento"));
            return "redirect:/movimentacao/painel";
        }
    }

}
