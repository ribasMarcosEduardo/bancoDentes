package bancoDentes.service;

import bancoDentes.exception.UsuarioException;
import bancoDentes.model.Usuario;
import bancoDentes.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Serviço responsável por gerir as operações e regras de negócio relacionados ao usuário.
 * Integra a lógica de pesquisa de estudantes e o fluxo de segurança para verificação de e-mail utilizando códigos de uso único (OTP).
 *
 * @author Marcos Eduardo Ribas
 */
@Service
@RequiredArgsConstructor
public class UsuarioService extends BaseService {

    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;
    private final OtpService otpService;

    /**
     * Busca usuário por código
     *
     * @param codUsuario
     */
    public Usuario getUsuarioPorCodigo(Long codUsuario) throws UsuarioException {
        return usuarioRepository.findById(codUsuario)
                .orElseThrow(() -> new UsuarioException(getText("error.usuario.naoEncontrado")));
    }

    /**
     * Procura um usuário pelo seu código do Active Directory.
     * Caso seja o seu primeiro acesso ao sistema,
     * cria imediatamente um novo registo com os valores padrão.
     *
     * @param codigoAd
     */
    public Usuario obterOuCriarUsuario(String codigoAd) {
        return usuarioRepository.findByCodigoAd(codigoAd).orElseGet(() -> {
            Usuario novoUsuario = new Usuario();
            novoUsuario.setCodigoAd(codigoAd);
            novoUsuario.setVerificado(false);
            novoUsuario.setCredito(0L);
            return usuarioRepository.save(novoUsuario);
        });
    }

    /**
     * Inicia o processo de verificação de e-mail de um usuário.
     * Atualiza o registo do usuário com o novo e-mail fornecido, solicita a geração de um código
     * temporário (OTP) e aciona o envio de e-mail.
     *
     * @param codigoAd
     * @param email
     */
    public void processarEnvioCodigo(String codigoAd, String email) throws UsuarioException{
        Usuario usuario = usuarioRepository.findByCodigoAd(codigoAd)
                .orElseThrow(() -> new UsuarioException(getText("error.usuario.naoEncontrado")));

        usuario.setEmail(email);
        usuarioRepository.save(usuario);

        String codigoGerado = otpService.gerarEArmazenarCodigo(codigoAd);

        emailService.enviarCodigoVerificacao(email, codigoGerado);
    }

    /**
     * confirmarEmail o código de verificação introduzido pelo usuário.
     * Se o código corresponder ao gerado e não tiver expirado, o estado do utilizador
     * é atualizado para "verificado".
     *
     * @param codigoAd
     * @param codigoRecebido
     */
    public boolean confirmarEmail(String codigoAd, String codigoRecebido) throws UsuarioException {
        if (otpService.isCodigoValido(codigoAd, codigoRecebido)) {
            Usuario usuario = usuarioRepository.findByCodigoAd(codigoAd)
                    .orElseThrow(() -> new UsuarioException(getText("error.usuario.naoEncontrado")));

            usuario.setVerificado(true);
            usuarioRepository.save(usuario);
            return true;
        }
        return false;
    }

    /**
     * Busca o endereço de e-mail associado a um usuário através do seu código do Active Directory.
     *
     * @param codigoAd
     */
    public String buscarEmailPorCodigoAd(String codigoAd) {
        return usuarioRepository.findByCodigoAd(codigoAd)
                .map(Usuario::getEmail)
                .orElse("");
    }

    /**
     * Recupera o usuário que está atualmente logado na sessão da aplicação.
     *
     * @return A entidade {@link Usuario} do utilizador ativo.
     */
    public Usuario getUsuarioLogado() throws UsuarioException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new UsuarioException(getText("error.usuario.naoAutenticado"));
        }

        String codigoAd = auth.getName();

        return usuarioRepository.findByCodigoAd(codigoAd)
                .orElseThrow(() -> new UsuarioException(getText("error.usuario.naoEncontrado")));
    }

}