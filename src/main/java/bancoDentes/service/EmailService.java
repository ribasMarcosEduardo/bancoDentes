package bancoDentes.service;

import bancoDentes.amqp.MailProducer;
import bancoDentes.dto.EmailDTO;
import org.springframework.stereotype.Service;

/**
 * Service responsável por gerenciar o envio de emails via AMQP (RabbitMQ).
 *
 * @author Marcos Eduardo Ribas
 */
@Service
public class EmailService {

    private final MailProducer mailProducer;

    private static final String EMAIL_REMETENTE = "biobancodedentes.jba@unoesc.edu.br";

    public EmailService(MailProducer mailProducer) {
        this.mailProducer = mailProducer;
    }

    public void enviarCodigoVerificacao(String destinatario, String nome, String codigo) {
        String assunto = "Portal BDH - Código de Confirmação";

        String mensagem = "<p>Olá, <strong>" + nome + "</strong>!</p>"
                + "<p>Seu código de confirmação é: <strong>" + codigo + "</strong></p>"
                + "<p>Ele expira em 15 minutos.</p>";

        EmailDTO emailDTO = new EmailDTO(
                EMAIL_REMETENTE,
                new String[]{ destinatario },
                assunto,
                mensagem,
                this.getClass().getSimpleName()
        );

        mailProducer.sendMail(emailDTO);
    }
}