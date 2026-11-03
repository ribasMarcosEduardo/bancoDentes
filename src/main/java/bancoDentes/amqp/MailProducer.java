package bancoDentes.amqp;

import bancoDentes.dto.EmailDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MailProducer {

    private static final Logger logger = LoggerFactory.getLogger(MailProducer.class);

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.emailJson.created}")
    private String queueEmailStr;

    public MailProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendMail(EmailDTO emailDTO) {
        try {
            this.rabbitTemplate.convertAndSend(this.queueEmailStr, emailDTO);
            logger.info("E-mail enviado com sucesso para a fila: {}", emailDTO.para()[0]);
        } catch (Exception e) {
            logger.error("Erro ao enviar e-mail para a fila AMQP. Destino: {}", emailDTO.para()[0], e);
        }
    }
}