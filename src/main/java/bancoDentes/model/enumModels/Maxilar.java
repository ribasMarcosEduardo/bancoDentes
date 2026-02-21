package bancoDentes.model.enumModels;

public enum Maxilar {
    INFERIOR("Inferior", "I"),
    SUPERIOR("Superior", "S");

    private final String nome;
    private final String sigla;

    Maxilar(String nome, String sigla) {
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

    public static String getSiglaMaxilar(Maxilar maxilar) {
        if (maxilar == null) return null;
        return maxilar.getSigla();
    }

}
