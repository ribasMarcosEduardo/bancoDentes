package bancoDentes.model.enumModels;

public enum Arcada {
    NAO_INFORMADA("Não informada"),
    INFERIOR("Inferior"),
    SUPERIOR("Superior");

    private final String nome;
    Arcada(String nome) {
        this.nome = nome;
    }

    @Override
    public String toString() {
        return this.nome;
    }

    public String getNome() {
        return nome;
    }

}
