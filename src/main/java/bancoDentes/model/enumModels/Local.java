package bancoDentes.model.enumModels;

public enum Local {
    BDH("Banco de Dentes Humanos"),
    BIOBANCO("Biobanco");

    private final String nome;

    Local(String nome) {
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
