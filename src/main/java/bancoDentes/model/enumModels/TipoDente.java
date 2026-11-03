package bancoDentes.model.enumModels;

public enum TipoDente {

    MOLAR("Molar", "MO"),
    PRE_MOLAR("Pré-Molar", "PM"),
    CANINO("Canino", "CN"),
    INCISIVO("Incisivo", "IN"),
    ENDO("Endo", "EN"),
    SISO("Siso", "SI");

    private final String nome;
    private final String sigla;

    TipoDente(String nome, String sigla) {
        this.nome = nome;
        this.sigla = sigla;
    }

    @Override
    public String toString() {
        return this.nome;
    }

    public String getNome() {
        return nome;
    }

    public String getSigla() {
        return sigla;
    }

    /**
     * Molares e pré-molares são identificados pela numeração do dente.
     */
    public boolean isUsaNumeracao() {
        return this == MOLAR || this == PRE_MOLAR;
    }

    /**
     * Caninos e incisivos são identificados pela arcada. Endo e Siso entram junto só pra
     * manter o mesmo formato na visualização (a arcada deles é sempre vazia).
     */
    public boolean isUsaArcada() {
        return this == CANINO || this == INCISIVO || this == ENDO || this == SISO;
    }

    public static String getSiglaDente(TipoDente tipoDente) {
        if (tipoDente == null) return null;
        return tipoDente.getSigla();
    }

}
