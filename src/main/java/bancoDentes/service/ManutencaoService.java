package bancoDentes.service;

import bancoDentes.dto.ManutencaoDTO;
import bancoDentes.exception.ManutencaoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.Manutencao;
import bancoDentes.model.Movimentacao;
import bancoDentes.model.enumModels.OrigemManutencao;
import bancoDentes.model.enumModels.StatusFrasco;
import bancoDentes.model.enumModels.StatusManutencao;
import bancoDentes.model.enumModels.TipoMovimentacao;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.ManutencaoRepository;
import bancoDentes.repository.MovimentacaoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service responsável por gerenciar as regras de negócio referente
 * as manutenções.
 *
 * @author Marcos Eduardo Ribas
 */
@Service
@RequiredArgsConstructor
public class ManutencaoService extends BaseService{

    private final ManutencaoRepository manutencaoRepository;
    private final FrascoRepository frascoRepository;
    private final MovimentacaoRepository movimentacaoRepository;

    /**
     * Recupera todas as manutenções cadastrados no sistema.
     */
    public List<Manutencao> getManutencao() {
        return manutencaoRepository.findAll();
    }

    /**
     * Método centralizado para registrar uma Manutenção no sistema.
     * Pode ser chamado por qualquer outro Service (Movimentacao, Solicitacao, etc).
     */
    @Transactional(rollbackOn = Exception.class)
    public Manutencao registrarManutencao(ManutencaoDTO dto) throws ManutencaoException {

        Frasco frasco = frascoRepository.findById(dto.codFrasco())
                .orElseThrow(() -> new ManutencaoException(getText("error.frasco.naoEncontrado")));

        Manutencao manutencao = dto.mapearManutencao(frasco);

        return manutencaoRepository.save(manutencao);
    }

    /**
     * Manutenções em aberto indexadas pelo código do frasco — usado pelo painel de
     * frascos pra concluir a manutenção ali mesmo, sem trocar de tela.
     */
    public Map<Long, Manutencao> getManutencoesAbertasPorFrasco() {
        return manutencaoRepository.findByStatusManutencao(StatusManutencao.EM_ABERTO).stream()
                .filter(m -> m.getFrasco() != null)
                .collect(Collectors.toMap(m -> m.getFrasco().getCodigo(), Function.identity(),
                        (primeira, outra) -> primeira));
    }

    /**
     * Mantém a manutenção do frasco alinhada à quantidade após uma movimentação.
     * Se o frasco já tem manutenção em aberto, só atualiza a quantidade dela (a
     * conclusão usa essa quantidade como base); senão, abre uma nova. Evita duas
     * manutenções abertas pro mesmo frasco e dentes "voltando" na conclusão.
     *
     * @param frasco
     * @param novaQuantidade
     */
    @Transactional(rollbackOn = Exception.class)
    public void registrarOuAtualizarManutencao(Frasco frasco, Long novaQuantidade) throws ManutencaoException {
        List<Manutencao> abertas = manutencaoRepository.findByFrascoAndStatusManutencao(frasco, StatusManutencao.EM_ABERTO);

        if (abertas.isEmpty()) {
            registrarManutencao(new ManutencaoDTO(frasco.getCodigo(), novaQuantidade, OrigemManutencao.MANUTENCAO));
            return;
        }

        abertas.forEach(m -> m.setQuantidade(novaQuantidade));
        manutencaoRepository.saveAll(abertas);
    }

    /**
     * Finaliza as manutenções em aberto do frasco -> usado quando uma movimentação
     * zera o frasco (ele é inativado), pra que a conclusão posterior não o reative.
     *
     * @param frasco
     */
    @Transactional(rollbackOn = Exception.class)
    public void finalizarManutencoesAbertas(Frasco frasco) {
        List<Manutencao> abertas = manutencaoRepository.findByFrascoAndStatusManutencao(frasco, StatusManutencao.EM_ABERTO);
        abertas.forEach(m -> {
            m.setQuantidade(0L);
            m.setStatusManutencao(StatusManutencao.FINALIZADA);
        });
        manutencaoRepository.saveAll(abertas);
    }

    /**
     * Conclui a manutenção de um frasco, atualizando a sua quantidade final
     * e retornando-o ao status ATIVO. Após a conclusão, o registro de
     * manutenção é removido da fila.
     *
     * @param codManutencao
     * @param novaQuantidade
     */
    @Transactional(rollbackOn = Exception.class)
    public void concluirManutencao(Long codManutencao, Long novaQuantidade) throws ManutencaoException {

        Manutencao manutencao = manutencaoRepository.findById(codManutencao)
                .orElseThrow(() -> new ManutencaoException(getText("error.manutencao.naoEncontrado")));

        // Página desatualizada (outra aba/usuário, ou uma saída que zerou o frasco):
        // concluir de novo reativaria o frasco e duplicaria o descarte.
        if (manutencao.getStatusManutencao() != StatusManutencao.EM_ABERTO) {
            throw new ManutencaoException(getText("error.manutencao.jaFinalizada"));
        }

        Frasco frasco = manutencao.getFrasco();
        long quantidadeAtual = frasco.getQuantidade() != null ? frasco.getQuantidade() : 0L;
        // A conclusão só pode manter ou reduzir (descarte); aumento passa por movimentação
        if (novaQuantidade == null || novaQuantidade < 0 || novaQuantidade > quantidadeAtual) {
            throw new ManutencaoException(getText("error.manutencao.quantidadeInvalida", quantidadeAtual));
        }

        registrarDescarteManutencao(frasco, novaQuantidade);
        frasco.setQuantidade(novaQuantidade);

        // Data de cadastro é preservada; só a próxima manutenção é recalculada
        frasco.setDatManutencao(LocalDateTime.now().plusYears(1));

        frasco.setStatusFrasco(novaQuantidade == 0 ? StatusFrasco.INATIVO : StatusFrasco.DIS_IMPRESSAO);

        frascoRepository.save(frasco);

        manutencao.setStatusManutencao(StatusManutencao.FINALIZADA);
        manutencaoRepository.save(manutencao);
    }

    /**
     * Se a conclusão da manutenção reduziu a quantidade do frasco, registra os dentes
     * removidos como uma Saída, pra que o histórico de movimentações cubra o descarte.
     *
     * @param frasco
     * @param novaQuantidade
     */
    private void registrarDescarteManutencao(Frasco frasco, Long novaQuantidade) {
        long saldoAtual = frasco.getQuantidade() != null ? frasco.getQuantidade() : 0L;
        long removidos = saldoAtual - (novaQuantidade != null ? novaQuantidade : 0L);
        if (removidos <= 0L) {
            return;
        }

        movimentacaoRepository.save(new Movimentacao(
                TipoMovimentacao.SAIDA,
                LocalDateTime.now(),
                frasco.getLocal(),
                getText("msg.movimentacao.descarteManutencao"),
                frasco,
                removidos,
                saldoAtual,
                null
        ));
    }

    /**
     * Registra uma manutenção diretamente para o frasco, utilizando sua quantidade atual.
     */
    @Transactional(rollbackOn = Exception.class)
    public void registrarManutencaoDireta(Long codFrasco) throws ManutencaoException {
        Frasco frasco = frascoRepository.findById(codFrasco)
                .orElseThrow(() -> new ManutencaoException(getText("error.frasco.naoEncontrado")));

        if (frasco.isEmManutencao()) {
            throw new ManutencaoException(getText("error.manutencao.frascoJaEmManutencao"));
        }
        if (frasco.isInativo()) {
            throw new ManutencaoException(getText("error.manutencao.frascoInativo"));
        }

        registrarManutencao(new ManutencaoDTO(
                frasco.getCodigo(),
                frasco.getQuantidade(),
                OrigemManutencao.MANUTENCAO
        ));

        frasco.emManutencao();
        frascoRepository.save(frasco);
    }
}
