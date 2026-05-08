package bancoDentes.controller;

import bancoDentes.dto.FrascoDTO;
import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.TipoDente;
import bancoDentes.service.FrascoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("frasco")
@RequiredArgsConstructor
public class FrascoFormController {

    private final FrascoService frascoService;

    /**
     * Exibe a tela de cadastro de um novo frasco.
     *
     * Inicializa o formulário com um {@link FrascoDTO} vazio,
     * utilizado para o binding dos campos no Thymeleaf.
     *
     * @param model objeto utilizado para envio de dados à view
     * @return nome do template Thymeleaf do formulário de frasco
     */
    @GetMapping
    public String cadastrarFrasco(Model model) {

        model.addAttribute("frascoDTO", FrascoDTO.empty());
        return "form/frascoForm";
    }

    /**
     * Exibe a tela de edição de um frasco já cadastrado.
     *
     * Recupera o frasco pelo seu código identificador,
     * converte a entidade para {@link FrascoDTO} e envia
     * os dados para preenchimento do formulário.
     *
     * @param codigo identificador único do frasco
     * @param model objeto utilizado para envio de dados à view
     * @return nome do template Thymeleaf do formulário de frasco
     */
    @GetMapping("/edit/{codigo}")
    public String editar(@PathVariable("codigo") Long codigo, Model model) {
        Frasco frasco = frascoService.buscarPorId(codigo);

        FrascoDTO dto = FrascoDTO.recuperaFrasco(frasco);
        model.addAttribute("frascoDTO", dto);

        return "form/frascoForm";
    }

    @PostMapping("/save")
    public String saveFrasco(@Validated @ModelAttribute("frascoDTO") FrascoDTO frascoDTO,
                         BindingResult result,
                         RedirectAttributes redirectAttributes) {

        try {
            frascoService.save(frascoDTO);
            redirectAttributes.addFlashAttribute("mensagemSucesso", "Frasco salvo com sucesso!");
            return "redirect:/frasco/painel";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("mensagemErro", "Erro ao processar: " + e.getMessage());
            return "redirect:/frasco";
        }
    }

    @PostMapping("/excluirFrasco/{codigo}")
    public String excluirFrasco(@PathVariable("codigo") Long codigo,
                                RedirectAttributes redirectAttributes) {
        try {
            frascoService.excluirFrasco(codigo);
            redirectAttributes.addFlashAttribute("mensagemSucesso", "Frasco excluído com sucesso!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("mensagemErro", "Erro ao excluir: " + e.getMessage());
        }

        return "redirect:/frasco/painel";
    }


    /**
     * Exibe o painel de frascos cadastrados, com possibilidade
     * de aplicação de filtros por nome do dente, estado e maxilar.
     *
     * Caso nenhum filtro seja informado, todos os frascos
     * disponíveis são carregados.
     *
     * @param tipoDente filtro opcional pelo tipo de dente
     * @param estadoDente filtro opcional pelo estado do dente
     * @param maxilar filtro opcional pelo maxilar
     * @param model objeto utilizado para envio de dados à view
     * @return nome do template Thymeleaf do painel de frascos
     */
    @GetMapping("/painel")
    public String exibePainelFrascos(
            @RequestParam(required = false) TipoDente tipoDente,
            @RequestParam(required = false) EstadoDente estadoDente,
            @RequestParam(required = false) Maxilar maxilar,
            Model model) {

        carregarDadosFiltrados(tipoDente, estadoDente, maxilar, model);

        model.addAttribute("filtroNomeDente", tipoDente);
        model.addAttribute("filtroEstadoDente", estadoDente);
        model.addAttribute("filtroMaxilar", maxilar);

        return "painelFrascos/frascos";
    }

    /**
     * Retorna dinamicamente o fragmento Thymeleaf correspondente
     * ao tipo de visualização selecionado (blocos ou lista).
     *
     * Utilizado para alternância de layout sem recarregar
     * a página inteira.
     *
     * @param view tipo de visualização desejada (blocos ou lista)
     * @param tipoDente filtro opcional pelo tipo de dente
     * @param estadoDente filtro opcional pelo estado do dente
     * @param maxilar filtro opcional pelo maxilar
     * @param model objeto utilizado para envio de dados à view
     * @return fragmento Thymeleaf correspondente à visualização
     */
    @GetMapping("/visualizacao")
    public String getVisualizacao(@RequestParam(defaultValue = "blocos") String view,
                                  @RequestParam(required = false) TipoDente tipoDente,
                                  @RequestParam(required = false) EstadoDente estadoDente,
                                  @RequestParam(required = false) Maxilar maxilar,
                                  Model model) {

        carregarDadosFiltrados(tipoDente, estadoDente, maxilar, model);

        if ("lista".equals(view)) {
            return "painelFrascos/lista-frascos :: lista";
        }
        return "painelFrascos/blocos-frascos :: blocos";
    }


    /**
     * Carrega a lista de frascos de acordo com os filtros informados.
     *
     * Caso ao menos um filtro esteja presente, realiza a busca filtrada;
     * caso contrário, retorna todos os frascos cadastrados.
     *
     * @param tipoDente filtro opcional pelo tipo de dente
     * @param estadoDente filtro opcional pelo estado do dente
     * @param maxilar filtro opcional pelo maxilar
     * @param model objeto utilizado para envio da lista de frascos à view
     */
    private void carregarDadosFiltrados(TipoDente tipoDente, EstadoDente estadoDente, Maxilar maxilar, Model model) {

        List<Frasco> frascos;
        boolean possuiFiltros = tipoDente != null || estadoDente != null || maxilar != null;

        if (possuiFiltros) {
            Maxilar maxilarFiltro = (tipoDente == TipoDente.MISTO) ? null : maxilar;
            frascos = frascoService.getFrascosFiltrados(tipoDente, estadoDente, maxilarFiltro);
        } else {
            frascos = frascoService.getPainelFrasco();
        }
        model.addAttribute("frascos", frascos);
    }

    @GetMapping("/graficos")
    public String exibirGraficos(Model model) {

        List<Map<String, Object>> dados = frascoService.buscarDadosGrafico();
        List<Frasco> frascos = frascoService.getPainelFrasco();

        try {
            String json = new ObjectMapper().writeValueAsString(dados);
            model.addAttribute("jsonGrafico", json);
        } catch (Exception e) {
            model.addAttribute("jsonGrafico", "[]");
        }

        model.addAttribute("frascos", frascos);

        return "painelFrascos/graficos";
    }
}


