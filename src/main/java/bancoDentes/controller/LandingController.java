package bancoDentes.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller referente à landing page pública.
 */
@Controller
public class LandingController {

    @GetMapping("/")
    public String exibeLanding() {
        return "index";
    }
}
