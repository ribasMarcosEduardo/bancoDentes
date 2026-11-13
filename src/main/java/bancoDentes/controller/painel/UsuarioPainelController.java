package bancoDentes.controller.painel;

import bancoDentes.service.FrascoService;
import bancoDentes.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller referente ao painel de frascos
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("usuario")
@RequiredArgsConstructor
public class UsuarioPainelController {

    private final UsuarioService usuarioService;

    /**
     * Exibe o painel principal com a listagem de todos os usuários cadastrados.
     *
     * @param model
     */
    @GetMapping("/painel")
    public String exibePainelFrascos(Model model) {
       model.addAttribute("usuarios", usuarioService.getListUsuarios());
        return "painel/painelUsuarios";
    }

}
