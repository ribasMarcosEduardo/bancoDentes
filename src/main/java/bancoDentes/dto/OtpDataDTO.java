package bancoDentes.dto;

import java.time.LocalDateTime;

public record OtpDataDTO(String codigo, LocalDateTime expiracao) {
}