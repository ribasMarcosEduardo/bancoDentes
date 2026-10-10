package bancoDentes.model.enumModels;

public enum OrigemManutencao {
    MOVIMENTACAO("Movimentação"),
    MANUTENCAO("Direto pelo painel"),
    SOLICITACAO("Solicitação");

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

