package bancoDentes.service;

import bancoDentes.dto.ItemMovimentacaoDTO;
import bancoDentes.dto.MovimentacaoDTO;
import bancoDentes.exception.ManutencaoException;
import bancoDentes.exception.MovimentacaoException;
import bancoDentes.model.Frasco;
import bancoDentes.model.Movimentacao;
import bancoDentes.model.enumModels.OrigemMovimentacao;
import bancoDentes.model.enumModels.TipoMovimentacao;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.MovimentacaoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service responsável por gerenciar as regras de negócio referente
 * as movimentações.
 *
 * @author Marcos Eduardo Ribas
 */
@Service
@RequiredArgsConstructor
public class MovimentacaoService extends BaseService {

    private final MovimentacaoRepository movimentacaoRepository;
    private final FrascoRepository frascoRepository;
    private final ManutencaoService manutencaoService;

    /**
     * Recupera todas as movimentações cadastradas no sistema.
     */
    public List<Movimentacao> getMovimentacoes() {
        return movimentacaoRepository.findAll();
    }

    /**
     * Recupera as movimentações de um frasco específico.
     *
     * @param codFrasco
     */
    public List<Movimentacao> getMovimentacoesDoFrasco(Long codFrasco) {
        return movimentacaoRepository.findByFrascoCodigo(codFrasco);
    }

    @Transactional(rollbackOn = Exception.class)
    public List<Movimentacao> save(MovimentacaoDTO dto) throws Exception {
        validarFrascosMovimentaveis(dto);

        if (TipoMovimentacao.SAIDA.equals(dto.tipoMovimentacao())) {
            return salvarMovimentacaoSaida(dto);
        }

        validarTransferencia(dto);
        return salvarMovimentacaoEntrada(dto);
    }

    /**
     * Garante, antes de qualquer gravação, que nenhum frasco envolvido está inativo.
     */
    private void validarFrascosMovimentaveis(MovimentacaoDTO dto) throws MovimentacaoException {
        List<Long> codigos = new ArrayList<>();
        if (dto.codFrasco() != null) {
            codigos.add(dto.codFrasco());
        }
        if (dto.itens() != null) {
            dto.itens().stream()
                    .filter(item -> item != null && item.codFrasco() != null)
                    .forEach(item -> codigos.add(item.codFrasco()));
        }

        for (Frasco frasco : frascoRepository.findAllById(codigos)) {
            if (frasco.isInativo()) {
                throw new MovimentacaoException(getText("error.movimentacao.frascoInativo", frasco.getIdentificacao()));
            }
        }
    }

    /**
     * Na entrada por transferência, repete no servidor as regras que o modal já aplica:
     * o destino não pode ser também origem, e cada origem precisa ter as mesmas
     * características do destino (grupo, estado, arcada e dentição).
     */
    private void validarTransferencia(MovimentacaoDTO dto) throws MovimentacaoException {
        if (dto.itens() == null || dto.itens().isEmpty() || dto.codFrasco() == null) {
            return;
        }

        Frasco destino = frascoRepository.findById(dto.codFrasco())
                .orElseThrow(() -> new MovimentacaoException(getText("error.frasco.naoEncontrado")));

        for (ItemMovimentacaoDTO item : dto.itens()) {
            if (item == null || item.codFrasco() == null) {
                continue;
            }

            Frasco origem = frascoRepository.findById(item.codFrasco())
                    .orElseThrow(() -> new MovimentacaoException(getText("error.frasco.naoEncontrado")));

            if (origem.getCodigo().equals(destino.getCodigo())) {
                throw new MovimentacaoException(getText("error.movimentacao.origemIgualDestino", origem.getIdentificacao()));
            }

            boolean compativel = origem.getTipoDente() == destino.getTipoDente()
                    && origem.getEstado() == destino.getEstado()
                    && origem.getArcada() == destino.getArcada()
                    && origem.getDenticao() == destino.getDenticao();
            if (!compativel) {
                throw new MovimentacaoException(getText("error.movimentacao.origemIncompativel", origem.getIdentificacao()));
            }
        }
    }

    /**
     * Cria a movimentação principal de Entrada e as movimentações de Transferência
     * para os frascos de origem (se houverem).
     */
    private List<Movimentacao> salvarMovimentacaoEntrada(MovimentacaoDTO dto) throws Exception {
        List<Movimentacao> movimentacoesSalvas = new ArrayList<>();

        Frasco frascoDestino = frascoRepository.findById(dto.codFrasco())
                .orElseThrow(() -> new MovimentacaoException(getText("error.frasco.naoEncontrado")));

        Movimentacao movimentacaoEntrada = dto.mapearMovimentacao(frascoDestino);
        long saldoAtual = frascoDestino.getQuantidade() != null ? frascoDestino.getQuantidade() : 0L;
        movimentacaoEntrada.setSaldoAnterior(saldoAtual);

        movimentacaoEntrada = movimentacaoRepository.save(movimentacaoEntrada);

        long quantidadeTotalTransferencias = processarItensEQuantidadeEntrada(dto, movimentacaoEntrada, movimentacoesSalvas);

        long qtdEntradaInformada = dto.quantidade() != null ? dto.quantidade() : 0L;

        boolean temItensOrigem = dto.itens() != null && !dto.itens().isEmpty();

        long novaQuantidadeDestino;
        if (temItensOrigem) {
            novaQuantidadeDestino = saldoAtual + quantidadeTotalTransferencias;
        } else {
            novaQuantidadeDestino = saldoAtual + qtdEntradaInformada;
        }

        frascoDestino.setQuantidade(novaQuantidadeDestino);

        long qtdFinal = quantidadeTotalTransferencias > 0 ? quantidadeTotalTransferencias : qtdEntradaInformada;
        movimentacaoEntrada.setQuantidade(qtdFinal);

        // Destino já em manutenção: atualiza a manutenção aberta em vez de abrir outra
        manutencaoService.registrarOuAtualizarManutencao(frascoDestino, novaQuantidadeDestino);

        frascoDestino.emManutencao();
        frascoRepository.save(frascoDestino);

        movimentacoesSalvas.add(0, movimentacaoRepository.save(movimentacaoEntrada));

        return movimentacoesSalvas;
    }

    /**
     * Processa os frascos de origem para movimentações de Entrada e gera Transferências.
     */
    private long processarItensEQuantidadeEntrada(MovimentacaoDTO dto, Movimentacao movimentacaoEntrada, List<Movimentacao> movimentacoesSalvas) throws MovimentacaoException {
        long quantidadeTotal = 0L;

        if (dto.itens() != null && !dto.itens().isEmpty()) {
            for (ItemMovimentacaoDTO itemDto : dto.itens()) {
                if (itemDto != null && itemDto.codFrasco() != null) {
                    Frasco frascoOrigem = frascoRepository.findById(itemDto.codFrasco())
                            .orElseThrow(() ->  new MovimentacaoException(getText("error.frasco.naoEncontrado")));

                    long saldoAnteriorOrigem = frascoOrigem.getQuantidade() != null ? frascoOrigem.getQuantidade() : 0L;

                    // Transferência esvazia a origem: usa o saldo real no momento da gravação,
                    // não a quantidade do formulário (que pode estar desatualizada), pra que
                    // nenhum dente suma ou apareça sem registro.
                    long qtdTransferida = saldoAnteriorOrigem;
                    quantidadeTotal += qtdTransferida;

                    frascoOrigem.setQuantidade(0L);
                    frascoOrigem.setStatusFrasco(bancoDentes.model.enumModels.StatusFrasco.INATIVO);
                    // Origem em manutenção: encerra a manutenção aberta junto com a inativação
                    manutencaoService.finalizarManutencoesAbertas(frascoOrigem);
                    frascoRepository.save(frascoOrigem);

                    if (qtdTransferida > 0L) {
                        Movimentacao transferencia = new Movimentacao(
                                TipoMovimentacao.TRANSFERENCIA,
                                OrigemMovimentacao.REGISTRO_MANUAL,
                                dto.datManutencao() != null ? dto.datManutencao().atStartOfDay() : LocalDateTime.now(),
                                dto.local(),
                                dto.observacao(),
                                frascoOrigem,
                                qtdTransferida,
                                saldoAnteriorOrigem,
                                movimentacaoEntrada
                        );

                        movimentacoesSalvas.add(movimentacaoRepository.save(transferencia));
                    }
                }
            }
        }
        return quantidadeTotal;
    }

    /**
     * Processa os frascos de origem para movimentações de Saída.
     */
    private List<Movimentacao> salvarMovimentacaoSaida(MovimentacaoDTO dto) throws Exception {
        List<Movimentacao> movimentacoesSalvas = new ArrayList<>();

        if (dto.itens() != null && !dto.itens().isEmpty()) {
            for (ItemMovimentacaoDTO itemDto : dto.itens()) {
                if (itemDto != null && itemDto.codFrasco() != null) {

                    Frasco frascoOrigem = frascoRepository.findById(itemDto.codFrasco())
                            .orElseThrow(() -> new MovimentacaoException(getText("error.frasco.naoEncontrado")));

                    long qtdSaida = (itemDto.quantidade() != null) ? itemDto.quantidade() : 0L;
                    long saldoAtual = frascoOrigem.getQuantidade() != null ? frascoOrigem.getQuantidade() : 0L;

                    // Catálogo do formulário pode estar desatualizado: não deixa sair mais
                    // dentes do que o frasco tem (o histórico registraria saídas inexistentes)
                    if (qtdSaida > saldoAtual) {
                        throw new MovimentacaoException(getText("error.movimentacao.saidaMaiorQueSaldo",
                                frascoOrigem.getIdentificacao(), qtdSaida, saldoAtual));
                    }

                    if (qtdSaida > 0L) {
                        registrarManutencaoSaida(frascoOrigem, saldoAtual, qtdSaida);

                        Movimentacao movimentacao = new Movimentacao(
                                TipoMovimentacao.SAIDA,
                                OrigemMovimentacao.REGISTRO_MANUAL,
                                dto.datManutencao() != null ? dto.datManutencao().atStartOfDay() : LocalDateTime.now(),
                                dto.local(),
                                dto.observacao(),
                                frascoOrigem,
                                qtdSaida,
                                saldoAtual,
                                null
                        );

                        movimentacoesSalvas.add(movimentacaoRepository.save(movimentacao));
                    }
                }
            }
        }

        return movimentacoesSalvas;
    }

    /**
     * Registra a manutenção para um frasco em uma operação de Saída.
     * Se o frasco já estiver em manutenção, a manutenção aberta é atualizada
     * (ou finalizada, se a saída zerar o frasco) em vez de abrir outra.
     */
    private void registrarManutencaoSaida(Frasco frascoOrigem, long saldoAtual, long qtdSaida) throws ManutencaoException {
        long novaQuantidadeCalculada = Math.max(0, saldoAtual - qtdSaida);
        frascoOrigem.setQuantidade(novaQuantidadeCalculada);

        if (novaQuantidadeCalculada == 0L) {
            manutencaoService.finalizarManutencoesAbertas(frascoOrigem);
            frascoOrigem.inativo();
        } else {
            manutencaoService.registrarOuAtualizarManutencao(frascoOrigem, novaQuantidadeCalculada);
            frascoOrigem.emManutencao();
        }

        frascoRepository.save(frascoOrigem);
    }



    /**
     * Registra a quantidade inicial do frasco como uma Entrada sem frascos de origem
     * (equivalente a "Doação/Outros"), pra que o histórico de movimentações cubra
     * todos os dentes que já passaram pelo frasco.
     *
     * @param frasco
     */
    public void registrarEntradaCadastro(Frasco frasco) {
        long quantidade = frasco.getQuantidade() != null ? frasco.getQuantidade() : 0L;
        if (quantidade <= 0L) {
            return;
        }

        movimentacaoRepository.save(new Movimentacao(
                TipoMovimentacao.ENTRADA,
                OrigemMovimentacao.CADASTRO,
                frasco.getDatCad(),
                frasco.getLocal(),
                this.getText("msg.movimentacao.cadastroFrasco", frasco.getIdentificacao()),
                frasco,
                quantidade,
                0L,
                null
        ));
    }

}