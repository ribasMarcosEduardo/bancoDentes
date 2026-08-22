package bancoDentes.model.enumModels;

public enum StatusSolicitacao {
    PENDENTE("Pendente"),
    EM_ANALISE("Em análise"),
    CONCLUIDO("Concluído"),
    NEGADO("Negado"),
    EM_SEPARACAO("Em separação"),
    AGUARDANDO_RETIRADA("Aguardando retirada");

    private final String nome;

    StatusSolicitacao(String nome) {
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