package bancoDentes.model.enumModels;

public enum Permissao {

    ESTUDANTE("Estudante"),
    ESTAGIARIO("Estagiário"),
    ADMIN("Admin"),
    PROFESSOR("Professor");

    private final String nome;

    Permissao(String nome){
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }
}
