package bancoDentes.controller.form;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.dto.MovimentacaoDTO;
import bancoDentes.model.Frasco;
import bancoDentes.service.FrascoService;
import bancoDentes.service.MovimentacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller responsável pelo gerenciamento das requisições web
 * referentes às movimentações de dentes.
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("movimentacao")
@RequiredArgsConstructor
public class MovimentacaoFormController extends BaseController {

    final private FrascoService frascoService;
    final private MovimentacaoService movimentacaoService;

    /**
     * Captura os frascos para o carregamento do modal
     */
    @GetMapping("/frascosMovimentacao")
    @ResponseBody
    public List<Frasco> getFrascosCatalogo() {
        return frascoService.getFrascosDisponiveis();
    }

    /**
     * Salva uma edição ou adição de uma movimentação
     *
     * @param movimentacaoDTO
     * @param cadastrarOutro
     */
    @PostMapping("/save")
    public String save(@ModelAttribute("movimentacaoDTO") MovimentacaoDTO movimentacaoDTO, @RequestParam(name = "cadastrarOutro", defaultValue = "false") boolean cadastrarOutro) {
        try {
            movimentacaoService.save(movimentacaoDTO);
            this.saveMessage("Movimentação cadastrada com sucesso!");

            if (cadastrarOutro) {
                return "redirect:/movimentacao/movimentacaoForm";
            }

            return "redirect:/movimentacao/painel";

        } catch (Exception e) {
            this.saveError("Erro ao processar: " + e.getMessage());
            return "redirect:/movimentacao/painel";
        }
    }

}
