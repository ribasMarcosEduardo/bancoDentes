package bancoDentes.service;

import bancoDentes.dto.FrascoDTO;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.TipoDente;
import bancoDentes.repository.FrascoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FrascoService {

    private final FrascoRepository frascoRepository;

    @Transactional
    public Frasco save(FrascoDTO frascoDTO) {
        Frasco frasco = frascoDTO.mapearFrasco();

        if (frasco.getCodigo() != null) {
            Frasco frascoDoBanco = buscarPorId(frasco.getCodigo());
            BeanUtils.copyProperties(frasco, frascoDoBanco, "codigo", "identificacao");
            frasco = frascoDoBanco;
        }

        frasco = frascoRepository.save(frasco);
        frasco.gerarIdentificacao();
        return frascoRepository.save(frasco);
    }

    /**
     * Retorna todos os frascos cadastrados.
     *
     * @return lista de frascos
     */
    public List<Frasco> getPainelFrasco() {
        return frascoRepository.findAllDisponiveis();
    }

    /**
     * Retorna frascos de acordo com os filtros informados.
     *
     * @param tipoDente   filtro opcional por tipo de dente
     * @param estadoDente filtro opcional por estado
     * @param maxilar     filtro opcional por maxilar
     * @return lista de frascos filtrados
     */
    public List<Frasco> getFrascosFiltrados(TipoDente tipoDente, EstadoDente estadoDente, Maxilar maxilar) {
        if (tipoDente == null && estadoDente == null && maxilar == null) {
            return frascoRepository.findAllDisponiveis();
        }

        return frascoRepository.getFrascosFiltrados(tipoDente, estadoDente, maxilar);
    }


    /**
     * Busca um frasco pelo seu identificador.
     *
     * @param codFrasco identificador do frasco
     * @return frasco encontrado
     * @throws FrascoException caso não seja encontrado
     */
    public Frasco buscarPorId(Long codFrasco) {
        return frascoRepository.findById(codFrasco)
                .orElseThrow(() -> new FrascoException("Frasco não encontrado com o ID: " + codFrasco));
    }

    public void excluirFrasco(Long codigoFrasco) {
        frascoRepository.deleteById(codigoFrasco);
    }

    public List<Map<String, Object>> buscarDadosGrafico() {
        return frascoRepository.contarPorTipoDente();
    }


    public List<Frasco> getFrascosFiltrados(Solicitacao solicitacao) {
        return frascoRepository.getFrascosFiltrados(
                solicitacao.getTipoDente(),
                solicitacao.getDenticao(),
                solicitacao.getMaxilar(),
                solicitacao.getEstado()
        );
    }

}
