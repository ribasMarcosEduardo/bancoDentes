function setupCadastroFrasco() {
    const grupoDentario = document.querySelector("#grupoDentario");
    const estadoFrascoSection = document.querySelector("#estadoFrascoSection");
    const estadoDente = document.querySelector("#estadoDente");
    const quantidadeGroup = document.querySelector("#quantidadeGroup");
    const quantidadeInput = document.querySelector("#quantidade");
    const quantidadeControls = document.querySelectorAll(".quantidade-control");
    const atributosFrascoSection = document.querySelector("#atributosFrascoSection");

    if (
        !grupoDentario ||
        !estadoFrascoSection ||
        !estadoDente ||
        !quantidadeInput ||
        !atributosFrascoSection
    ) {
        return;
    }

    const atributosControls = atributosFrascoSection.querySelectorAll(".atributos-control");

    function enableSection(section) {
        section.classList.remove("form-section--disabled");
    }

    function disableSection(section) {
        section.classList.add("form-section--disabled");
    }

    function setDisabled(elements, disabled) {
        elements.forEach((el) => {
            el.disabled = disabled;
        });
    }

    grupoDentario.addEventListener("change", () => {
        const hasGrupo = grupoDentario.value !== "";

        if (hasGrupo) {
            enableSection(estadoFrascoSection);
            estadoDente.disabled = false;
        } else {
            disableSection(estadoFrascoSection);
            estadoDente.disabled = true;
        }

        estadoDente.value = "";

        quantidadeGroup.classList.add("form-group--disabled");
        quantidadeInput.disabled = true;
        setDisabled(quantidadeControls, true);

        disableSection(atributosFrascoSection);
        setDisabled(atributosControls, true);
    });

    estadoDente.addEventListener("change", () => {
        const hasEstado = estadoDente.value !== "";

        if (hasEstado) {
            quantidadeGroup.classList.remove("form-group--disabled");
            quantidadeInput.disabled = false;
            setDisabled(quantidadeControls, false);
            enableSection(atributosFrascoSection);
            setDisabled(atributosControls, false);
        } else {
            quantidadeGroup.classList.add("form-group--disabled");
            quantidadeInput.disabled = true;
            setDisabled(quantidadeControls, true);
            disableSection(atributosFrascoSection);
            setDisabled(atributosControls, true);
        }
    });
}

setupCadastroFrasco();

// botoes +/- quantidade

function setupNumberInputs() {
    const numberInputs = document.querySelectorAll(".number-input");

    numberInputs.forEach((numberInput) => {
        const input = numberInput.querySelector(".number-input__field");
        const decreaseBtn = numberInput.querySelector("[data-number-action='down']");
        const increaseBtn = numberInput.querySelector("[data-number-action='up']");

        if (!input || !decreaseBtn || !increaseBtn) {
            return;
        }

        let repeatTimeout;
        let repeatInterval;

        function changeQuantity(direction) {
            if (input.disabled) {
                return;
            }

            if (direction === "up") {
                input.stepUp();
            }

            if (direction === "down") {
                const min = Number(input.min || 1);
                const current = Number(input.value || min);

                if (current > min) {
                    input.stepDown();
                }
            }

            input.dispatchEvent(new Event("input", { bubbles: true }));
        }

        function stopRepeat() {
            clearTimeout(repeatTimeout);
            clearInterval(repeatInterval);
        }

        function startRepeat(direction) {
            if (input.disabled) {
                return;
            }

            changeQuantity(direction);

            repeatTimeout = setTimeout(() => {
                repeatInterval = setInterval(() => {
                    if (input.disabled) {
                        stopRepeat();
                        return;
                    }

                    changeQuantity(direction);
                }, 80);
            }, 350);
        }

        increaseBtn.addEventListener("pointerdown", () => startRepeat("up"));
        decreaseBtn.addEventListener("pointerdown", () => startRepeat("down"));

        ["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
            increaseBtn.addEventListener(eventName, stopRepeat);
            decreaseBtn.addEventListener(eventName, stopRepeat);
        });
    });
}

setupNumberInputs();

