package bancoDentes.model.enumModels;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

/**
 * Catálogo de modelos de folha de etiqueta adesiva suportados na impressão.
 * Todas as medidas em mm, porque alimentam diretamente o CSS de impressão
 * (@page e posicionamento absoluto de cada etiqueta).
 */
public enum ModeloFolhaEtiqueta {

    FOLHA_A4_96("Folha A4 - 96 etiquetas de 31x17mm",
            210, 297, 12.5, 7, 2, 0, 6, 16, 31, 17);

    private static final DecimalFormat FORMATO_MM =
            new DecimalFormat("0.##", DecimalFormatSymbols.getInstance(new Locale("pt", "BR")));

    private final String nome;
    private final double folhaLarguraMm;
    private final double folhaAlturaMm;
    private final double margemTopoMm;
    private final double margemEsquerdaMm;
    private final double espacamentoHorizontalMm;
    private final double espacamentoVerticalMm;
    private final int numColunas;
    private final int numLinhas;
    private final double celulaLarguraMm;
    private final double celulaAlturaMm;

    ModeloFolhaEtiqueta(String nome,
                        double folhaLarguraMm, double folhaAlturaMm,
                        double margemTopoMm, double margemEsquerdaMm,
                        double espacamentoHorizontalMm, double espacamentoVerticalMm,
                        int numColunas, int numLinhas,
                        double celulaLarguraMm, double celulaAlturaMm) {
        this.nome = nome;
        this.folhaLarguraMm = folhaLarguraMm;
        this.folhaAlturaMm = folhaAlturaMm;
        this.margemTopoMm = margemTopoMm;
        this.margemEsquerdaMm = margemEsquerdaMm;
        this.espacamentoHorizontalMm = espacamentoHorizontalMm;
        this.espacamentoVerticalMm = espacamentoVerticalMm;
        this.numColunas = numColunas;
        this.numLinhas = numLinhas;
        this.celulaLarguraMm = celulaLarguraMm;
        this.celulaAlturaMm = celulaAlturaMm;
    }

    public int getCapacidade() {
        return numColunas * numLinhas;
    }

    public String getDescricao() {
        return String.format("Etiquetas de %sx%smm em %d colunas e %d linhas",
                FORMATO_MM.format(celulaLarguraMm), FORMATO_MM.format(celulaAlturaMm),
                numColunas, numLinhas);
    }

    public String getNome() {
        return nome;
    }

    public double getFolhaLarguraMm() {
        return folhaLarguraMm;
    }

    public double getFolhaAlturaMm() {
        return folhaAlturaMm;
    }

    public double getMargemTopoMm() {
        return margemTopoMm;
    }

    public double getMargemEsquerdaMm() {
        return margemEsquerdaMm;
    }

    public double getEspacamentoHorizontalMm() {
        return espacamentoHorizontalMm;
    }

    public double getEspacamentoVerticalMm() {
        return espacamentoVerticalMm;
    }

    public int getNumColunas() {
        return numColunas;
    }

    public int getNumLinhas() {
        return numLinhas;
    }

    public double getCelulaLarguraMm() {
        return celulaLarguraMm;
    }

    public double getCelulaAlturaMm() {
        return celulaAlturaMm;
    }
}
