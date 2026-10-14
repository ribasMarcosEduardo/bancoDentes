package bancoDentes.model.enumModels;

public enum StatusFrasco {
    DISPONIVEL("Disponível"),
    DIS_IMPRESSAO("Disponível para impressão"),
    EM_MANUTENCA("Em manutenção"),
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
