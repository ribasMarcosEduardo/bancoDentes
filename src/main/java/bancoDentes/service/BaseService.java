package bancoDentes.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

/**
 * Classe base para a camada de Serviço.
 * Centraliza utilitários comuns a todas as regras de negócio do sistema,
 * como a extração de mensagens internacionalizadas (i18n) para lançamento de exceções.
 */
public class BaseService {

    @Autowired
    private MessageSource messageSource;

    /**
     * Busca uma mensagem no arquivo de properties com base na chave informada e no idioma atual.
     * @param key A chave da mensagem configurada no messages.properties.
     * @return A mensagem traduzida.
     */
    protected String getText(String key) {
        return messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
    }

    /**
     * Busca uma mensagem no arquivo de properties com suporte a inserção de parâmetros dinâmicos.
     * @param key    A chave da mensagem configurada no messages.properties.
     * @param params Valores que substituirão os marcadores ({0}, {1}, etc.) na mensagem original.
     * @return A mensagem formatada e traduzida.
     */
    protected String getText(String key, Object... params) {
        return messageSource.getMessage(key, params, LocaleContextHolder.getLocale());
    }

}
