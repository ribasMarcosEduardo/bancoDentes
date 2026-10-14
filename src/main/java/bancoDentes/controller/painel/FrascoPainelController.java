package bancoDentes.controller.painel;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.dto.FrascoDTO;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.service.FrascoService;
import bancoDentes.service.ManutencaoService;
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
    private final ManutencaoService manutencaoService;

    /**
     * Exibe o painel principal com a listagem de todos os frascos cadastrados.
     *
     * @param model
     */
    @GetMapping("/painel")
    public String exibePainelFrascos(Model model) {
        model.addAttribute("frascos", frascoService.getFrascos());
        model.addAttribute("frascosComVinculo", frascoService.getCodigosComVinculo());
        model.addAttribute("historicoFrascos", frascoService.getHistoricoFrascos());
        model.addAttribute("manutencoesAbertas", manutencaoService.getManutencoesAbertasPorFrasco());
        return "painel/painelFrascos";
    }

    /**
     * Renderiza o formulário de cadastro de um novo frasco.
     *
     * @param model
     */
    @GetMapping("/cadastraFrasco")
    public String cadastraFrasco(Model model) {
        model.addAttribute("frascoDTO", FrascoDTO.novo());
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

        if (frasco.isInativo()) {
            this.saveError(this.getText("error.frasco.inativo.editar"));
            return "redirect:/frasco/painel";
        }

        FrascoDTO dto = FrascoDTO.recuperaFrasco(frasco);
        model.addAttribute("frascoDTO", dto);

        return "form/frascoForm";
    }

    /**
     * Coloca um frasco na fila de impressão de etiquetas.
     *
     * @param codigo
     */
    @PostMapping("/enviarImpressao/{codigo}")
    public String enviarParaImpressao(@PathVariable("codigo") Long codigo) {
        try {
            Frasco frasco = frascoService.enviarParaImpressao(codigo);
            this.saveMessage(this.getText("msg.sucesso.frasco.enviadoImpressao", frasco.getIdentificacao()));
        } catch (FrascoException e) {
            this.saveError(e.getMessage());
        } catch (Exception e) {
            this.saveError(this.getText("error.frasco.enviarImpressao"));
        }

        return "redirect:/frasco/painel";
    }

    /**
     * Processa exclusão de um frasco.
     *
     * @param codigo
     */
    @PostMapping("/excluirFrasco/{codigo}")
    public String excluirFrasco(@PathVariable("codigo") Long codigo) {
        try {
            Frasco frasco = frascoService.excluirFrasco(codigo);
            this.saveMessage(this.getText("msg.sucesso.frasco.excluido", frasco.getIdentificacao()));
        } catch (FrascoException e) {
            this.saveError(e.getMessage());
        } catch (Exception e) {
            this.saveError(this.getText("error.exclucao.frasco"));
        }

        return "redirect:/frasco/painel";
    }

    /**
     * Inativa um frasco que possui histórico e por isso não pode ser excluído.
     *
     * @param codigo
     */
    @PostMapping("/inativarFrasco/{codigo}")
    public String inativarFrasco(@PathVariable("codigo") Long codigo) {
        try {
            Frasco frasco = frascoService.inativarFrasco(codigo);
            this.saveMessage(this.getText("msg.sucesso.frasco.inativado", frasco.getIdentificacao()));
        } catch (FrascoException e) {
            this.saveError(e.getMessage());
        } catch (Exception e) {
            this.saveError(this.getText("error.frasco.inativar"));
        }

        return "redirect:/frasco/painel";
    }
}
