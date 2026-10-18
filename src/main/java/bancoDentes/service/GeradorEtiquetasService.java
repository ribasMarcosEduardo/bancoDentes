package bancoDentes.service;

import bancoDentes.dto.CelulaEtiquetaDTO;
import bancoDentes.dto.FolhaEtiquetaDTO;
import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.ModeloFolhaEtiqueta;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Distribui os frascos nas células das folhas de etiqueta.
 */
@Service
public class GeradorEtiquetasService {

    /**
     * A 1ª folha começa em posicaoInicial (as células anteriores já foram usadas
     * na folha física); as demais sempre a partir da célula 0.
     *
     * @param frascos        na ordem em que devem ser impressos
     * @param modelo
     * @param posicaoInicial índice (base 0) da primeira célula livre da 1ª folha
     */
    public List<FolhaEtiquetaDTO> paginar(List<Frasco> frascos, ModeloFolhaEtiqueta modelo, int posicaoInicial) {
        int capacidade = modelo.getCapacidade();
        int offset = normalizarPosicao(posicaoInicial, modelo);

        List<FolhaEtiquetaDTO> folhas = new ArrayList<>();
        int proximo = 0;

        do {
            List<CelulaEtiquetaDTO> celulas = new ArrayList<>(capacidade);

            for (int indice = 0; indice < capacidade; indice++) {
                Frasco frasco = null;
                if (indice >= offset && proximo < frascos.size()) {
                    frasco = frascos.get(proximo++);
                }
                celulas.add(criarCelula(modelo, indice, frasco));
            }

            folhas.add(new FolhaEtiquetaDTO(celulas));
            offset = 0;
        } while (proximo < frascos.size());

        return folhas;
    }

    /**
     * Posição fora da folha volta para a
     * célula 0 em vez de gerar uma 1ª folha sem nenhuma etiqueta.
     */
    public int normalizarPosicao(int posicaoInicial, ModeloFolhaEtiqueta modelo) {
        return (posicaoInicial < 0 || posicaoInicial >= modelo.getCapacidade()) ? 0 : posicaoInicial;
    }

    private CelulaEtiquetaDTO criarCelula(ModeloFolhaEtiqueta modelo, int indice, Frasco frasco) {
        int coluna = indice % modelo.getNumColunas();
        int linha = indice / modelo.getNumColunas();

        double top = modelo.getMargemTopoMm()
                + linha * (modelo.getCelulaAlturaMm() + modelo.getEspacamentoVerticalMm());
        double left = modelo.getMargemEsquerdaMm()
                + coluna * (modelo.getCelulaLarguraMm() + modelo.getEspacamentoHorizontalMm());

        return new CelulaEtiquetaDTO(top, left, frasco);
    }
}
