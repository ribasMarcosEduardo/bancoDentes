const NUMERACAO_POR_GRUPO_E_DENTICAO = {
    premolar: {
        permanente: [
            { value: "14", label: "1º Pré-molar Superior Direito" },
            { value: "15", label: "2º Pré-molar Superior Direito" },
            { value: "24", label: "1º Pré-molar Superior Esquerdo" },
            { value: "25", label: "2º Pré-molar Superior Esquerdo" },
            { value: "34", label: "1º Pré-molar Inferior Esquerdo" },
            { value: "35", label: "2º Pré-molar Inferior Esquerdo" },
            { value: "44", label: "1º Pré-molar Inferior Direito" },
            { value: "45", label: "2º Pré-molar Inferior Direito" },
        ],
        decidua: [],
    },
    molar: {
        permanente: [
            { value: "16", label: "1º Molar Superior Direito" },
            { value: "17", label: "2º Molar Superior Direito" },
            { value: "18", label: "3º Molar / Siso Superior Direito" },
            { value: "26", label: "1º Molar Superior Esquerdo" },
            { value: "27", label: "2º Molar Superior Esquerdo" },
            { value: "28", label: "3º Molar / Siso Superior Esquerdo" },
            { value: "36", label: "1º Molar Inferior Esquerdo" },
            { value: "37", label: "2º Molar Inferior Esquerdo" },
            { value: "38", label: "3º Molar / Siso Inferior Esquerdo" },
            { value: "46", label: "1º Molar Inferior Direito" },
            { value: "47", label: "2º Molar Inferior Direito" },
            { value: "48", label: "3º Molar / Siso Inferior Direito" },
        ],
        decidua: [
            { value: "54", label: "1º Molar Decíduo Superior Direito" },
            { value: "55", label: "2º Molar Decíduo Superior Direito" },
            { value: "64", label: "1º Molar Decíduo Superior Esquerdo" },
            { value: "65", label: "2º Molar Decíduo Superior Esquerdo" },
            { value: "74", label: "1º Molar Decíduo Inferior Esquerdo" },
            { value: "75", label: "2º Molar Decíduo Inferior Esquerdo" },
            { value: "84", label: "1º Molar Decíduo Inferior Direito" },
            { value: "85", label: "2º Molar Decíduo Inferior Direito" },
        ],
    },
};

function setupCadastroFrasco() {
    const grupoDentario = document.querySelector("#grupoDentario");
    const estadoFrascoSection = document.querySelector("#estadoFrascoSection");
    const estadoDente = document.querySelector("#estadoDente");
    const quantidadeGroup = document.querySelector("#quantidadeGroup");
    const quantidadeInput = document.querySelector("#quantidade");
    const quantidadeControls = document.querySelectorAll(".quantidade-control");
    const atributosFrascoSection = document.querySelector("#atributosFrascoSection");
    const denticaoGroup = document.querySelector("#denticaoGroup");
    const denticaoSelect = document.querySelector("#denticaoSelect");
    const arcadaGroup = document.querySelector("#arcadaGroup");
    const numeracaoGroup = document.querySelector("#numeracaoGroup");
    const numeracaoSelect = document.querySelector("#numeracaoSelect");
    const numeracaoHint = document.querySelector("#numeracaoHint");

    if (
        !grupoDentario ||
        !estadoFrascoSection ||
        !estadoDente ||
        !quantidadeInput ||
        !atributosFrascoSection ||
        !denticaoGroup ||
        !denticaoSelect ||
        !arcadaGroup ||
        !numeracaoGroup ||
        !numeracaoSelect ||
        !numeracaoHint
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

    function usaNumeracao() {
        return grupoDentario.value === "molar" || grupoDentario.value === "premolar";
    }

    function isEndo() {
        return grupoDentario.value === "endo";
    }

    function atualizarVisibilidadeCamposAtributos() {
        const endo = isEndo();
        const mostrarNumeracao = usaNumeracao();

        denticaoGroup.hidden = endo;
        arcadaGroup.hidden = endo || mostrarNumeracao;
        numeracaoGroup.hidden = endo || !mostrarNumeracao;
    }

    function popularOpcoesNumeracao() {
        const denticao = denticaoSelect.value;
        const opcoes = (NUMERACAO_POR_GRUPO_E_DENTICAO[grupoDentario.value] || {})[denticao] || [];

        numeracaoSelect.innerHTML = "";

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.selected = true;

        if (!denticao) {
            placeholder.textContent = "- Selecione a Dentição -";
            numeracaoSelect.appendChild(placeholder);
            return;
        }

        if (opcoes.length === 0) {
            placeholder.textContent = "Não disponível";
            numeracaoSelect.appendChild(placeholder);
            return;
        }

        placeholder.disabled = true;
        placeholder.textContent = "- Selecione a Numeração -";
        numeracaoSelect.appendChild(placeholder);

        opcoes.forEach(({ value, label }) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            option.dataset.label = label;
            numeracaoSelect.appendChild(option);
        });
    }

    function sincronizarDisabledNumeracao() {
        const atributosLiberados = !atributosFrascoSection.classList.contains("form-section--disabled");
        const temDenticao = denticaoSelect.value !== "";
        const temOpcoes = numeracaoSelect.querySelectorAll("option[value]:not([value=''])").length > 0;

        numeracaoSelect.disabled = !(atributosLiberados && temDenticao && temOpcoes);
    }

    function atualizarDicaNumeracao() {
        const opcaoSelecionada = numeracaoSelect.selectedOptions[0];
        const label = opcaoSelecionada ? opcaoSelecionada.dataset.label : undefined;
        numeracaoHint.textContent = label ? `(${label})` : "";
    }

    function aplicarEstadoSelecionado() {
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

        sincronizarDisabledNumeracao();
    }

    grupoDentario.addEventListener("change", () => {
        const hasGrupo = grupoDentario.value !== "";
        const endo = isEndo();

        if (hasGrupo) {
            enableSection(estadoFrascoSection);
        } else {
            disableSection(estadoFrascoSection);
        }

        if (endo) {
            estadoDente.disabled = true;
            estadoDente.value = "misto";
        } else {
            estadoDente.disabled = !hasGrupo;
            estadoDente.value = "";
        }

        denticaoSelect.value = "";

        atualizarVisibilidadeCamposAtributos();
        popularOpcoesNumeracao();
        atualizarDicaNumeracao();

        aplicarEstadoSelecionado();
    });

    estadoDente.addEventListener("change", aplicarEstadoSelecionado);

    denticaoSelect.addEventListener("change", () => {
        popularOpcoesNumeracao();
        sincronizarDisabledNumeracao();
        atualizarDicaNumeracao();
    });

    numeracaoSelect.addEventListener("change", () => {
        atualizarDicaNumeracao();
    });

    atualizarVisibilidadeCamposAtributos();
    popularOpcoesNumeracao();
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

// seta dos selects do formulário gira ao abrir/fechar (mesmo padrão do
// page-size-control, ver page-size.js)

function setupFormSelectAnimations() {
    const wrappers = document.querySelectorAll(".form-card .select-wrapper");

    wrappers.forEach((wrapper) => {
        const select = wrapper.querySelector(".form-control");

        if (!select) {
            return;
        }

        let isOpen = false;

        function close() {
            isOpen = false;
            wrapper.classList.remove("is-open");
        }

        select.addEventListener("mousedown", () => {
            const wasFocused = document.activeElement === select;

            isOpen = wasFocused ? !isOpen : true;
            wrapper.classList.toggle("is-open", isOpen);
        });

        select.addEventListener("blur", close);
        select.addEventListener("change", close);
    });
}

setupFormSelectAnimations();

// clique no botão do ícone de calendário abre o seletor nativo — o botão
// tampa o ::-webkit-calendar-picker-indicator (ver forms.css), então ele
// precisa disparar a abertura sozinho. Enter/Espaço já funcionam de
// graça por ser um <button> de verdade.

function setupDateIcons() {
    const triggers = document.querySelectorAll(".form-card .date-icon-trigger");

    triggers.forEach((trigger) => {
        const input = trigger.closest(".date-wrapper")?.querySelector(".form-control");

        if (!input || !input.showPicker) {
            return;
        }

        trigger.addEventListener("click", () => {
            if (input.disabled) {
                return;
            }

            input.showPicker();
        });
    });
}

setupDateIcons();

