package bancoDentes.model.enumModels;

public enum OrigemManutencao {
    MOVIMENTACAO("Movimentação"),
    MANUTENCAO("Manutencao"),
    SOLICITACAO("Solicitacao");

    private final String nome;

    OrigemManutencao(String nome) {
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

