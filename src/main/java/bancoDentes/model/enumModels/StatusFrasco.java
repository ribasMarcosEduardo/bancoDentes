package bancoDentes.model.enumModels;

public enum StatusFrasco {
    EM_MANUTENCA("Em manutenção"),
    DISPONIVEL("Disponível"),
    INATIVO("Inativo");

    private final String nome;

    StatusFrasco(String nome) {
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
