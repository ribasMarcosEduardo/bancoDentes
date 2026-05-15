package bancoDentes.service;

import bancoDentes.dto.AnaliseEtapasDTO;
import bancoDentes.exception.AnaliseExeption;
import bancoDentes.exception.FrascoException;
import bancoDentes.model.AnaliseEtapas;
import bancoDentes.model.Frasco;
import bancoDentes.model.Solicitacao;
import bancoDentes.model.enumModels.StatusEtapa;
import bancoDentes.model.enumModels.StatusSolicitacao;
import bancoDentes.repository.AnaliseEtapasRepository;
import bancoDentes.repository.FrascoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnaliseEtapasService {

    private final SolicitacaoService solicitacaoService;
    private final AnaliseEtapasRepository analiseEtapasRepository;

    @Transactional
    public AnaliseEtapas save(AnaliseEtapasDTO analiseEtapasDTO) {
        AnaliseEtapas analiseEtapas = analiseEtapasDTO.mapearAnaliseEtapas();

        if(analiseEtapas.getCodigo() != null){
            AnaliseEtapas etapaDoBanco = buscarPorId(analiseEtapas.getCodigo());
            BeanUtils.copyProperties(analiseEtapas, etapaDoBanco, "codigo");
            analiseEtapas = etapaDoBanco;
        }else {
            Solicitacao solicitacao = analiseEtapas.getSolicitacao();
            solicitacao.setStatusSolicitacao(StatusSolicitacao.EM_ANALISE);
          //  solicitacaoService.save(as);
        }

        return analiseEtapasRepository.save(analiseEtapas);
    }

    public AnaliseEtapas buscarPorId(Long codAnaliseEtapas) {
        return analiseEtapasRepository.findById(codAnaliseEtapas)
                .orElseThrow(() -> new AnaliseExeption("Cadastro não encontrado"));
    }
}
