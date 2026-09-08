package bancoDentes.model.enumModels;

public enum EstadoDente {
    NAO_INFORMADA("Não informada", "N"),
    CARIADO("Cariado", "C"),
    HIGIDO("Hígido", "H"),
    RESTAURADO("Restaurado", "R"),
    MISTO("Misto", "M"),;

    private final String nome;
    private final String sigla;

    EstadoDente(String nome, String sigla) {
        this.nome = nome;
        this.sigla = sigla;
    }

    @Override
    public String toString() {
        return this.nome;
    }

    public String getNome() {
        return nome;
    }

    public String getSigla() {
        return sigla;
    }
}