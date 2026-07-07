package bancoDentes.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

/**
 * Controlador base que fornece métodos utilitários comuns para todos os controllers da aplicação.
 * Centraliza a resolução de mensagens internacionalizadas (i18n) e o gerenciamento
 * de mensagens de feedback (sucesso/erro) na sessão HTTP para cenários de redirecionamento.
 */
public class BaseController {

    @Autowired
    private MessageSource messageSource;

    /**
     * Busca uma mensagem no arquivo de properties com base na chave informada e no idioma atual da requisição.
     * @param key A chave da mensagem configurada no arquivo messages.properties (ex: "errors.objeto.existente").
     * @return A mensagem traduzida.
     */
    protected String getText(String key) {
        return messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
    }

    /**
     * Busca uma mensagem no arquivo de properties com suporte a inserção de parâmetros dinâmicos.
     * Útil para mensagens formatadas, como: "A solicitação {0} foi rejeitada por {1}".
     * @param key    A chave da mensagem configurada no arquivo messages.properties.
     * @param params Valores que substituirão os marcadores ({0}, {1}, etc.) na mensagem original.
     * @return A mensagem formatada e traduzida.
     */
    protected String getText(String key, Object... params) {
        return messageSource.getMessage(key, params, LocaleContextHolder.getLocale());
    }

    /**
     * Salva uma mensagem de erro na sessão HTTP.
     * A mensagem é armazenada na sessão para garantir que sobreviva a um redirecionamento (Redirect),
     * devendo ser consumida e limpa pela view (Frontend) logo em seguida.
     * @param request O objeto da requisição atual.
     * @param message A string contendo a mensagem de erro a ser exibida para o usuário.
     */
    protected void saveError(HttpServletRequest request, String message) {
        request.getSession().setAttribute("mensagemErro", message);
    }

    /**
     * Salva uma mensagem de sucesso na sessão HTTP.
     * A mensagem é armazenada na sessão para garantir que sobreviva a um redirecionamento (Redirect),
     * devendo ser consumida e limpa pela view (Frontend) logo em seguida.
     * @param request O objeto da requisição atual.
     * @param message A string contendo a mensagem de sucesso a ser exibida para o usuário.
     */
    protected void saveMessage(HttpServletRequest request, String message) {
        request.getSession().setAttribute("mensagemSucesso", message);
    }

}
