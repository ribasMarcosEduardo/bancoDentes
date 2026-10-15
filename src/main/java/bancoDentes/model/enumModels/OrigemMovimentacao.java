package bancoDentes.model.enumModels;

/**
 * O que gerou a movimentação (o tipo diz o que aconteceu com os dentes; a origem,
 * qual fluxo do sistema registrou). Usada nas regras (ex.: a entrada do cadastro
 * não impede excluir o frasco) e no histórico do frasco, sem depender do texto
 * da observação.
 */
public enum OrigemMovimentacao {

    CADASTRO("Cadastro do frasco"),
    REGISTRO_MANUAL("Registro manual"),
    MANUTENCAO("Conclusão de manutenção"),
    SOLICITACAO("Solicitação");

    private final String nome;

    OrigemMovimentacao(String nome) {
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
