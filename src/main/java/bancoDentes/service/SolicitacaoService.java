package bancoDentes.service;

import bancoDentes.dto.SolicitacaoDTO;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.Estudante;
import bancoDentes.model.Solicitacao;
import bancoDentes.repository.EstudanteRepository;
import bancoDentes.repository.SolicitacaoRepository;
import bancoDentes.service.validator.SolicitacaoValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final EstudanteRepository estudanteRepository; // Apenas teste
    private final SolicitacaoValidator solicitacaoValidator;

    @Transactional
    public Solicitacao save(SolicitacaoDTO solicitacaoDTO) {
        Long codEstudante = (solicitacaoDTO.estudante().getCodEstudante() != null) ? solicitacaoDTO.estudante().getCodEstudante() : 1L;
        Estudante estudante = estudanteRepository.findById(codEstudante)
                .orElseThrow(() -> new RuntimeException("Estudante ID " + codEstudante + " não encontrado!"));

        solicitacaoValidator.validarParaSalvar(solicitacaoDTO,estudante);
        Solicitacao solicitacao = solicitacaoDTO.mapearSolicitacao(estudante);

        if (solicitacao.getCodigo() != null){
            Solicitacao solBanco = buscarPorId(solicitacao.getCodigo());
            BeanUtils.copyProperties(solicitacao, solBanco, "codigo");
            solicitacao = solBanco;
        }

        return solicitacaoRepository.save(solicitacao);
    }

    public Solicitacao buscarPorId(Long codSolicitacao) {
        return solicitacaoRepository.findById(codSolicitacao)
                .orElseThrow(() -> new FrascoException("Solicitação não encontrado com o ID: " + codSolicitacao));
    }



}
