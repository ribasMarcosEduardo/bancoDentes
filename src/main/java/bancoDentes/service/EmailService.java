package bancoDentes.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service responsável por gerenciar o envio de emails.
 *
 * @author Marcos Eduardo Ribas
 */
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCodigoVerificacao(String destinatario, String codigo) {
        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setTo(destinatario);
        mensagem.setSubject("Portal BDH - Código de Confirmação");
        mensagem.setText("Seu código de confirmação é: " + codigo + "\nEle expira em 15 minutos.");
        mailSender.send(mensagem);
    }
}