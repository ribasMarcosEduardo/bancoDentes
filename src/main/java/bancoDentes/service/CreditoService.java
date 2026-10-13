package bancoDentes.service;

import bancoDentes.model.Usuario;
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
     * @param usuario
     * @param quantidadeAntiga
     * @param quantidadeNova
     */
    public void manipulaCredito(Usuario usuario, Long quantidadeAntiga, Long quantidadeNova) {
        Long diferenca = quantidadeNova - quantidadeAntiga;
        usuario.setCredito(usuario.getCredito() - diferenca);
    }

}