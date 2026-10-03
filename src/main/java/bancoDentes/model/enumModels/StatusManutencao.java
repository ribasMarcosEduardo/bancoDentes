package bancoDentes.model.enumModels;

public enum StatusManutencao {
    EM_ABERTO("Em aberta"),
    FINALIZADA("Finalizada");

    private final String nome;

    StatusManutencao(String nome) {
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
