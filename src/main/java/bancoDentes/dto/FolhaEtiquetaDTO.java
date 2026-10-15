package bancoDentes.dto;

import java.util.List;

/**
 * Uma folha física de etiquetas, com todas as células na ordem de leitura
 * (linha a linha, da esquerda para a direita).
 */
public record FolhaEtiquetaDTO(
        List<CelulaEtiquetaDTO> celulas
) {

    public long getQuantidadeEtiquetas() {
        return celulas.stream().filter(c -> !c.isVazia()).count();
    }
}
