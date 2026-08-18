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

// "Salvar e Continuar"/"Salvar e Sair" ficam na toolbar, fora do <form>
// (ver form="cadastroFrascoForm" em cadastro_frasco.html) — só assim os
// dois type="submit" conseguem disparar o submit do form de verdade.
// Preenchimento incompleto usa a validação nativa do HTML (os campos
// obrigatórios já têm o atributo required; disabled é ignorado sozinho
// pela constraint validation, sem precisar reescrever essa lógica aqui)
// só que com SWAL no lugar do balãozinho padrão do navegador.
function setupCadastroFrascoSubmit() {
    const form = document.querySelector("#cadastroFrascoForm");
    const grupoDentario = document.querySelector("#grupoDentario");

    if (!form || typeof Swal === "undefined") {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.querySelector(":invalid")?.focus();

            Swal.fire({
                icon: "warning",
                title: "Preenchimento incompleto",
                text: "Preencha todos os campos obrigatórios antes de salvar.",
                confirmButtonText: "Entendi",
                buttonsStyling: false,
                customClass: {
                    confirmButton: "btn btn-primary",
                },
            });
            return;
        }

        // event.submitter é o botão que de fato disparou o submit — como
        // os dois (Continuar/Sair) são type="submit" pro mesmo form, é
        // assim que sabe qual dos dois fluxos seguir depois do SWAL.
        const continuar = event.submitter?.id === "salvarContinuarBtn";

        Swal.fire({
            icon: "success",
            title: "Frasco cadastrado!",
            text: continuar
                ? "Cadastro realizado com sucesso. O formulário foi limpo para um novo cadastro."
                : "Cadastro realizado com sucesso.",
            confirmButtonText: "Ok",
            buttonsStyling: false,
            customClass: {
                confirmButton: "btn btn-primary",
            },
        }).then(() => {
            // No projeto final (Thymeleaf): entra aqui o POST de verdade pro
            // backend — o SWAL de sucesso só dispararia depois da resposta OK.
            if (continuar) {
                // form.reset() não desfaz o que o JS mudou via .disabled
                // (só volta value/selected ao estado inicial do HTML) — o
                // "change" reaproveita a mesma cascata de setupCadastroFrasco()
                // (grupoDentario -> estadoFrascoSection -> atributosFrascoSection)
                // pra recolher/desabilitar tudo de novo, sem duplicar a lógica.
                form.reset();
                grupoDentario?.dispatchEvent(new Event("change"));
            } else {
                window.location.href = "frascos.html";
            }
        });
    });
}

setupCadastroFrascoSubmit();

// cadastro_movimentacao.html: Local -> Tipo (+ "Escolher Frascos") -> Observações,
// cada etapa só libera depois que a anterior está preenchida. A liberação de
// Observações a partir da seleção de frascos entra junto com o modal de busca
// (ainda não implementado), então por enquanto ela fica travada.

function setupCadastroMovimentacao() {
    const localSelect = document.querySelector("#localMovimentacao");
    const tipoSection = document.querySelector("#tipoMovimentacaoSection");
    const tipoGroup = document.querySelector("#tipoMovimentacaoGroup");
    const tipoSelect = document.querySelector("#tipoMovimentacao");
    const tipoHint = document.querySelector("#tipoMovimentacaoHint");
    const escolherFrascosBtn = document.querySelector("#escolherFrascosBtn");

    if (!localSelect || !tipoSection || !tipoGroup || !tipoSelect || !escolherFrascosBtn) {
        return;
    }

    // Independe de tipoSelect.disabled: o Biobanco trava o select (disabled)
    // já com "saida" preenchido, e o botão precisa liberar mesmo assim —
    // só o valor importa aqui.
    function aplicarTipoSelecionado() {
        escolherFrascosBtn.disabled = tipoSelect.value === "";
    }

    function aplicarLocalSelecionado() {
        const local = localSelect.value;
        const hasLocal = local !== "";
        const isBiobanco = local === "biobanco";

        tipoSection.classList.toggle("form-section--disabled", !hasLocal);

        // Zera antes de reaplicar — troca de Local sempre parte de um Tipo
        // em branco, tanto pra sair do Biobanco (que trava em "Saída") quanto
        // pra evitar um valor antigo sobrando ao alternar entre locais.
        tipoSelect.value = "";
        tipoSelect.disabled = !hasLocal;

        if (isBiobanco) {
            tipoSelect.value = "saida";
            tipoSelect.disabled = true;
        }

        tipoGroup.classList.toggle("form-group--disabled", isBiobanco);
        if (tipoHint) tipoHint.hidden = !isBiobanco;

        aplicarTipoSelecionado();
    }

    localSelect.addEventListener("change", aplicarLocalSelecionado);
    tipoSelect.addEventListener("change", aplicarTipoSelecionado);
}

setupCadastroMovimentacao();

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

