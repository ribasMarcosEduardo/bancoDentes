package bancoDentes.service;

import bancoDentes.dto.FrascoDTO;
import bancoDentes.dto.HistoricoFrascoDTO;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.Movimentacao;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.StatusFrasco;
import bancoDentes.model.enumModels.OrigemMovimentacao;
import bancoDentes.model.enumModels.TipoMovimentacao;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.MovimentacaoRepository;
import bancoDentes.service.validator.FrascoImpressaoValidator;
import bancoDentes.service.validator.FrascoValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
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
    private final MovimentacaoRepository movimentacaoRepository;
    private final MovimentacaoService movimentacaoService;
    private final FrascoValidator frascoValidator;
    private final FrascoImpressaoValidator frascoImpressaoValidator;

    /**
     * Salva um novo frasco ou atualiza um frasco já existente no banco de dados.
     *
     * @param frascoDTO
     */
    @Transactional
    public Frasco save(FrascoDTO frascoDTO) {
        Frasco frasco = frascoDTO.mapearFrasco();

        if (frasco.isNew()) {
            return cadastrar(frasco);
        }

        return atualizar(frasco);
    }

    /**
     * Lógica interna e exclusiva para a criação de um NOVO frasco.
     */
    private Frasco cadastrar(Frasco frasco) {
        frasco = frascoRepository.saveAndFlush(frasco);
        frasco.gerarIdentificacao();

        movimentacaoService.registrarEntradaCadastro(frasco);

        return frasco;
    }

    /**
     * Método responsável por orquestrar o processo de atualização
     *
     * @param frasco
     */
    private Frasco atualizar(Frasco frasco) {
        Frasco frascoDoBanco = buscarPorId(frasco.getCodigo());

        frascoValidator.validaFrasco(frascoDoBanco);
        String identificacaoAnterior = frascoDoBanco.getIdentificacao();

        BeanUtils.copyProperties(frasco, frascoDoBanco, "codigo", "identificacao", "statusFrasco", "quantidade");

        Frasco frascoAtualizado = frascoRepository.saveAndFlush(frascoDoBanco);
        frascoAtualizado.gerarIdentificacao();

        frascoAtualizado.reavaliarEtiqueta(identificacaoAnterior);

        return frascoAtualizado;
    }

    /**
     * Exclui frasco com base no código. Só é permitido para frascos sem histórico
     * (movimentação, manutenção ou item de análise); os demais devem ser inativados.
     *
     * @param codigoFrasco
     */
    @Transactional
    public Frasco excluirFrasco(Long codigoFrasco) {
        Frasco frasco = buscarPorId(codigoFrasco);
        frascoValidator.validaFrascoExclusao(frasco);

        movimentacaoRepository.deleteByFrasco(frasco);
        frascoRepository.delete(frasco);
        return frasco;
    }

    /**
     * Inativa um frasco que possui histórico, preservando seus vínculos.
     * Frascos em manutenção não podem ser inativados por aqui: o descarte deve ser
     * feito concluindo a manutenção com quantidade 0, que já inativa o frasco.
     *
     * @param codigoFrasco
     */
    @Transactional
    public Frasco inativarFrasco(Long codigoFrasco) {
        Frasco frasco = buscarPorId(codigoFrasco);
        frascoValidator.validaFrascoInativacao(frasco);

        frasco.inativo();
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
     * Recupera os frascos que podem ser escolhidos numa movimentação (todos menos inativos).
     */
    public List<Frasco> getFrascosMovimentaveis() {
        return frascoRepository.findFrascosMovimentaveis();
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
    public Frasco disponibilizarParaImpressao(Long codFrasco) {
        Frasco frasco = buscarPorId(codFrasco);
        frascoImpressaoValidator.validaImpressaoEtiqueta(frasco);
        frasco.disImpressao();
        return frasco;
    }

    /**
     * Recupera os frascos escolhidos na fila de impressão, na ordem em que foram
     * enviados. Descarta códigos inexistentes ou de frascos que já saíram da fila
     * pra nunca imprimir etiqueta fora do fluxo.
     *
     * @param codigos
     */
    public List<Frasco> getFrascosParaImpressao(List<Long> codigos) {
        if (codigos.isEmpty()) {
            return List.of();
        }

        List<Frasco> frascosValidos = frascoRepository.buscarDisponiveisParaImpressao(codigos);

        Map<Long, Frasco> porCodigo = frascosValidos.stream()
                .collect(Collectors.toMap(Frasco::getCodigo, Function.identity()));

        return codigos.stream()
                .map(porCodigo::get)
                .filter(Objects::nonNull)
                .toList();
    }

    @Transactional
    public Long confirmarImpressao(List<Long> codigos) {
        List<Frasco> frascoList = getFrascosParaImpressao(codigos);
        frascoImpressaoValidator.validaListaFrascosImpressao(frascoList);
        frascoList.forEach(Frasco::disponivel);
        return (long) frascoList.size();
    }

    /**
     * Tira um frasco da fila de impressão sem imprimir, voltando o status para Disponível.
     *
     * @param codFrasco
     */
    @Transactional
    public Frasco removerDaFilaImpressao(Long codFrasco) {
        Frasco frasco = buscarPorId(codFrasco);
        frascoValidator.validaFrasco(frasco);
        frasco.disponivel();
        return frasco;
    }

    /**
     * Resumo das quantidades movimentadas por frasco (código do frasco -> histórico),
     * calculado numa única consulta agregada sobre as movimentações.
     */
    public Map<Long, HistoricoFrascoDTO> getHistoricoFrascos() {
        Map<Long, HistoricoFrascoDTO> historicos = new HashMap<>();

        for (Object[] linha : movimentacaoRepository.somarQuantidadesPorFrascoTipoEOrigem()) {
            Long codFrasco = (Long) linha[0];
            TipoMovimentacao tipo = (TipoMovimentacao) linha[1];
            OrigemMovimentacao origem = (OrigemMovimentacao) linha[2];
            long soma = linha[3] != null ? ((Number) linha[3]).longValue() : 0L;

            historicos.merge(codFrasco, HistoricoFrascoDTO.vazio().somar(tipo, origem, soma),
                    (atual, novo) -> atual.somar(tipo, origem, soma));
        }
        return historicos;
    }

    /**
     * Recupera os códigos dos frascos que possuem histórico e por isso só podem ser inativados.
     */
    public Set<Long> getFrascosComVinculo() {
        return frascoRepository.findCodigosComVinculo();
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
