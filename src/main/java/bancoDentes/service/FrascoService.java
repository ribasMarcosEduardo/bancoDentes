package bancoDentes.service;

import bancoDentes.dto.FrascoDTO;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.StatusFrasco;
import bancoDentes.repository.FrascoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service responsável por centralizar as regras de negócio e operações
 * relacionadas à entidade Frasco
 *
 * @author Marcos Eduardo Ribas
 */
@Service
@RequiredArgsConstructor
public class FrascoService extends BaseService{

    private final FrascoRepository frascoRepository;

    /**
     * Salva um novo frasco ou atualiza um frasco já existente no banco de dados.
     *
     * @param frascoDTO
     */
    @Transactional
    public Frasco save(FrascoDTO frascoDTO) {
        Frasco frasco = frascoDTO.mapearFrasco();

        if (frasco.getCodigo() != null) {
            Frasco frascoDoBanco = buscarPorId(frasco.getCodigo());
            BeanUtils.copyProperties(frasco, frascoDoBanco, "codigo", "identificacao", "statusFrasco");
            frasco = frascoDoBanco;
        } else {
            frasco.setStatusFrasco(StatusFrasco.DIS_IMPRESSAO);
        }
        if (frasco.getDatCad() == null) {
            frasco.setDatCad(LocalDate.now().atStartOfDay());
        }
        if (frasco.getDatManutencao() == null) {
            frasco.setDatManutencao(frasco.getDatCad().plusYears(1));
        }
        frasco = frascoRepository.saveAndFlush(frasco);
        frasco.gerarIdentificacao();
        return frasco;
    }

    /**
     * Recupera todos os frascos cadastrados no sistema.
     */
    public List<Frasco> getFrascos() {
        return frascoRepository.findAll();
    }

    /**
     * Recupera todos os frascos com base no status do frasco.
     */
    public List<Frasco> getFrascosPorStatusFrasco(StatusFrasco statusFrasco) {
        return frascoRepository.findByStatusFrasco(statusFrasco);
    }
    /**
     * Recupera todos os frascos disponíveis no sistema.
     */
    public List<Frasco> getFrascosDisponiveis() {
        return frascoRepository.findFrascosDisponiveis();
    }

    /**
     * Busca um frasco específico no banco de dados a partir do seu código
     *
     * @param codFrasco
     */
    public Frasco buscarPorId(Long codFrasco) {
        return frascoRepository.findById(codFrasco)
                .orElseThrow(() -> new FrascoException(this.getText("error.frasco.naoEncontrado")));
    }

    /**
     * Coloca o frasco na fila de impressão de etiquetas (status Disponível para impressão).
     *
     * @param codFrasco
     */
    @Transactional
    public Frasco enviarParaImpressao(Long codFrasco) {
        Frasco frasco = buscarPorId(codFrasco);

        if (!frasco.isPodeEnviarParaImpressao()) {
            throw new FrascoException(this.getText("error.frasco.enviarImpressao.status"));
        }

        frasco.paraImpressao();
        return frascoRepository.save(frasco);
    }

    /**
     * Recupera os frascos escolhidos na fila de impressão, na ordem em que foram
     * enviados. Descarta códigos inexistentes ou de frascos que já saíram da fila
     * pra nunca imprimir etiqueta fora do fluxo.
     *
     * @param codigos
     */
    public List<Frasco> getFrascosParaImpressao(List<Long> codigos) {
        if (codigos == null || codigos.isEmpty()) {
            return List.of();
        }

        Map<Long, Frasco> porCodigo = frascoRepository.findAllById(codigos).stream()
                .filter(Frasco::isNaFilaImpressao)
                .collect(Collectors.toMap(Frasco::getCodigo, Function.identity()));

        return codigos.stream()
                .distinct()
                .map(porCodigo::get)
                .filter(Objects::nonNull)
                .toList();
    }

    /**
     * Tira da fila de impressão os frascos cuja etiqueta já foi impressa,
     * voltando o status para Disponível. Frascos que já saíram da fila são ignorados.
     *
     * @param codigos
     * @return quantidade de frascos atualizados
     */
    @Transactional
    public int confirmarImpressao(List<Long> codigos) {
        List<Frasco> frascos = getFrascosParaImpressao(codigos);
        frascos.forEach(Frasco::disponivel);
        frascoRepository.saveAll(frascos);
        return frascos.size();
    }

    /**
     * Tira um frasco da fila de impressão sem imprimir, voltando o status para Disponível.
     *
     * @param codFrasco
     */
    @Transactional
    public Frasco removerDaFilaImpressao(Long codFrasco) {
        Frasco frasco = buscarPorId(codFrasco);

        if (!frasco.isNaFilaImpressao()) {
            throw new FrascoException(this.getText("error.etiqueta.foraDaFila"));
        }

        frasco.disponivel();
        return frascoRepository.save(frasco);
    }

    /**
     * Exclui frasco com base no código.
     *
     * @param codigoFrasco
     */
    public void excluirFrasco(Long codigoFrasco) {
        frascoRepository.deleteById(codigoFrasco);
    }

    public List<Frasco> getFrascosFiltrados(Solicitacao solicitacao) {
        return frascoRepository.getFrascosFiltrados(
                solicitacao.getTipoDente(),
                solicitacao.getDenticao(),
                solicitacao.getArcada(),
                solicitacao.getEstado()
        );
    }

}
