package bancoDentes.service;

import bancoDentes.dto.ItemSolicitacaoDTO;
import bancoDentes.dto.SolicitacaoDTO;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.Estudante;
import bancoDentes.model.Frasco;
import bancoDentes.model.ItemSolicitacao;
import bancoDentes.model.Solicitacao;
import bancoDentes.repository.EstudanteRepository;
import bancoDentes.repository.FrascoRepository;
import bancoDentes.repository.SolicitacaoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final EstudanteRepository estudanteRepository; // Apenas teste
    private final FrascoRepository frascoRepository;

    @Transactional
    public Solicitacao save(SolicitacaoDTO solicitacaoDTO) {
        Long codEstudante = (solicitacaoDTO.codEstudante() != null) ? solicitacaoDTO.codEstudante() : 1L;

        Estudante estudante = estudanteRepository.findById(codEstudante)
                .orElseThrow(() -> new RuntimeException("Estudante ID " + codEstudante + " não encontrado!"));

        Solicitacao solicitacao = solicitacaoDTO.mapearSolicitacao(estudante);
        if (solicitacaoDTO.itens() != null) {
            solicitacao.getItens().clear();

            for (ItemSolicitacaoDTO itemDto : solicitacaoDTO.itens()) {
                Frasco frasco = frascoRepository.findById(itemDto.codFrasco())
                        .orElseThrow(() -> new RuntimeException("Frasco não encontrado: " + itemDto.codFrasco()));

                ItemSolicitacao item = itemDto.mapearItem(frasco);
                item.setSolicitacao(solicitacao);
                solicitacao.getItens().add(item);
            }
        }

        return solicitacaoRepository.save(solicitacao);
    }


    public Solicitacao buscarPorId(Long codSolicitacao) {
        return solicitacaoRepository.findById(codSolicitacao)
                .orElseThrow(() -> new FrascoException("Solicitação não encontrado com o ID: " + codSolicitacao));
    }



}
