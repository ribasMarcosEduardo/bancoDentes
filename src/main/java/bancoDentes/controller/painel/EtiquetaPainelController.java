package bancoDentes.controller.painel;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.dto.FolhaEtiquetaDTO;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.ModeloFolhaEtiqueta;
import bancoDentes.model.enumModels.StatusFrasco;
import bancoDentes.service.FrascoService;
import bancoDentes.service.GeradorEtiquetasService;
import bancoDentes.service.ImpressaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * Controller referente ao fluxo de impressão de etiquetas dos frascos
 * (fila de impressão -> configuração da folha -> impressão).
 */
@Controller
@RequestMapping("etiqueta")
@RequiredArgsConstructor
public class EtiquetaPainelController extends BaseController {

    private final FrascoService frascoService;
    private final GeradorEtiquetasService geradorEtiquetasService;
    private final ImpressaoService impressaoService;

    /**
     * Exibe a fila de impressão: todos os frascos com status Disponível para impressão.
     *
     * @param model
     */
    @GetMapping("/fila")
    public String exibeFilaImpressao(Model model) {
        model.addAttribute("frascos", frascoService.getFrascosPorStatusFrasco(StatusFrasco.DIS_IMPRESSAO));
        return "painel/filaEtiquetas";
    }

    /**
     * Exibe a configuração da folha (modelo de papel e célula inicial) para os
     * frascos marcados na fila.
     *
     * @param codigos
     * @param model
     */
    @PostMapping("/configurar")
    public String exibeConfiguracao(@RequestParam(value = "frascos", required = false) List<Long> codigos,
                                    Model model) {
        List<Frasco> frascos = frascoService.getFrascosParaImpressao(codigos);

        if (frascos.isEmpty()) {
            this.saveError(this.getText("error.etiqueta.nenhumFrasco"));
            return "redirect:/etiqueta/fila";
        }

        model.addAttribute("frascos", frascos);
        model.addAttribute("modelos", ModeloFolhaEtiqueta.values());
        return "painel/configurarEtiquetas";
    }

    /**
     * Acesso direto pela URL (ou F5 depois do POST) não tem seleção nenhuma, então
     * volta para a fila.
     */
    @GetMapping("/configurar")
    public String configuracaoSemSelecao() {
        return "redirect:/etiqueta/fila";
    }

    /**
     * Gera a folha de impressão (documento à parte, sem navbar/footer) com os
     * frascos já distribuídos nas células. A impressão em si é pelo diálogo do
     * navegador (Ctrl+P); o status só muda quando o usuário confirmar.
     *
     * @param codigos
     * @param modelo
     * @param posicaoInicial
     * @param model
     */
    @PostMapping("/imprimir")
    public String exibeImpressao(@RequestParam(value = "frascos", required = false) List<Long> codigos,
                                 @RequestParam(value = "modelo", defaultValue = "FOLHA_A4_96") ModeloFolhaEtiqueta modelo,
                                 @RequestParam(value = "posicaoInicial", defaultValue = "0") int posicaoInicial,
                                 Model model) {
        List<Frasco> frascos = frascoService.getFrascosParaImpressao(codigos);

        if (frascos.isEmpty()) {
            this.saveError(this.getText("error.etiqueta.nenhumFrasco"));
            return "redirect:/etiqueta/fila";
        }

        List<FolhaEtiquetaDTO> folhas = geradorEtiquetasService.paginar(frascos, modelo, posicaoInicial);

        model.addAttribute("frascos", frascos);
        model.addAttribute("folhas", folhas);
        model.addAttribute("modelo", modelo);
        model.addAttribute("posicaoInicial", geradorEtiquetasService.normalizarPosicao(posicaoInicial, modelo));
        return "painel/imprimirEtiquetas";
    }

    /**
     * Acesso direto pela URL, sem configuração, volta para a fila.
     */
    @GetMapping("/imprimir")
    public String impressaoSemSelecao() {
        return "redirect:/etiqueta/fila";
    }

    /**
     * Confirma que as etiquetas saíram da impressora: os frascos voltam para
     * Disponível e saem da fila.
     *
     * @param codigos
     */
    @PostMapping("/confirmar")
    public String confirmarImpressao(@RequestParam(value = "frascos", required = false) List<Long> codigos) {
        try {
            Long quantidade = frascoService.confirmarImpressao(codigos);
            this.saveMessage(this.getText("msg.sucesso.etiqueta.impressa", quantidade));
        } catch (FrascoException e) {
            this.saveError(this.getText(e.getMessage()));
        } catch (Exception e) {
            this.saveError(this.getText("error.etiqueta.confirmar"));
        }
        return "redirect:/etiqueta/fila";
    }

    /**
     * Tira um frasco da fila de impressão sem imprimir a etiqueta.
     *
     * @param codigo
     */
    @PostMapping("/removerFila/{codigo}")
    public String removerDaFila(@PathVariable("codigo") Long codigo) {
        try {
            Frasco frasco = frascoService.removerDaFilaImpressao(codigo);
            this.saveMessage(this.getText("msg.sucesso.etiqueta.removidoFila", frasco.getIdentificacao()));
        } catch (FrascoException e) {
            this.saveError(e.getMessage());
        } catch (Exception e) {
            this.saveError(this.getText("error.etiqueta.removerFila"));
        }

        return "redirect:/etiqueta/fila";
    }
}
