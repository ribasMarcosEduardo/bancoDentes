package bancoDentes.model.enumModels;

public enum TipoMovimentacao {

    ENTRADA("Entrada"),
    SAIDA("Saída"),
    TRANSFERENCIA("Transferência");

    private final String nome;

    TipoMovimentacao(String nome) {
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }

}
