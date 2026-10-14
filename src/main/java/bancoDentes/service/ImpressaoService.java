package bancoDentes.service;

import bancoDentes.exception.FrascoException;
import bancoDentes.model.Frasco;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ImpressaoService extends BaseService{

    private final FrascoService frascoService;




}
