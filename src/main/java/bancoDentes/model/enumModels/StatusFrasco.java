package bancoDentes.model.enumModels;

public enum StatusFrasco {
    DISPONIVEL("Disponível", "Disponível", "frasco-disponivel"),
    DIS_IMPRESSAO("Disponível para impressão", "Para impressão", "frasco-impressao"),
    EM_MANUTENCA("Em manutenção", "Em manutenção", "frasco-manutencao"),
    INATIVO("Inativo", "Inativo", "frasco-inativo");

    private final String nome;
    private final String rotulo;
    private final String css;

    StatusFrasco(String nome, String rotulo, String css) {
        this.nome = nome;
        this.rotulo = rotulo;
        this.css = css;
    }

    @Override
    public String toString() {
        return this.nome;
    }

    public String getNome() {
        return nome;
    }

    public String getRotulo() {
        return rotulo;
    }

    public String getCss() {
        return css;
    }
}
