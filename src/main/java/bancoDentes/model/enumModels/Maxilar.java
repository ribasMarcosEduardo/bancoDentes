package bancoDentes.model.enumModels;

public enum Maxilar {
    INFERIOR("Inferior"),
    SUPERIOR("Superior");

    private final String nome;

    Maxilar(String nome) {
        this.nome = nome;
    }

    @Override
    public String toString() {
        return this.nome;
    }

}
