package bancoDentes.dto;

public record ItemMovimentacaoDTO(
        Long codigo,
        Long version,
        Long codFrasco,
        Long quantidade
) {

    public static ItemMovimentacaoDTO empty() {
        return new ItemMovimentacaoDTO(null, null, null, null);
    }
}