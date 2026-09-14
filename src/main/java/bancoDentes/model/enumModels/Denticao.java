package bancoDentes.model.enumModels;

public enum Denticao {
    NAO_INFORMADA("Não informada"),
    DECIDUA("Decídua"),
    PERMANENTE("Permanente");

    private final String nome;

    Denticao(String nome){
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }
}
