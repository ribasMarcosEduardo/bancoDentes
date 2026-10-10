package bancoDentes.controller.painel;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.dto.FrascoDTO;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.service.FrascoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller referente ao painel de frascos
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("frasco")
@RequiredArgsConstructor
public class FrascoPainelController extends BaseController {

    private final FrascoService frascoService;

    /**
     * Exibe o painel principal com a listagem de todos os frascos cadastrados.
     *
     * @param model
     */
    @GetMapping("/painel")
    public String exibePainelFrascos(Model model) {
        model.addAttribute("frascos", frascoService.getFrascos());
        return "painel/painelFrascos";
    }

    /**
     * Renderiza o formulário de cadastro de um novo frasco.
     *
     * @param model
     */
    @GetMapping("/cadastraFrasco")
    public String cadastraFrasco(Model model) {
        model.addAttribute("frascoDTO", FrascoDTO.empty());
        return "form/frascoForm";
    }

    /**
     * Recupera os dados de um frasco existente no banco de dados e renderiza
     * o formulário de cadastro já populado para edição.
     *
     * @param codigo
     * @param model
     */
    @GetMapping("/edit/{codigo}")
    public String editar(@PathVariable("codigo") Long codigo, Model model) {
        Frasco frasco = frascoService.buscarPorId(codigo);

        FrascoDTO dto = FrascoDTO.recuperaFrasco(frasco);
        model.addAttribute("frascoDTO", dto);

        return "form/frascoForm";
    }

    /**
     * Processa exclusão de um frasco.
     *
     * @param codigo
     */
    @PostMapping("/excluirFrasco/{codigo}")
    public String excluirFrasco(@PathVariable("codigo") Long codigo) {
        try {
            frascoService.excluirFrasco(codigo);
            this.saveMessage(this.getText("msg.sucesso.exclucao"));
        } catch (FrascoException e) {
            this.saveError(e.getMessage());
            return "redirect:/frasco/painel";
        } catch (Exception e) {
            this.saveError(this.getText("error.exclucao.frasco"));
        }

        return "redirect:/frasco/painel";
    }
}
