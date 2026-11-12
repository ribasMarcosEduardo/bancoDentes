package bancoDentes.controller.auth;

import bancoDentes.controller.auxiliares.BaseController;
import bancoDentes.service.OtpService;
import bancoDentes.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ConfirmacaoEmailController extends BaseController {

    private final UsuarioService usuarioService;
    private final OtpService otpService;

    /**
     * Interceta a rota principal de confirmação e devolve a página visual (HTML).
     */
    @GetMapping("/confirmacao-email")
    public String telaConfirmacao(Model model, Authentication authentication) {
        String codigoAd = authentication.getName();

        boolean temCodigo = otpService.temCodigoAtivo(codigoAd);
        model.addAttribute("temCodigoAtivo", temCodigo);

        if (temCodigo) {
            model.addAttribute("emailUsuario", usuarioService.buscarEmailPorCodigoAd(codigoAd));
        }

        return "auth/confirmacao_email";
    }

    /**
     * Recebe a requisição AJAX e aciona a geração do código e disparar o e-mail.
     *
     * @param payload
     * @param authentication
     */
    @PostMapping("/confirmacao/enviar")
    @ResponseBody
    public ResponseEntity<?> enviarCodigo(@RequestBody Map<String, String> payload, Authentication authentication) {
        String nome = payload.get("nome");
        String email = payload.get("email");
        String codigoAd = authentication.getName();

        try {
            usuarioService.processarEnvioCodigo(codigoAd, nome, email);
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(getText("error.email.envio") + ": " + e.getMessage());
        }
    }

    /**
     * Recebe a requisição AJAX para validar os dígitos inseridos pelo utilizador.
     *
     * @param payload
     * @param authentication
     */
    @PostMapping("/confirmacao/validar")
    @ResponseBody
    public ResponseEntity<?> validarCodigo(@RequestBody Map<String, String> payload, Authentication authentication) {
        String codigoDigitado = payload.get("codigo");
        String codigoAd = authentication.getName();

        try {
            boolean valido = usuarioService.confirmarEmail(codigoAd, codigoDigitado);

            if (valido) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().body(getText("error.codigo.invalido"));
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(getText("error.confirmacao.processamento") + ": " + e.getMessage());
        }
    }
}