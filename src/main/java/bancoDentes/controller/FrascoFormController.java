package bancoDentes.controller;

import bancoDentes.dto.FrascoDTO;
import bancoDentes.model.Frasco;
import bancoDentes.service.FrascoService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * Controller para requisições de frascos
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("frasco")
@RequiredArgsConstructor
public class FrascoFormController extends BaseController {

    private final FrascoService frascoService;

    /**
     * Exibe o painel principal com a listagem de todos os frascos cadastrados.
     *
     * @param model
     */
    @GetMapping("/painel")
    public String exibePainelFrascos(Model model) {
        model.addAttribute("frascos", frascoService.getFrascos());
        return "painelFrascos/frascosList";
    }

    /**
     * Renderiza o formulário de cadastro em branco para um novo frasco.
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
     * Salva um uma edição ou adição de um frasco
     *
     * @param frascoDTO
     * @param redirectAttributes
     */
    @PostMapping("/save")
    public String saveFrasco(@Validated @ModelAttribute("frascoDTO") FrascoDTO frascoDTO,
                             @RequestParam(name = "cadastrarOutro", defaultValue = "false") boolean cadastrarOutro,
                             HttpSession session,
                             RedirectAttributes redirectAttributes) {
        try {
            Frasco frasco = frascoService.save(frascoDTO);
            this.saveMessage(this.getText("msg.sucesso.frasco.cadastrado", frasco.getIdentificacao()));

            if (cadastrarOutro) {
                return "redirect:/frasco/cadastraFrasco";
            }

            return "redirect:/frasco/painel";

        } catch (Exception e) {
            this.saveError("Erro ao processar: " + e.getMessage());
            return "redirect:/frasco";
        }
    }

    /**
     * Processa exclusão de um frasco.
     *
     * @param codigo
     * @param redirectAttributes
     */
    @PostMapping("/excluirFrasco/{codigo}")
    public String excluirFrasco(@PathVariable("codigo") Long codigo, RedirectAttributes redirectAttributes) {
        try {
            frascoService.excluirFrasco(codigo);
            redirectAttributes.addFlashAttribute("mensagemSucesso", "Frasco excluído com sucesso!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("mensagemErro", "Erro ao excluir: " + e.getMessage());
        }

        return "redirect:/frasco/painel";
    }

}