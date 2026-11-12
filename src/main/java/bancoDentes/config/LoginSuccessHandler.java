package bancoDentes.config;

import bancoDentes.model.Usuario;
import bancoDentes.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UsuarioService usuarioService;

    public LoginSuccessHandler(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * Método acionado automaticamente pelo Spring Security quando as credenciais do AD são validadas.
     *
     * @param request
     * @param response
     * @param authentication
     * @throws IOException
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        String codigoAd = authentication.getName();

        Usuario usuario = usuarioService.obterOuCriarUsuario(codigoAd);

        if (!usuario.isVerificado()) {
            response.sendRedirect("/confirmacao-email");
        } else {
            response.sendRedirect("/frasco/painel");
        }
    }
}