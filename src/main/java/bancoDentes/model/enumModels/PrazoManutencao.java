package bancoDentes.model.enumModels;

/**
 * Situação da data de manutenção de um frasco em relação a hoje.
 * O sufixo css casa com os modificadores .manutencao--vencida / --proxima / --em-dia.
 */
public enum PrazoManutencao {
    VENCIDA("vencida", "Vencida", "Manutenção vencida", "triangle-alert"),
    PROXIMA("proxima", "Próxima", "Manutenção nos próximos 30 dias", "clock"),
    EM_DIA("em-dia", "Em dia", "Manutenção em dia", "calendar-check");

    /** Quantos dias à frente a manutenção ainda conta como "próxima". */
    public static final long DIAS_PROXIMA = 30;

    private final String css;
    private final String rotulo;
    private final String descricao;
    private final String icone;

    PrazoManutencao(String css, String rotulo, String descricao, String icone) {
        this.css = css;
        this.rotulo = rotulo;
        this.descricao = descricao;
        this.icone = icone;
    }

    public String getCss() {
        return css;
    }

    public String getRotulo() {
        return rotulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getIcone() {
        return icone;
    }
}
