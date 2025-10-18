package bancoDentes.model.enumModels;

public enum NomeDente {

    CANINO("Canino"),
    ENDO("Endo"),
    INCISIVO("Incisivo"),
    MOLAR("Molar"),
    PRE_MOLAR("Pré-Molar");

    private final String nome;

    NomeDente(String nome) {
        this.nome = nome;
    }

    @Override
    public String toString() {
        return this.nome;
    }
}
