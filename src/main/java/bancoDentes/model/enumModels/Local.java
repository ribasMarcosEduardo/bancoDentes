package bancoDentes.model.enumModels;

public enum Local {
    BDH("Banco de Dentes Humanos", "bd"),
    BIOBANCO("Biobanco", "bb");

    private final String nome;
    private final String sigla;

    Local(String nome,String sigla){
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

