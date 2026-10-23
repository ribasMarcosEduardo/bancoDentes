package bancoDentes.model.enumModels;

public enum TipoDente {

    MOLAR("Molar", "MO"),
    PRE_MOLAR("Pré-Molar", "PM"),
    CANINO("Canino", "CN"),
    INCISIVO("Incisivo", "IN"),
    ENDO("Endo", "EN"),
    SISO("Siso", "Si");

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

}
