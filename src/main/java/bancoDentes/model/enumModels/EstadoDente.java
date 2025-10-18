package bancoDentes.model.enumModels;

public enum EstadoDente {

    CARIADO("Cariado"),
    HIGIDO("Hígido"),
    MISTO("Misto"),
    RESTAURADO("Restaurado");

    private final String nome;

    EstadoDente(String nome) {
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }

    @Override
    public String toString() {
        return this.nome;
    }
}