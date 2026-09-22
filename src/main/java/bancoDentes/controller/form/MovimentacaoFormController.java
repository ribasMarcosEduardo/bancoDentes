package bancoDentes.controller.form;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.dto.ItemAnaliseDTO;
import bancoDentes.dto.ItemMovimentacaoDTO;
import bancoDentes.dto.MovimentacaoDTO;
import bancoDentes.exception.AnaliseException;
import bancoDentes.model.Frasco;
import bancoDentes.model.ItemAnalise;
import bancoDentes.model.ItemMovimentacao;
import bancoDentes.model.Movimentacao;
import bancoDentes.service.FrascoService;
import bancoDentes.service.ItemMovimentacaoService;
import bancoDentes.service.MovimentacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

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
public class MovimentacaoFormController extends BaseController{

    final private FrascoService frascoService;
    final private ItemMovimentacaoService itemMovimentacaoService;
    final private MovimentacaoService movimentacaoService;

    /**
     * Renderiza o formulário em branco para a criação de uma nova solicitação de dentes.
     *
     * @param model
     */
    @GetMapping("/cadastrarMovimentacao")
    public String cadastrarMovimentacao(Model model) {
        try {
            model.addAttribute("movimentacaoDTO", MovimentacaoDTO.empty());
            return "form/movimentacaoForm";

        } catch (Exception e) {
            this.saveError(this.getText("error.carregamento"));
            return "redirect:/movimentacao/painel";
        }
    }

    @GetMapping("/frascosMovimentacao")
    @ResponseBody
    public List<Frasco> getFrascosCatalogo() {
        return frascoService.getFrascos();
    }

    /**
     * Aloca um frasco selecionado ao processo de análise.
     *
     * @param dto
     */
    @PostMapping("/selecionaFrasco")
    public ResponseEntity<Void> selecionaFrasco(@ModelAttribute ItemMovimentacaoDTO dto, @RequestParam("codMovimentacao") Long codMovimentacao, RedirectAttributes redirectAttributes) {
        try {
            ItemMovimentacao itemSalvo = itemMovimentacaoService.save(dto);
            this.saveMessage(this.getText("msg.sucesso.frasco.alocado"));

            HttpHeaders headers = new HttpHeaders();
            if (itemSalvo != null && itemSalvo.getCodigo() != null) {
                headers.add("Codigo_Item_Movimentacao", itemSalvo.getCodigo().toString());
            }

            return ResponseEntity.ok().headers(headers).build();
        } catch (AnaliseException e) {
            this.saveError(e.getMessage());
        } catch (Exception e) {
            this.saveError(this.getText("error.frasco.alocado", e.getMessage()));
        }
        return ResponseEntity.badRequest().build();
    }

    /**
     * Salva uma edição ou adição de uma movimentação
     *
     * @param movimentacaoDTO
     * @param cadastrarOutro
     */
    @PostMapping("/save")
    public String save(@ModelAttribute("movimentacaoDTO") MovimentacaoDTO movimentacaoDTO,
                       @RequestParam(name = "cadastrarOutro", defaultValue = "false") boolean cadastrarOutro) {
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
