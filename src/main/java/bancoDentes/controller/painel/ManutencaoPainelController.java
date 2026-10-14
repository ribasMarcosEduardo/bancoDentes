package bancoDentes.controller.painel;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.dto.ManutencaoDTO;
import bancoDentes.exception.ManutencaoException;
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

    @PostMapping("/concluir/{codManutencao}")
    @ResponseBody
    public ResponseEntity<String> concluirManutencao(
            @PathVariable("codManutencao") Long codManutencao,
            @RequestBody ManutencaoDTO dto) {

        try {
            manutencaoService.concluirManutencao(codManutencao, dto.quantidadeCalculada());
        } catch (ManutencaoException e) {
            // Regra de negócio (já finalizada, quantidade inválida): o modal mostra a mensagem
            return ResponseEntity.badRequest().body(e.getMessage());
        }

        return ResponseEntity.ok().build();
    }

    @PostMapping("/criar/{codFrasco}")
    @ResponseBody
    public void criarManutencaoDireta(
            @PathVariable("codFrasco") Long codFrasco) throws Exception {

        manutencaoService.registrarManutencaoDireta(codFrasco);
    }
}
