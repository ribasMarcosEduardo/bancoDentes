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
import java.util.Optional;

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
     * @param codFrasco identificador único do frasco
     * @param model objeto utilizado para envio de dados à view
     * @return nome do template Thymeleaf do formulário de frasco
     */
    @GetMapping("/editar/{codFrasco}")
    public String editar(@PathVariable("codFrasco") Long codFrasco, Model model) {
        Frasco frasco = frascoService.buscarPorId(codFrasco);

        FrascoDTO dto = FrascoDTO.recuperaFrasco(frasco);
        model.addAttribute("frascoDTO", dto);

        return "form/frascoForm";
    }

    /**
     * Processa o envio do formulário de cadastro ou edição de frasco.
     *
     * Realiza o binding dos dados do formulário para um {@link FrascoDTO},
     * converte para entidade {@link Frasco} e persiste os dados.
     *
     * Em caso de sucesso, redireciona para a tela inicial de cadastro
     * exibindo uma mensagem de confirmação.
     *
     * @param frascoDTO objeto contendo os dados do formulário
     * @param result resultado da validação dos campos
     * @param redirectAttributes atributos utilizados para mensagens pós-redirect
     * @return redirecionamento para a rota de cadastro de frasco
     */

    @PostMapping
    public String frasco(@Validated @ModelAttribute("frascoDTO") FrascoDTO frascoDTO,
                         BindingResult result,
                         RedirectAttributes redirectAttributes) {

        try {
                Frasco frasco = frascoDTO.mapearFrasco();
            if (frasco.getCodFrasco() != null) {
                frascoService.atualizarFrasco(frasco);
                redirectAttributes.addFlashAttribute("mensagemSucesso", "Frasco atualizado com sucesso!");
                return "redirect:/frasco/painel";
            } else {
                frascoService.save(frasco);
                redirectAttributes.addFlashAttribute("mensagemSucesso", "Frasco cadastrado com sucesso!");
            }

        } catch (Exception e) {
            System.err.println("Erro ao salvar o Frasco: " + e.getMessage());
            redirectAttributes.addFlashAttribute("mensagemErro", "Erro ao salvar: " + e.getMessage());
        }

        return "redirect:/frasco";
    }

    @PostMapping("/excluirFrasco/{codFrasco}") // Leia a observação abaixo sobre @DeleteMapping vs @PostMapping
    public String excluirFrasco(@PathVariable("codFrasco") Long codFrasco,
                                RedirectAttributes redirectAttributes) {

        try {
            frascoService.excluirFrasco(codFrasco);
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
     * @param nomeDente filtro opcional pelo tipo de dente
     * @param estadoDente filtro opcional pelo estado do dente
     * @param maxilar filtro opcional pelo maxilar
     * @param model objeto utilizado para envio de dados à view
     * @return nome do template Thymeleaf do painel de frascos
     */
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

    /**
     * Retorna dinamicamente o fragmento Thymeleaf correspondente
     * ao tipo de visualização selecionado (blocos ou lista).
     *
     * Utilizado para alternância de layout sem recarregar
     * a página inteira.
     *
     * @param view tipo de visualização desejada (blocos ou lista)
     * @param nomeDente filtro opcional pelo tipo de dente
     * @param estadoDente filtro opcional pelo estado do dente
     * @param maxilar filtro opcional pelo maxilar
     * @param model objeto utilizado para envio de dados à view
     * @return fragmento Thymeleaf correspondente à visualização
     */
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


    /**
     * Carrega a lista de frascos de acordo com os filtros informados.
     *
     * Caso ao menos um filtro esteja presente, realiza a busca filtrada;
     * caso contrário, retorna todos os frascos cadastrados.
     *
     * @param nomeDente filtro opcional pelo tipo de dente
     * @param estadoDente filtro opcional pelo estado do dente
     * @param maxilar filtro opcional pelo maxilar
     * @param model objeto utilizado para envio da lista de frascos à view
     */
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


