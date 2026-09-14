package bancoDentes.controller.auxiliares;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@ControllerAdvice
public class GlobalMessageAdvice {

    @ModelAttribute
    public void handleGlobalMessages(HttpSession session, Model model) {
        String sucesso = (String) session.getAttribute("mensagemSucesso");
        if (sucesso != null) {
            model.addAttribute("mensagemSucesso", sucesso);
            session.removeAttribute("mensagemSucesso");
        }

        String erro = (String) session.getAttribute("mensagemErro");
        if (erro != null) {
            model.addAttribute("mensagemErro", erro);
            session.removeAttribute("mensagemErro");
        }
    }

    @ExceptionHandler(Exception.class)
    public String handleGlobalException(Exception e, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        redirectAttributes.addFlashAttribute("mensagemErro", e.getMessage());
        String referer = request.getHeader("Referer");
        return "redirect:" + (referer != null && !referer.isEmpty() ? referer : "/solicitacao/painel");
    }
}