package bancoDentes.service;

import bancoDentes.model.Estudante;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service responsável por gerenciar e manipular o saldo de créditos
 * dos estudantes no sistema do Banco de Dentes.
 *
 * @author Marcos Eduardo Ribas
 */
@Service
@RequiredArgsConstructor
public class CreditoService {

    /**
     * Atualiza o saldo de créditos de um estudante com base na variação da
     * quantidade de dentes solicitados.
     *
     * @param estudante
     * @param quantidadeAntiga
     * @param quantidadeNova
     */
    public void manipulaCredito(Estudante estudante, Long quantidadeAntiga, Long quantidadeNova) {
        Long diferenca = quantidadeNova - quantidadeAntiga;
        estudante.setCredito(estudante.getCredito() - diferenca);
    }

}