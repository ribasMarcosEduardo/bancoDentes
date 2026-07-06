package bancoDentes.model.enumModels;

public enum StatusSolicitacao {
    PENDENTE("Pendente"),
    EM_ANALISE("Em analise"),
    FINALIZADO("Finalizado"),
    RECUSADO("Recusado"),
    CANCELADO("Cancelado");

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