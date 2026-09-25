package bancoDentes.model.enumModels;

public enum TipoDente {

    CANINO("Canino", "CN"),
    ENDO("Endo", "EN"),
    INCISIVO("Incisivo", "IN"),
    MOLAR("Molar", "MP"),
    PRE_MOLAR("Pré-Molar", "PM");

    private final String nome;
    private final String sigla;

    TipoDente(String nome, String sigla) {
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

    public static String getSiglaDente(TipoDente tipoDente) {
        if (tipoDente == null) return null;
        return tipoDente.getSigla();
    }

}
