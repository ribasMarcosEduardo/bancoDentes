package bancoDentes.controller.painel;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.service.ManutencaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


/**
 * Controller referente ao painel de manutenções.
 *
 * @author Marcos Eduardo Ribas
 */
@Controller
@RequestMapping("manutencao")
@RequiredArgsConstructor
public class ManutencaoPainelController extends BaseController {

    final private ManutencaoService manutencaoService;

    /**
     * Exibe o painel principal com a listagem de todas as manuteções cadastrados.
     *
     * @param model
     */
    @GetMapping("/painel")
    public String exibePainelManutencoes(Model model) {
       model.addAttribute("manutencoes", manutencaoService.getManutencao());
        return "painel/painelManutencoes";
    }

    @PostMapping("/concluir/{id}")
    @ResponseBody
    public ResponseEntity<Void> concluirManutencao(@PathVariable Long codManutancao, @RequestBody Map<String, Long> payload) {
        Long novaQuantidade = payload.get("novaQuantidade");
        //manutencaoService.concluirManutencao(codManutancao, novaQuantidade);
        return ResponseEntity.ok().build();
    }
}
