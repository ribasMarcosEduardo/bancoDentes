package bancoDentes.amqp;

import bancoDentes.dto.EmailDTO;
import bancoDentes.dto.MessageWrapperDTO;
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
        MessageWrapperDTO<EmailDTO> wrapper = new MessageWrapperDTO<>(emailDTO);
        rabbitTemplate.convertAndSend(queueEmailStr, wrapper);
    }
}