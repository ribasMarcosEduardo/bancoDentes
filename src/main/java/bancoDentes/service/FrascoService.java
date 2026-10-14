package bancoDentes.service;

import bancoDentes.dto.FrascoDTO;
import bancoDentes.dto.HistoricoFrascoDTO;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.Movimentacao;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.StatusFrasco;
import bancoDentes.model.enumModels.TipoMovimentacao;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.MovimentacaoRepository;
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

    /**
     * Salva um novo frasco ou atualiza um frasco já existente no banco de dados.
     *
     * @param frascoDTO
     */
    @Transactional
    public Frasco save(FrascoDTO frascoDTO) {
        Frasco frasco = frascoDTO.mapearFrasco();
        boolean novo = frasco.getCodigo() == null;

        if (!novo) {
            Frasco frascoDoBanco = buscarPorId(frasco.getCodigo());
            if (frascoDoBanco.isInativo()) {
                throw new FrascoException(this.getText("error.frasco.inativo.editar"));
            }
            // Quantidade não muda pela edição: alterações passam por movimentação (histórico)
            BeanUtils.copyProperties(frasco, frascoDoBanco, "codigo", "identificacao", "statusFrasco", "quantidade");
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
        String identificacaoAnterior = frasco.getIdentificacao();
        frasco = frascoRepository.saveAndFlush(frasco);
        frasco.gerarIdentificacao();

        // Grupo/local alterados na edição mudam a identificação: a etiqueta colada no
        // frasco fica desatualizada, então ele volta pra fila de impressão. Em manutenção,
        // ele já entra na fila ao concluir; na fila, continua nela.
        boolean identificacaoMudou = !novo && !Objects.equals(identificacaoAnterior, frasco.getIdentificacao());
        if (identificacaoMudou && frasco.getStatusFrasco() == StatusFrasco.DISPONIVEL) {
            frasco.paraImpressao();
        }

        if (novo) {
            registrarEntradaCadastro(frasco);
        }
        return frasco;
    }

    /**
     * Registra a quantidade inicial do frasco como uma Entrada sem frascos de origem
     * (equivalente a "Doação/Outros"), pra que o histórico de movimentações cubra
     * todos os dentes que já passaram pelo frasco.
     *
     * @param frasco
     */
    private void registrarEntradaCadastro(Frasco frasco) {
        long quantidade = frasco.getQuantidade() != null ? frasco.getQuantidade() : 0L;
        if (quantidade <= 0L) {
            return;
        }

        movimentacaoRepository.save(new Movimentacao(
                TipoMovimentacao.ENTRADA,
                frasco.getDatCad(),
                frasco.getLocal(),
                this.getText("msg.movimentacao.cadastroFrasco", frasco.getIdentificacao()),
                frasco,
                quantidade,
                0L,
                null
        ));
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
     * Resumo das quantidades movimentadas por frasco (código do frasco -> histórico),
     * calculado numa única consulta agregada sobre as movimentações.
     */
    public Map<Long, HistoricoFrascoDTO> getHistoricoFrascos() {
        Map<Long, HistoricoFrascoDTO> historicos = new HashMap<>();

        for (Object[] linha : movimentacaoRepository.somarQuantidadesPorFrascoETipo()) {
            Long codFrasco = (Long) linha[0];
            TipoMovimentacao tipo = (TipoMovimentacao) linha[1];
            long soma = linha[2] != null ? ((Number) linha[2]).longValue() : 0L;

            historicos.merge(codFrasco, HistoricoFrascoDTO.vazio().somar(tipo, soma),
                    (atual, novo) -> atual.somar(tipo, soma));
        }
        return historicos;
    }

    /**
     * Recupera os códigos dos frascos que possuem histórico e por isso só podem ser inativados.
     */
    public Set<Long> getCodigosComVinculo() {
        return frascoRepository.findCodigosComVinculo();
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

        if (frascoRepository.possuiVinculo(codigoFrasco)) {
            throw new FrascoException(this.getText("error.frasco.excluir.possuiVinculo"));
        }

        // Sem vínculo, a única movimentação possível é a entrada do cadastro
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

        if (frasco.getStatusFrasco() == StatusFrasco.INATIVO) {
            throw new FrascoException(this.getText("error.frasco.inativar.jaInativo"));
        }
        if (frasco.isEmManutencao()) {
            throw new FrascoException(this.getText("error.frasco.inativar.emManutencao"));
        }

        frasco.inativo();
        return frascoRepository.save(frasco);
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
