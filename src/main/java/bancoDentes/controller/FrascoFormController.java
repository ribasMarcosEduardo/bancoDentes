package bancoDentes.controller;

import bancoDentes.dto.FrascoDTO;
import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.NomeDente;
import bancoDentes.service.FrascoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping("frasco")
@RequiredArgsConstructor
public class FrascoFormController {

    private final FrascoService frascoService;

    // View do cadastro de frascos
    @GetMapping
    public String cadastrarFrasco(Model model) {
        model.addAttribute("frascoDTO", FrascoDTO.empty());
        return "form/frascoForm";
    }

    // Criar Exception para o projeto
    @PostMapping
    public String frasco(@Validated @ModelAttribute("frascoDTO") FrascoDTO frascoDTO,
                         BindingResult result,
                         RedirectAttributes redirectAttributes) {

        try {
            Frasco frasco = frascoDTO.mapearFrasco();
            frascoService.save(frasco);
            redirectAttributes.addFlashAttribute("mensagemSucesso", "Frasco cadastrado com sucesso!");
        } catch (Exception e) {
            System.err.println("Erro ao salvar o Frasco: " + e.getMessage());
        }

        return "redirect:/frasco";

    }

    // Painel de dentes cadastrados
    @GetMapping("/painel")
    public String exibePainelFrascos(
            @RequestParam(required = false) NomeDente nomeDente,
            @RequestParam(required = false) EstadoDente estadoDente,
            @RequestParam(required = false) Maxilar maxilar,
            Model model) {

        carregarDadosFiltrados(nomeDente, estadoDente, maxilar, model);

        model.addAttribute("filtroNomeDente", nomeDente);
        model.addAttribute("filtroEstadoDente", estadoDente);
        model.addAttribute("filtroMaxilar", maxilar);

        return "painelFrascos/frascos";
    }

    @GetMapping("/visualizacao")
    public String getVisualizacao(@RequestParam(defaultValue = "blocos") String view,
                                  @RequestParam(required = false) NomeDente nomeDente,
                                  @RequestParam(required = false) EstadoDente estadoDente,
                                  @RequestParam(required = false) Maxilar maxilar,
                                  Model model) {


        carregarDadosFiltrados(nomeDente, estadoDente, maxilar, model);

        if ("lista".equals(view)) {
            return "painelFrascos/lista-frascos :: lista";
        }
        return "painelFrascos/blocos-frascos :: blocos";
    }


    // Carrega os dados informados nos filtros
    private void carregarDadosFiltrados(NomeDente nomeDente, EstadoDente estadoDente, Maxilar maxilar, Model model) {
        List<Frasco> frascos;
        boolean possuiFiltros = nomeDente != null || estadoDente != null || maxilar != null;

        if (possuiFiltros) {
            Maxilar maxilarFiltro = (nomeDente == NomeDente.ENDO) ? null : maxilar;
            frascos = frascoService.getFrascosFiltrados(nomeDente, estadoDente, maxilarFiltro);
        } else {
            frascos = frascoService.getPainelFrasco();
        }
        model.addAttribute("frascos", frascos);
    }
}


