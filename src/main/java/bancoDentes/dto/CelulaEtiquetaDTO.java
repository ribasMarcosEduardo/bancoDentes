package bancoDentes.dto;

import bancoDentes.model.Frasco;

/**
 * Uma célula da folha de etiquetas, já com a posição física calculada em mm.
 * Frasco null = célula sem etiqueta (pulada no início da 1ª folha ou sobra no fim
 * da última).
 */
public record CelulaEtiquetaDTO(
        double topMm,
        double leftMm,
        Frasco frasco
) {

    public boolean isVazia() {
        return frasco == null;
    }
}
