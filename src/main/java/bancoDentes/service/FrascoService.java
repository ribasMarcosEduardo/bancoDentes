package bancoDentes.service;

import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Maxilar;
import bancoDentes.model.enumModels.NomeDente;
import bancoDentes.repository.FrascoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FrascoService {
    private final FrascoRepository frascoRepository;

    /**
     * Persiste um novo frasco e gera sua identificação.
     *
     * @param frasco entidade a ser salva
     * @return frasco persistido com identificação gerada
     */
    public Frasco save(Frasco frasco){
        frasco = frascoRepository.save(frasco);
        frasco.gerarIdentificacao();
        return frascoRepository.save(frasco);
    }

    /**
     * Atualiza os dados de um frasco já existente.
     *
     * @param frasco entidade contendo os novos dados
     * @return frasco atualizado
     * @throws FrascoException caso o frasco não exista
     */
    public Frasco atualizarFrasco(Frasco frasco) {
        Frasco frascoDoBanco = buscarPorId(frasco.getCodFrasco());

        frascoDoBanco.setNomDente(frasco.getNomDente());
        frascoDoBanco.setEstado(frasco.getEstado());
        frascoDoBanco.setQuantidade(frasco.getQuantidade());
        frascoDoBanco.setMaxilar(frasco.getMaxilar());
        frascoDoBanco.setPosicao(frasco.getPosicao());
        frascoDoBanco.setDatManutencao(frasco.getDatManutencao());
        frascoDoBanco.setDatCad(frasco.getDatCad());

        return frascoRepository.save(frascoDoBanco);
    }

    /**
     * Retorna todos os frascos cadastrados.
     *
     * @return lista de frascos
     */
    public List<Frasco> getPainelFrasco() {
        return frascoRepository.findAll();
    }

    /**
     * Retorna frascos de acordo com os filtros informados.
     *
     * @param nomeDente filtro opcional por tipo de dente
     * @param estadoDente filtro opcional por estado
     * @param maxilar filtro opcional por maxilar
     * @return lista de frascos filtrados
     */
    public List<Frasco> getFrascosFiltrados(NomeDente nomeDente, EstadoDente estadoDente, Maxilar maxilar) {
        if (nomeDente == null && estadoDente == null && maxilar == null) {
            return frascoRepository.findAll();
        }

        return frascoRepository.getFrascosFiltrados(nomeDente, estadoDente, maxilar);
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


}
