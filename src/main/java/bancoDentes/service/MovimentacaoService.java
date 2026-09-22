package bancoDentes.service;

import bancoDentes.dto.ItemMovimentacaoDTO;
import bancoDentes.dto.MovimentacaoDTO;
import bancoDentes.model.Frasco;
import bancoDentes.model.ItemMovimentacao;
import bancoDentes.model.Movimentacao;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.ItemMovimentacaoRepository;
import bancoDentes.repository.MovimentacaoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service responsável por gerenciar as regras de negócio referente
 * as movimentações.
 *
 * @author Marcos Eduardo Ribas
 */
@Service
@RequiredArgsConstructor
public class MovimentacaoService extends BaseService{

    private final MovimentacaoRepository movimentacaoRepository;
    private final ItemMovimentacaoRepository itemMovimentacaoRepository;
    private final FrascoRepository frascoRepository;

    /**
     * Recupera todos os frascos cadastrados no sistema.
     */
    public List<Movimentacao> getMovimentacoes() {
        return movimentacaoRepository.findAll();
    }

    @Transactional
    public Movimentacao save(MovimentacaoDTO dto) {
        Movimentacao movimentacao = dto.mapearMovimentacao();

        // Associa o Frasco central (destino) usando o ID recebido
        if (dto.codFrasco() != null) {
            movimentacao.setFrasco(frascoRepository.getReferenceById(dto.codFrasco()));
        }

        Movimentacao movimentacaoSalva = movimentacaoRepository.save(movimentacao);

        // Salva os itens de origem (Outros frascos)
        if (dto.itens() != null && !dto.itens().isEmpty()) {
            for (ItemMovimentacaoDTO itemDto : dto.itens()) {
                ItemMovimentacao item = itemDto.mapearItemMovimentacao();
                item.setMovimentacao(movimentacaoSalva);

                if (itemDto.codFrasco() != null) {
                    item.setFrasco(frascoRepository.getReferenceById(itemDto.codFrasco()));
                }

                itemMovimentacaoRepository.save(item);
            }
        }
        // Fluxo de Doação/Outros (usa o frasco central como destino do item)
        else if (dto.quantidade() != null && dto.quantidade() > 0) {
            ItemMovimentacao itemDoacao = new ItemMovimentacao();
            itemDoacao.setMovimentacao(movimentacaoSalva);
            itemDoacao.setQuantidade(dto.quantidade());

            if (dto.codFrasco() != null) {
                itemDoacao.setFrasco(frascoRepository.getReferenceById(dto.codFrasco()));
            }

            itemMovimentacaoRepository.save(itemDoacao);
        }

        return movimentacaoSalva;
    }

}
