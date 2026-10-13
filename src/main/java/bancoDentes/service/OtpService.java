package bancoDentes.service;

import bancoDentes.dto.OtpDataDTO;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service responsável por gerara e gerenciar a OTP (One-Time Password)
 *
 * @author Marcos Eduardo Ribas
 */
@Service
public class OtpService {

    private final ConcurrentHashMap<String, OtpDataDTO> otpCache = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Gera um código numérico seguro de 6 dígitos e armazena-o temporariamente na memória.
     * O código gerado possui uma validade predefinida de 15 minutos a partir do momento da criação.
     * Se o utilizador já possuir um código ativo, este será sobrescrito.
     *
     * @param codigoAd
     */
    public String gerarEArmazenarCodigo(String codigoAd) {
        String codigo = String.format("%06d", secureRandom.nextInt(1000000));
        otpCache.put(codigoAd, new OtpDataDTO(codigo, LocalDateTime.now().plusMinutes(15)));

        return codigo;
    }

    /**
     * Valida um código OTP introduzido pelo USUÁRIO.
     * Para que a validação seja bem-sucedida, o código deve existir no cache,
     * corresponder exatamente ao valor recebido e não ter ultrapassado o seu limite de validade.
     *
     * @param codigoAd
     * @param codigoRecebido
     */
    public boolean isCodigoValido(String codigoAd, String codigoRecebido) {
        OtpDataDTO dadosTemporarios = otpCache.get(codigoAd);

        if (dadosTemporarios != null
                && dadosTemporarios.codigo().equals(codigoRecebido)
                && dadosTemporarios.expiracao().isAfter(LocalDateTime.now())) {

            otpCache.remove(codigoAd);
            return true;
        }

        return false;
    }

    /**
     * Verifica se existe um código de verificação (OTP) ativo e não expirado na memória para o utilizador.
     *
     * @param codigoAd
     */
    public boolean temCodigoAtivo(String codigoAd) {
        OtpDataDTO dadosTemporarios = otpCache.get(codigoAd);

        if (dadosTemporarios != null && dadosTemporarios.expiracao().isAfter(LocalDateTime.now())) {
            return true;
        }
        // Limpa a memória caso o código exista mas já tenha passado da validade
        if (dadosTemporarios != null) {
            otpCache.remove(codigoAd);
        }

        return false;
    }
}