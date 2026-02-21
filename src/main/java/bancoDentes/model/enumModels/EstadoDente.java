package bancoDentes.model.enumModels;

public enum EstadoDente {

    CARIADO("Cariado", "C"),
    HIGIDO("Hígido", "H"),
    MISTO("Misto", "M"),
    RESTAURADO("Restaurado", "R");

    private final String nome;
    private final String sigla;

    EstadoDente(String nome, String sigla) {
        this.sigla = sigla;
        this.nome = nome;
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