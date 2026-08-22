package bancoDentes.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Controlador base que fornece métodos utilitários comuns para todos os controllers da aplicação.
 * Centraliza a resolução de mensagens internacionalizadas (i18n) e o gerenciamento
 * de mensagens de feedback (sucesso/erro) na sessão HTTP para cenários de redirecionamento.
 */
public class BaseController {

    @Autowired
    private MessageSource messageSource;

    protected String getText(String key) {
        return messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
    }

    protected String getText(String key, Object... params) {
        return messageSource.getMessage(key, params, LocaleContextHolder.getLocale());
    }

    /**
     * Extrai a sessão atual usando o contexto do Spring.
     */
    private HttpSession getCurrentSession() {
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        return attr.getRequest().getSession(true);
    }

    /**
     * Salva uma mensagem de erro na sessão HTTP.
     * @param message A string contendo a mensagem de erro a ser exibida.
     */
    protected void saveError(String message) {
        getCurrentSession().setAttribute("mensagemErro", message);
    }

    /**
     * Salva uma mensagem de sucesso na sessão HTTP.
     * @param message A string contendo a mensagem de sucesso a ser exibida.
     */
    protected void saveMessage(String message) {
        getCurrentSession().setAttribute("mensagemSucesso", message);
    }

}
