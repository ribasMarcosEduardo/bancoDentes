package bancoDentes.model.enumModels;

public enum Denticao {
    DECIDUA("Decídua", "D"),
    PERMANENTE("Permanente", "P"),
    NAO_INFORMADA("Não informada", "N");

    private final String nome;
    private final String sigla;

    Denticao(String nome,String sigla){
        this.nome = nome;
        this.sigla = sigla;
    }

    public String getNome() {
        return nome;
    }

    public String getSigla() {
        return sigla;
    }
}
