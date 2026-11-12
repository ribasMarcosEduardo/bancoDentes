package bancoDentes.amqp;

import bancoDentes.dto.EmailDTO;
import bancoDentes.dto.MessageWrapperDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MailProducer {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    @Value("${rabbitmq.emailJson.created}")
    private String queueEmailStr;

    public MailProducer(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    public void sendMail(EmailDTO emailDTO) {
        try {
            MessageWrapperDTO<EmailDTO> wrapper = new MessageWrapperDTO<>(emailDTO);
            String jsonPayload = objectMapper.writeValueAsString(wrapper);
            rabbitTemplate.convertAndSend(queueEmailStr, jsonPayload);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}