package bancoDentes.service;

import bancoDentes.dto.OtpDataDTO;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service responsável por gerar e gerenciar a OTP (One-Time Password)
 *
 * @author Marcos Eduardo Ribas
 */
@Service
public class OtpService {

    private final ConcurrentHashMap<String, OtpDataDTO> otpCache = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();
    private static final String ALPHA_NUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    /**
     * Gera um código alfanumérico seguro baseado no timestamp da data atual e em caracteres aleatórios.
     * O código gerado possui uma validade predefinida de 15 minutos a partir do momento da criação.
     * Se o utilizador já possuir um código ativo, este será sobrescrito.
     *
     * @param codigoAd
     */
    public String gerarEArmazenarCodigo(String codigoAd) {
        String timeBase36 = Long.toString(System.currentTimeMillis(), 36).toUpperCase();
        String timePart = timeBase36.substring(Math.max(0, timeBase36.length() - 3));

        StringBuilder randomPart = new StringBuilder(3);
        for (int i = 0; i < 3; i++) {
            randomPart.append(ALPHA_NUMERIC.charAt(secureRandom.nextInt(ALPHA_NUMERIC.length())));
        }

        String codigo = timePart + randomPart.toString();

        otpCache.put(codigoAd, new OtpDataDTO(codigo, LocalDateTime.now().plusMinutes(15)));

        return codigo;
    }

    /**
     * Valida um código OTP introduzido pelo USUÁRIO (insensível a maiúsculas/minúsculas).
     * Para que a validação seja bem-sucedida, o código deve existir no cache,
     * corresponder ao valor recebido e não ter ultrapassado o seu limite de validade.
     *
     * @param codigoAd
     * @param codigoRecebido
     */
    public boolean isCodigoValido(String codigoAd, String codigoRecebido) {
        OtpDataDTO dadosTemporarios = otpCache.get(codigoAd);

        if (dadosTemporarios != null
                && dadosTemporarios.codigo().equalsIgnoreCase(codigoRecebido != null ? codigoRecebido.trim() : "")
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