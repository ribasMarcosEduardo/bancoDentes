package bancoDentes.model.enumModels;

public enum Arcada {
    INFERIOR("Inferior", "I"),
    SUPERIOR("Superior", "S"),
    NAO_INFORMADA("Não informada", "N");

    private final String nome;
    private final String sigla;

    Arcada(String nome, String sigla) {
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

    public static String getSiglaArcada(Arcada arcada) {
        if (arcada == null) return null;
        return arcada.getSigla();
    }

}
