package bancoDentes.model.enumModels;

public enum NomeDente {

    CANINO("Canino", "C"),
    ENDO("Endo", "E"),
    INCISIVO("Incisivo", "I"),
    MOLAR("Molar", "M"),
    PRE_MOLAR("Pré-Molar", "PM");

    private final String nome;
    private final String sigla;

    NomeDente(String nome, String sigla) {
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

    public static String getSiglaDente(NomeDente nomeDente) {
        if (nomeDente == null) return null;
        return nomeDente.getSigla();
    }



}
