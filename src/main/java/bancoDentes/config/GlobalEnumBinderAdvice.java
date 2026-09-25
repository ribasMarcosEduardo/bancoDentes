package bancoDentes.config;

import bancoDentes.model.enumModels.EstadoDente;
import bancoDentes.model.enumModels.Arcada;
import bancoDentes.model.enumModels.TipoDente;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.InitBinder;

import java.beans.PropertyEditorSupport;

@ControllerAdvice
public class GlobalEnumBinderAdvice {

    @InitBinder
    public void initBinder(WebDataBinder binder) {

        binder.registerCustomEditor(EstadoDente.class, new PropertyEditorSupport() {
            @Override
            public void setAsText(String text) throws IllegalArgumentException {
                if (text == null || text.trim().isEmpty()) {
                    setValue(null);
                } else {
                    setValue(EstadoDente.valueOf(text.toUpperCase()));
                }
            }
        });

        binder.registerCustomEditor(TipoDente.class, new PropertyEditorSupport() {
            @Override
            public void setAsText(String text) throws IllegalArgumentException {
                if (text == null || text.trim().isEmpty()) {
                    setValue(null);
                } else {
                    setValue(TipoDente.valueOf(text.toUpperCase()));
                }
            }
        });

        binder.registerCustomEditor(Arcada.class, new PropertyEditorSupport() {
            @Override
            public void setAsText(String text) throws IllegalArgumentException {
                if (text == null || text.trim().isEmpty()) {
                    setValue(null);
                } else {
                    setValue(Arcada.valueOf(text.toUpperCase()));
                }
            }
        });
    }
}