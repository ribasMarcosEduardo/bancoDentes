package bancoDentes.model.enumModels;

public enum EstadoDente {
    NAO_INFORMADA("Não informada"),
    CARIADO("Cariado"),
    HIGIDO("Hígido"),
    RESTAURADO("Restaurado"),
    MISTO("Misto"),;

    private final String nome;

    EstadoDente(String nome) {
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