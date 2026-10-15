package bancoDentes.service.validator;

import bancoDentes.dto.ItemMovimentacaoDTO;
import bancoDentes.dto.MovimentacaoDTO;
import bancoDentes.exception.MovimentacaoException;
import bancoDentes.model.Frasco;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.service.BaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MovimentacaoValidator extends BaseService {

    private final FrascoRepository frascoRepository;

    public void validarFrascosMovimentaveis(MovimentacaoDTO dto) throws MovimentacaoException {
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

    public void validarTransferencia(MovimentacaoDTO dto) throws MovimentacaoException {
        if (dto.itens() == null || dto.itens().isEmpty() || dto.codFrasco() == null) {
            return;
        }

        Frasco destino = frascoRepository.findById(dto.codFrasco())
                .orElseThrow(() -> new MovimentacaoException(getText("error.frasco.naoEncontrado")));

        for (ItemMovimentacaoDTO item : dto.itens()) {
            if (item == null || item.codFrasco() == null) continue;

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
}