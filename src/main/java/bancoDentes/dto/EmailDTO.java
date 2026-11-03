package bancoDentes.dto;

import java.io.Serializable;

public record EmailDTO(
        String de,
        String[] para,
        String assunto,
        String mensagem,
        String classeLog
) implements Serializable {}
