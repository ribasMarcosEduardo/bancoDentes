const NUMERACAO_POR_GRUPO_E_DENTICAO = {
    molar: {
        permanente: [
            // Sem os sisos (18, 28, 38, 48): viram grupo dentário próprio
            { value: "16", label: "1º Molar Superior Direito" },
            { value: "17", label: "2º Molar Superior Direito" },
            { value: "26", label: "1º Molar Superior Esquerdo" },
            { value: "27", label: "2º Molar Superior Esquerdo" },
            { value: "36", label: "1º Molar Inferior Esquerdo" },
            { value: "37", label: "2º Molar Inferior Esquerdo" },
            { value: "46", label: "1º Molar Inferior Direito" },
            { value: "47", label: "2º Molar Inferior Direito" },
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
};

function setupCadastroFrasco() {
    const tipoDente = document.querySelector("#tipoDente");
    const estadoFrascoSection = document.querySelector("#estadoFrascoSection");
    const estadoDenteGroup = document.querySelector("#estadoDenteGroup");
    const estadoDente = document.querySelector("#estadoDente");
    const quantidadeGroup = document.querySelector("#quantidadeGroup");
    const quantidadeInput = document.querySelector("#quantidade");
    const quantidadeControls = document.querySelectorAll(".quantidade-control");
    const atributosFrascoSection = document.querySelector("#atributosFrascoSection");
    const denticaoGroup = document.querySelector("#denticaoGroup");
    const arcadaGroup = document.querySelector("#arcadaGroup");
    const denticaoSelect = document.querySelector("#denticao");
    const arcadaSelect = document.querySelector("#arcada");
    const numeracaoGroup = document.querySelector("#numeracaoGroup");
    const numeracaoSelect = document.querySelector("#numeracaoSelect");
    const numeracaoHint = document.querySelector("#numeracaoHint");

    const codigoInput = document.querySelector("input[name='codigo']");
    const isEdicao = codigoInput && codigoInput.value !== "" && codigoInput.value !== "null";
    const valorInicialNumeracao = numeracaoSelect ? numeracaoSelect.value : "";

    if (!tipoDente || !estadoFrascoSection || !estadoDente || !quantidadeInput || !atributosFrascoSection) {
        return;
    }

    const atributosControls = atributosFrascoSection.querySelectorAll(".atributos-control");

    const originalDenticaoOptions = Array.from(denticaoSelect ? denticaoSelect.options : []).map(opt => ({
        value: opt.value,
        text: opt.textContent,
        selected: opt.selected
    }));

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

    function getGrupo() {
        return tipoDente.value ? tipoDente.value.toLowerCase() : "";
    }

    function isEndoOuSiso() {
        const grupo = getGrupo();
        return grupo === "endo" || grupo === "siso";
    }

    function usaNumeracao() {
        const grupo = getGrupo();
        return grupo === "molar" || grupo === "premolar" || grupo === "pre_molar";
    }

    function isPreMolar() {
        const grupo = getGrupo();
        return grupo === "premolar" || grupo === "pre_molar";
    }

    function atualizarVisibilidadeCamposAtributos() {
        const especial = isEndoOuSiso();
        const mostrarNumeracao = usaNumeracao();

        if (denticaoGroup) denticaoGroup.hidden = especial;
        if (arcadaGroup) arcadaGroup.hidden = mostrarNumeracao || especial;
        if (numeracaoGroup) numeracaoGroup.hidden = !mostrarNumeracao;

        if (denticaoSelect) {
            const currentVal = denticaoSelect.value;
            denticaoSelect.innerHTML = "";
            originalDenticaoOptions.forEach(optData => {
                if (isPreMolar() && optData.value.toLowerCase() === "decidua") {
                    return;
                }
                const opt = document.createElement("option");
                opt.value = optData.value;
                opt.textContent = optData.text;
                if (optData.value === currentVal) {
                    opt.selected = true;
                }
                denticaoSelect.appendChild(opt);
            });
            if (isPreMolar() && currentVal.toLowerCase() === "decidua") {
                denticaoSelect.value = "NAO_INFORMADA";
            }
        }
    }

    function popularOpcoesNumeracao() {
        if (!numeracaoSelect) return;

        let grupoKey = tipoDente.value.toLowerCase().replace("-", "").replace("_", "");
        if (grupoKey === "premolar") grupoKey = "premolar";
        if (grupoKey === "molar") grupoKey = "molar";

        const denticao = denticaoSelect ? denticaoSelect.value.toLowerCase() : "";
        const opcoes = (NUMERACAO_POR_GRUPO_E_DENTICAO[grupoKey] || {})[denticao] || [];

        const valorAlvo = numeracaoSelect.value || valorInicialNumeracao;

        numeracaoSelect.innerHTML = "";

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.selected = true;

        if (!denticao || denticao === "nao_informada") {
            placeholder.textContent = "- Selecione a Dentição -";
            numeracaoSelect.appendChild(placeholder);
            sincronizarDisabledNumeracao();
            return;
        }

        if (opcoes.length === 0) {
            placeholder.textContent = "Não disponível";
            numeracaoSelect.appendChild(placeholder);
            sincronizarDisabledNumeracao();
            return;
        }

        placeholder.disabled = true;
        placeholder.textContent = "- Selecione a Numeração -";
        numeracaoSelect.appendChild(placeholder);

        let encontrou = false;
        opcoes.forEach(({ value, label }) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            option.dataset.label = label;

            if (value === String(valorAlvo)) {
                option.selected = true;
                encontrou = true;
            }

            numeracaoSelect.appendChild(option);
        });

        if (encontrou) {
            placeholder.selected = false;
        }

        sincronizarDisabledNumeracao();
        atualizarDicaNumeracao();
    }

    function sincronizarDisabledNumeracao() {
        if (!denticaoSelect || !numeracaoSelect) return;

        const atributosLiberados = !atributosFrascoSection.classList.contains("form-section--disabled");
        const temDenticao = denticaoSelect.value !== "" && denticaoSelect.value !== "NAO_INFORMADA";
        const temOpcoes = numeracaoSelect.querySelectorAll("option[value]:not([value=''])").length > 0;

        numeracaoSelect.disabled = !(atributosLiberados && temDenticao && temOpcoes);
    }

    function atualizarDicaNumeracao() {
        if (!numeracaoSelect || !numeracaoHint) return;

        const opcaoSelecionada = numeracaoSelect.selectedOptions[0];
        const label = opcaoSelecionada ? opcaoSelecionada.dataset.label : undefined;
        numeracaoHint.textContent = label ? `(${label})` : "";
    }

    function aplicarEstadoSelecionado() {
        const hasGrupo = tipoDente.value !== "";

        const quantidadeLiberada = hasGrupo && !isEdicao;
        quantidadeGroup.classList.toggle("form-group--disabled", !quantidadeLiberada);
        quantidadeInput.disabled = !quantidadeLiberada;
        setDisabled(quantidadeControls, !quantidadeLiberada);

        if (hasGrupo) {
            enableSection(atributosFrascoSection);
            setDisabled(atributosControls, false);
        } else {
            disableSection(atributosFrascoSection);
            setDisabled(atributosControls, true);
        }

        sincronizarDisabledNumeracao();
    }

    tipoDente.addEventListener("change", () => {
        const hasGrupo = tipoDente.value !== "";
        const especial = isEndoOuSiso();

        if (hasGrupo) {
            enableSection(estadoFrascoSection);
        } else {
            disableSection(estadoFrascoSection);
        }

        if (especial) {
            if (estadoDenteGroup) estadoDenteGroup.hidden = true;
            estadoDente.required = false;
            estadoDente.value = "misto";
        } else {
            if (estadoDenteGroup) estadoDenteGroup.hidden = false;
            estadoDente.required = true;
            estadoDente.disabled = !hasGrupo;
        }

        if (!isEdicao) {
            if (denticaoSelect) denticaoSelect.value = "NAO_INFORMADA";
            if (arcadaSelect) arcadaSelect.value = "NAO_INFORMADA";
            if (!especial) {
                estadoDente.value = "";
            }
        }

        atualizarVisibilidadeCamposAtributos();
        popularOpcoesNumeracao();
        atualizarDicaNumeracao();
        aplicarEstadoSelecionado();
    });

    estadoDente.addEventListener("change", aplicarEstadoSelecionado);

    denticaoSelect?.addEventListener("change", () => {
        popularOpcoesNumeracao();
        sincronizarDisabledNumeracao();
        atualizarDicaNumeracao();
    });

    numeracaoSelect?.addEventListener("change", () => {
        atualizarDicaNumeracao();
    });

    const grupoHint = document.querySelector("#grupoDentarioHint");

    function atualizarDicasLiberacao() {
        if (grupoHint) grupoHint.hidden = tipoDente.value !== "";
    }

    tipoDente.addEventListener("change", atualizarDicasLiberacao);
    atualizarDicasLiberacao();

    if (isEdicao && tipoDente.value !== "") {
        enableSection(estadoFrascoSection);
        estadoDente.disabled = false;
        if (isEndoOuSiso()) {
            if (estadoDenteGroup) estadoDenteGroup.hidden = true;
            estadoDente.required = false;
        } else {
            if (estadoDenteGroup) estadoDenteGroup.hidden = false;
            estadoDente.required = true;
        }
        atualizarVisibilidadeCamposAtributos();
        popularOpcoesNumeracao();
        atualizarDicaNumeracao();
        aplicarEstadoSelecionado();
    } else {
        atualizarVisibilidadeCamposAtributos();
        popularOpcoesNumeracao();
    }
}

setupCadastroFrasco();

// Prévia do identificador no cadastro: o formato é {sigla grupo}{sigla local}-{A001}
// (Frasco.gerarIdentificacao), mas o sequencial sai do ID do banco, que só existe
// depois de salvar — então mostra só o prefixo. As siglas vêm do data-sigla das <option>.
function setupPreviaIdentificadorFrasco() {
    const identificador = document.querySelector("#identificadorFrasco");
    const tipoDente = document.querySelector("#tipoDente");
    const localFrasco = document.querySelector("#localFrasco");
    const codigoInput = document.querySelector("input[name='codigo']");
    const isEdicao = codigoInput && codigoInput.value !== "" && codigoInput.value !== "null";

    if (!identificador || !tipoDente || !localFrasco || isEdicao) {
        return;
    }

    function siglaSelecionada(select) {
        const option = select.options[select.selectedIndex];
        return option && option.value ? (option.dataset.sigla || "") : "";
    }

    function atualizarPrevia() {
        const siglaGrupo = siglaSelecionada(tipoDente);

        if (!siglaGrupo) {
            identificador.textContent = "Gerado ao salvar";
            identificador.removeAttribute("title");
            return;
        }

        identificador.textContent = `${siglaGrupo}${siglaSelecionada(localFrasco)}-…`;
        identificador.title = "O número final é definido ao salvar";
    }

    tipoDente.addEventListener("change", atualizarPrevia);
    localFrasco.addEventListener("change", atualizarPrevia);
    atualizarPrevia();
}

setupPreviaIdentificadorFrasco();

function setupCadastroSolicitacao() {
    const grupoDentario = document.querySelector("#grupoDentario");
    const grupoEndoHint = document.querySelector("#grupoEndoHint");
    const quantidadeGroup = document.querySelector("#quantidadeGroup");
    const quantidadeInput = document.querySelector("#quantidade");
    const quantidadeMax = document.querySelector("#quantidadeMax");
    const quantidadeControls = document.querySelectorAll("#quantidadeGroup .quantidade-control");
    const avancadosSection = document.querySelector("#avancadosSection");
    const avancadosToggle = document.querySelector("#avancadosToggle");
    const advancedFields = document.querySelector("#advancedFields");
    const estadoDente = document.querySelector("#estadoDente");
    const denticaoGroup = document.querySelector("#denticaoGroup");
    const arcadaGroup = document.querySelector("#arcadaGroup");
    const denticaoSelect = document.querySelector("#denticao");
    const arcadaSelect = document.querySelector("#arcada");
    const numeracaoGroup = document.querySelector("#numeracaoGroup");
    const numeracaoSelect = document.querySelector("#numeracaoSelect");
    const numeracaoHint = document.querySelector("#numeracaoHint");
    const observacoesSection = document.querySelector("#observacoesSection");
    const observacoesField = document.querySelector("#observacoesSolicitacao");

    if (!grupoDentario || !quantidadeInput || !avancadosSection || !avancadosToggle || !advancedFields) {
        return;
    }

    const atributosControls = advancedFields.querySelectorAll(".atributos-control");

    const saldoDisponivel = Number(document.querySelector("#saldoDisponivel")?.dataset.saldo) || 0;
    quantidadeInput.max = saldoDisponivel || "";
    if (quantidadeMax) quantidadeMax.textContent = `/${saldoDisponivel}`;

    const originalDenticaoOptions = Array.from(denticaoSelect ? denticaoSelect.options : []).map(opt => ({
        value: opt.value,
        text: opt.textContent,
        selected: opt.selected
    }));

    function setDisabled(elements, disabled) {
        elements.forEach((el) => {
            el.disabled = disabled;
        });
    }

    function usaNumeracao() {
        const grupo = grupoDentario.value.toLowerCase();
        return grupo === "molar" || grupo === "premolar" || grupo === "pre_molar";
    }

    // NOVA FUNÇÃO: Valida tanto Endo quanto Siso
    function isEndoOuSiso() {
        const grupo = grupoDentario.value.toLowerCase();
        return grupo === "endo" || grupo === "siso";
    }

    function isPreMolar() {
        const grupo = grupoDentario.value.toLowerCase();
        return grupo === "premolar" || grupo === "pre_molar";
    }

    function atualizarVisibilidadeCamposAtributos() {
        const especial = isEndoOuSiso();
        const mostrarNumeracao = usaNumeracao();
        const grupo = grupoDentario.value.toLowerCase();
        const mostrarArcada = grupo === "canino" || grupo === "incisivo";

        if (arcadaGroup) arcadaGroup.hidden = !mostrarArcada;
        if (numeracaoGroup) numeracaoGroup.hidden = !mostrarNumeracao;

        if (denticaoSelect) {
            const currentVal = denticaoSelect.value;
            denticaoSelect.innerHTML = "";
            originalDenticaoOptions.forEach(optData => {
                if (isPreMolar() && optData.value.toLowerCase() === "decidua") {
                    return;
                }
                const opt = document.createElement("option");
                opt.value = optData.value;
                opt.textContent = optData.text;
                if (optData.value === currentVal) {
                    opt.selected = true;
                }
                denticaoSelect.appendChild(opt);
            });
            if (isPreMolar() && currentVal.toLowerCase() === "decidua") {
                denticaoSelect.value = "NAO_INFORMADA";
            }
        }
    }

    function popularOpcoesNumeracao() {
        if (!numeracaoSelect) return;

        let grupoKey = grupoDentario.value.toLowerCase().replace("-", "").replace("_", "");
        const denticao = denticaoSelect ? denticaoSelect.value.toLowerCase() : "";
        const opcoes = (NUMERACAO_POR_GRUPO_E_DENTICAO[grupoKey] || {})[denticao] || [];

        const valorAlvo = numeracaoSelect.value;

        numeracaoSelect.innerHTML = "";

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.selected = true;

        if (!denticao || denticao === "nao_informada") {
            placeholder.textContent = "- Selecione a Dentição -";
            numeracaoSelect.appendChild(placeholder);
            sincronizarDisabledNumeracao();
            return;
        }

        if (opcoes.length === 0) {
            placeholder.textContent = "Não disponível";
            numeracaoSelect.appendChild(placeholder);
            sincronizarDisabledNumeracao();
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

            if (value === String(valorAlvo)) {
                option.selected = true;
            }

            numeracaoSelect.appendChild(option);
        });

        sincronizarDisabledNumeracao();
        atualizarDicaNumeracao();
    }

    function sincronizarDisabledNumeracao() {
        if (!denticaoSelect || !numeracaoSelect) return;

        const avancadosAbertos = advancedFields.classList.contains("is-open");
        const temDenticaoEspecifica = denticaoSelect.value !== "" && denticaoSelect.value !== "NAO_INFORMADA";
        const temOpcoes = numeracaoSelect.querySelectorAll("option[value]:not([value=''])").length > 0;

        numeracaoSelect.disabled = !(avancadosAbertos && temDenticaoEspecifica && temOpcoes);
    }

    function atualizarDicaNumeracao() {
        if (!numeracaoSelect || !numeracaoHint) return;

        const opcaoSelecionada = numeracaoSelect.selectedOptions[0];
        const label = opcaoSelecionada ? opcaoSelecionada.dataset.label : undefined;
        numeracaoHint.textContent = label ? `(${label})` : "";
    }

    function fecharAvancados() {
        avancadosToggle.checked = false;
        advancedFields.classList.remove("is-open");
        setDisabled(atributosControls, true);
    }

    function abrirAvancados() {
        advancedFields.classList.add("is-open");
        setDisabled(atributosControls, false);
        atualizarVisibilidadeCamposAtributos();
        sincronizarDisabledNumeracao();
    }

    grupoDentario.addEventListener("change", () => {
        const hasGrupo = grupoDentario.value !== "";
        const especial = isEndoOuSiso();

        if (grupoEndoHint) grupoEndoHint.hidden = !especial;

        if (quantidadeGroup) quantidadeGroup.classList.toggle("form-group--disabled", !hasGrupo);
        quantidadeInput.disabled = !hasGrupo;
        setDisabled(quantidadeControls, !hasGrupo);

        if (observacoesSection) observacoesSection.classList.toggle("form-section--disabled", !hasGrupo);
        if (observacoesField) observacoesField.disabled = !hasGrupo;

        avancadosSection.classList.toggle("is-collapsed", especial);
        avancadosSection.classList.toggle("form-section--disabled", !hasGrupo);
        avancadosToggle.disabled = !hasGrupo || especial;

        if (!hasGrupo || especial) {
            fecharAvancados();
        }

        if (estadoDente) estadoDente.value = "";
        if (denticaoSelect) denticaoSelect.value = "NAO_INFORMADA";
        if (arcadaSelect) arcadaSelect.value = "NAO_INFORMADA";

        atualizarVisibilidadeCamposAtributos();
        popularOpcoesNumeracao();
        atualizarDicaNumeracao();
    });

    avancadosToggle.addEventListener("change", () => {
        if (avancadosToggle.checked) {
            abrirAvancados();
        } else {
            fecharAvancados();
        }
    });

    denticaoSelect?.addEventListener("change", () => {
        popularOpcoesNumeracao();
        sincronizarDisabledNumeracao();
        atualizarDicaNumeracao();
    });

    numeracaoSelect?.addEventListener("change", atualizarDicaNumeracao);

    atualizarVisibilidadeCamposAtributos();
    popularOpcoesNumeracao();
}

setupCadastroSolicitacao();

function setupCadastroSolicitacaoSubmit() {
    const form = document.querySelector("#cadastroSolicitacaoForm");
    const grupoDentario = document.querySelector("#grupoDentario");
    const quantidade = document.querySelector("#quantidade");
    const avancadosToggle = document.querySelector("#avancadosToggle");
    const estadoDente = document.querySelector("#estadoDente");
    const denticaoSelect = document.querySelector("#denticao");
    const arcadaSelect = document.querySelector("#arcada");
    const numeracaoGroup = document.querySelector("#numeracaoGroup");
    const numeracaoSelect = document.querySelector("#numeracaoSelect");
    const observacoesField = document.querySelector("#observacoesSolicitacao");

    if (!form || typeof Swal === "undefined") {
        return;
    }

    function textoSelecionado(select) {
        if (!select || select.value === "" || select.value === "NAO_INFORMADA") {
            return "Não especificado";
        }
        return select.selectedOptions[0]?.textContent.trim() || "Não especificado";
    }

    function montarResumoCadastro() {
        const saldoAtual = Number(document.querySelector("#saldoDisponivel")?.dataset.saldo) || 0;
        const qtdSolicitada = Number(quantidade?.value) || 0;
        const saldoDepois = Math.max(saldoAtual - qtdSolicitada, 0);

        const linhas = [
            ["Saldo disponível", `${saldoAtual} dentes`],
            ["Saldo após o pedido", `${saldoDepois} dentes`],
            ["Grupo dentário", textoSelecionado(grupoDentario)],
            ["Quantidade solicitada", `${qtdSolicitada} dentes`],
        ];

        if (avancadosToggle?.checked) {
            linhas.push(["Estado do dente", textoSelecionado(estadoDente)]);
            linhas.push(["Dentição", textoSelecionado(denticaoSelect)]);

            if (numeracaoGroup && !numeracaoGroup.hidden) {
                linhas.push(["Numeração", textoSelecionado(numeracaoSelect)]);
            } else {
                linhas.push(["Arcada", textoSelecionado(arcadaSelect)]);
            }
        }

        const linhasHtml = linhas
            .map(([label, valor]) => `<div class="swal-resumo__row"><span>${label}</span><strong>${valor}</strong></div>`)
            .join("");

        const obsTexto = (observacoesField?.value || "").trim() || "Não especificado";
        const obsHtml = `<div class="swal-resumo__obs"><span>Observações</span><p>${obsTexto}</p></div>`;

        return `<p>Revise os dados antes de confirmar:</p><div class="swal-resumo">${linhasHtml}${obsHtml}</div>`;
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

        const isSalvarEContinuar = event.submitter?.id === "salvarContinuarBtn";

        Swal.fire({
            icon: "question",
            title: "Confirmar solicitação?",
            html: montarResumoCadastro(),
            showCancelButton: true,
            reverseButtons: true,
            focusCancel: true,
            confirmButtonText: "Confirmar Solicitação",
            cancelButtonText: "Voltar",
            buttonsStyling: false,
            customClass: {
                confirmButton: "btn btn-primary",
                cancelButton: "btn btn-secondary",
            },
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }

            let inputCadastrarOutro = form.querySelector("input[name='cadastrarOutro']");
            if (!inputCadastrarOutro) {
                inputCadastrarOutro = document.createElement("input");
                inputCadastrarOutro.type = "hidden";
                inputCadastrarOutro.name = "cadastrarOutro";
                form.appendChild(inputCadastrarOutro);
            }
            inputCadastrarOutro.value = isSalvarEContinuar;

            HTMLFormElement.prototype.submit.call(form);
        });
    });
}

setupCadastroSolicitacaoSubmit();

function setupCadastroSolicitacaoCancel() {
    const form = document.querySelector("#cadastroSolicitacaoForm");
    const cancelarBtn = form?.closest(".form-shell")?.querySelector(".toolbar__actions a[href]");

    if (!cancelarBtn || typeof Swal === "undefined") {
        return;
    }

    cancelarBtn.addEventListener("click", (event) => {
        event.preventDefault();

        Swal.fire({
            icon: "warning",
            title: "Cancelar solicitação?",
            text: "Os dados preenchidos serão perdidos. Deseja voltar para o histórico de solicitações?",
            showCancelButton: true,
            reverseButtons: true,
            focusCancel: true,
            confirmButtonText: "Sim, cancelar",
            cancelButtonText: "Continuar",
            buttonsStyling: false,
            customClass: {
                confirmButton: "btn btn-outline btn-outline-danger",
                cancelButton: "btn btn-secondary",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = cancelarBtn.href;
            }
        });
    });
}

setupCadastroSolicitacaoCancel();

function setupCadastroFrascoSubmit() {
    const form = document.querySelector("#cadastroFrascoForm");
    const grupoDentario = document.querySelector("#tipoDente");
    const localFrasco = document.querySelector("#localFrasco");
    const estadoDente = document.querySelector("#estadoDente");
    const quantidade = document.querySelector("#quantidade");
    const denticaoGroup = document.querySelector("#denticaoGroup");
    const arcadaGroup = document.querySelector("#arcadaGroup");
    const denticaoSelect = document.querySelector("#denticao");
    const arcadaSelect = document.querySelector("#arcada");
    const numeracaoGroup = document.querySelector("#numeracaoGroup");
    const numeracaoSelect = document.querySelector("#numeracaoSelect");
    const dataCadastro = document.querySelector("#datCad");
    const dataManutencao = document.querySelector("#datManutencao");

    if (!form || typeof Swal === "undefined") {
        return;
    }

    function textoSelecionado(select) {
        if (!select || select.value === "") return "Não Informado";
        return select.selectedOptions[0]?.textContent.trim() || "Não Informado";
    }

    function formatarData(input) {
        if (!input?.value) return "Não Informado";
        const partes = input.value.split("-");
        if (partes.length < 3) return "Não Informado";

        const ano = partes[0];
        const mes = partes[1];
        const dia = partes[2].includes("T") ? partes[2].split("T")[0] : partes[2];

        return `${dia}/${mes}/${ano}`;
    }

    function montarResumoCadastro() {
        const linhas = [
            ["Grupo dentário", textoSelecionado(grupoDentario)],
            ["Local", textoSelecionado(localFrasco)],
            ["Estado do dente", textoSelecionado(estadoDente)],
            ["Quantidade", quantidade?.value || "1"],
        ];

        if (denticaoGroup && !denticaoGroup.hidden) {
            linhas.push(["Dentição", textoSelecionado(denticaoSelect)]);
        }

        if (arcadaGroup && !arcadaGroup.hidden) {
            linhas.push(["Arcada", textoSelecionado(arcadaSelect)]);
        }

        if (numeracaoGroup && !numeracaoGroup.hidden) {
            linhas.push(["Numeração", textoSelecionado(numeracaoSelect)]);
        }

        linhas.push(["Data de cadastro", formatarData(dataCadastro)]);
        linhas.push(["Data de manutenção", formatarData(dataManutencao)]);

        const linhasHtml = linhas
            .map(([label, valor]) => `<div class="swal-resumo__row"><span>${label}</span><strong>${valor}</strong></div>`)
            .join("");

        return `<p>Revise os dados antes de confirmar:</p><div class="swal-resumo">${linhasHtml}</div>`;
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

        const isSalvarEContinuar = event.submitter?.id === "salvarContinuarBtn";

        Swal.fire({
            icon: "question",
            title: "Confirmar cadastro?",
            html: montarResumoCadastro(),
            showCancelButton: true,
            reverseButtons: true,
            focusCancel: true,
            confirmButtonText: "Confirmar Cadastro",
            cancelButtonText: "Voltar",
            buttonsStyling: false,
            customClass: {
                confirmButton: "btn btn-primary",
                cancelButton: "btn btn-secondary",
            },
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }

            let inputCadastrarOutro = form.querySelector("input[name='cadastrarOutro']");
            if (!inputCadastrarOutro) {
                inputCadastrarOutro = document.createElement("input");
                inputCadastrarOutro.type = "hidden";
                inputCadastrarOutro.name = "cadastrarOutro";
                form.appendChild(inputCadastrarOutro);
            }
            inputCadastrarOutro.value = isSalvarEContinuar;

            HTMLFormElement.prototype.submit.call(form);
        });
    });
}

setupCadastroFrascoSubmit();

function setupCadastroFrascoCancel() {
    const form = document.querySelector("#cadastroFrascoForm");
    const cancelarBtn = form?.closest(".form-shell")?.querySelector(".toolbar__actions a[href]");

    if (!cancelarBtn || typeof Swal === "undefined") {
        return;
    }

    cancelarBtn.addEventListener("click", (event) => {
        event.preventDefault();

        Swal.fire({
            icon: "warning",
            title: "Cancelar cadastro?",
            text: "Os dados preenchidos serão perdidos. Deseja voltar para o painel de frascos?",
            showCancelButton: true,
            reverseButtons: true,
            focusCancel: true,
            confirmButtonText: "Sim, cancelar",
            cancelButtonText: "Continuar",
            buttonsStyling: false,
            customClass: {
                confirmButton: "btn btn-outline btn-outline-danger",
                cancelButton: "btn btn-secondary",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = cancelarBtn.href;
            }
        });
    });
}

setupCadastroFrascoCancel();

function setupCadastroMovimentacao() {
    const tipoSelect = document.querySelector("#tipoMovimentacao");
    const escolherFrascosBtn = document.querySelector("#escolherFrascosBtn");
    const escolherFrascosLabel = escolherFrascosBtn?.querySelector(".btn__label");
    const sectionTitle = document.querySelector("#frascosSectionTitle");
    const frascosLabel = document.querySelector("#frascosLabel");
    const emptyText = document.querySelector("#selectedFlasksEmptyText");

    if (!tipoSelect || !escolherFrascosBtn) {
        return;
    }

    // Roda no "change" e também uma vez na carga: o Tipo já vem com um
    // valor padrão (Saída), então o botão/título/estado vazio precisam
    // refletir isso sem esperar o usuário mexer no select.
    function aplicarTipo() {
        const semTipo = tipoSelect.value === "";
        const entrada = tipoSelect.value.toLowerCase() === "entrada";

        escolherFrascosBtn.disabled = semTipo;

        // Singular só em Entrada (o modal de lá só deixa escolher um
        // frasco de destino — ver modal_busca_frasco_movimentacao_entrada.html/
        // setupFrascoSearchModal em frasco-search-movimentacao.js); Saída
        // mantém o plural de sempre. O título deixa claro que, em Entrada,
        // esse frasco é o que vai RECEBER os dentes.
        if (escolherFrascosLabel) {
            escolherFrascosLabel.textContent = entrada ? "Escolher Frasco" : "Escolher Frascos";
        }

        if (sectionTitle) {
            sectionTitle.textContent = entrada ? "Frasco de Destino" : "Frascos Selecionados";
        }

        // Rótulo do cabeçalho do cartão: só o texto antes do asterisco
        if (frascosLabel?.firstChild) {
            frascosLabel.firstChild.textContent = entrada ? "Frasco " : "Frascos ";
        }

        if (emptyText) {
            emptyText.textContent = semTipo
                ? "Escolha o tipo de movimentação para começar."
                : entrada
                    ? "Nenhum frasco de destino selecionado ainda."
                    : "Nenhum frasco selecionado ainda.";
        }
    }

    tipoSelect.addEventListener("change", aplicarTipo);
    aplicarTipo();
}

setupCadastroMovimentacao();

// Contador "0/250" no canto do
// textarea de Observações — reflete o próprio maxlength do HTML, só exibe
// o que o navegador já reforça. Varre todo ".textarea-counter" da página
// (não ids fixos) porque mais de uma página tem seu próprio campo de
// Observações — cada contador liga no ".textarea-control" logo antes dele
// no HTML (ver marcação em cadastro_movimentacao.html/cadastro_solicitacao.html).
function setupObservacoesCounter() {
    const counters = document.querySelectorAll(".textarea-counter");

    counters.forEach((counter) => {
        const field = counter.previousElementSibling;

        if (!field || !field.classList.contains("textarea-control")) {
            return;
        }

        function atualizar() {
            counter.textContent = `${field.value.length}/${field.maxLength}`;
        }

        field.addEventListener("input", atualizar);
        atualizar();
    });
}

setupObservacoesCounter();

// "Salvar e Continuar"/"Salvar e Sair" ficam na toolbar, fora do <form>
// (ver form="cadastroMovimentacaoForm" em cadastro_movimentacao.html) —
// mesmo esquema de setupCadastroFrascoSubmit acima. A seleção de frascos
// não é um <input> nativo (vive num Map dentro de setupFrascoSearchModal,
// em frasco-search-movimentacao.js), então checkValidity() sozinho não
// pega "nenhum frasco escolhido" — por isso o frascosSelecionados() abaixo
// checa à parte, lendo direto da lista "Frascos selecionados" já
// renderizada no DOM (ver renderSelecionados/criarLinhaSelecionada
// naquele arquivo).
function setupCadastroMovimentacaoSubmit() {
    const form = document.querySelector("#cadastroMovimentacaoForm");
    const localSelect = document.querySelector("#localMovimentacao");
    const tipoSelect = document.querySelector("#tipoMovimentacao");
    const observacoesField = document.querySelector("#observacoesMovimentacao");
    const selectedFlasksList = document.querySelector("#selectedFlasksList");
    const origemDentesSelect = document.querySelector("#origemDentes");
    const quantidadeDoacaoInput = document.querySelector("#quantidadeDoacao");
    const origemFrascosList = document.querySelector("#origemFrascosList");

    if (!form || typeof Swal === "undefined") {
        return;
    }

    function textoSelecionado(select) {
        if (!select || select.value === "") return "Não Informado";
        return select.selectedOptions[0]?.textContent.trim() || "Não Informado";
    }

    function frascosSelecionados() {
        return Array.from(selectedFlasksList?.querySelectorAll(".request-row") || []).map((row) => {
            const spans = row.querySelectorAll(".selected-flask > span");
            return {
                id: row.dataset.frascoId || spans[0]?.textContent.trim() || "---",
                quantidade: spans[1] ? Number(spans[1].textContent.trim()) || 0 : null,
            };
        });
    }

    function frascosDeOrigem() {
        return Array.from(origemFrascosList?.querySelectorAll(".request-row") || []).map((row) => ({
            id: row.dataset.frascoId,
            quantidade: Number(row.querySelectorAll(".selected-flask > span")[1]?.textContent) || 0,
        }));
    }

    function escaparHtml(texto) {
        return String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    }

    // Helpers de frasco-search-movimentacao.js (mesma página)
    const qtdDentes = (n) => (typeof formatarQtdDentes === "function" ? formatarQtdDentes(n) : `${n} dentes`);

    function linhaResumo(label, valor) {
        return `<div class="swal-resumo__row"><span>${label}</span><strong>${valor}</strong></div>`;
    }

    // Frasco + saldo antes -> depois; meta (grupo/estado...) vem do catálogo carregado pelos modais
    function linhaFrascoResumo(id, delta) {
        const frasco = (window.catalogoFrascosCache || []).find((f) => f.id === id);
        const meta = frasco && typeof formatarMeta === "function"
            ? [frasco.grupo && rotuloAtributoFrasco(frasco.grupo), formatarMeta(frasco)].filter(Boolean).join(" · ")
            : "";
        const sinal = delta >= 0 ? "+" : "−";
        const saldo = frasco ? `<small>${frasco.disponivel} → ${Math.max(frasco.disponivel + delta, 0)}</small>` : "";

        return `<div class="swal-resumo__row swal-resumo__row--frasco">
                    <span>${escaparHtml(id)}${meta ? `<small>${meta}</small>` : ""}</span>
                    <strong>${sinal}${Math.abs(delta)}${saldo}</strong>
                </div>`;
    }

    function grupoResumo(titulo, conteudo) {
        return `<div class="swal-resumo__grupo"><span class="swal-resumo__grupo-titulo">${titulo}</span>${conteudo}</div>`;
    }

    // Fechado por padrão: o resumo vai no cabeçalho, o detalhamento abre no clique
    // (sem isso, a Entrada empurrava o botão de confirmar pra fora da tela)
    // Abre/fecha em ligarGruposExpansiveis (didOpen do Swal)
    function grupoExpansivel(titulo, resumo, conteudo) {
        return `<div class="swal-resumo__grupo swal-resumo__grupo--expansivel">
                    <button type="button" class="swal-resumo__grupo-toggle" aria-expanded="false">
                        <span class="swal-resumo__grupo-titulo">${titulo}</span>
                        <strong>${resumo}</strong>
                    </button>
                    <div class="swal-resumo__grupo-conteudo">
                        <div class="swal-resumo__grupo-conteudo-inner">${conteudo}</div>
                    </div>
                </div>`;
    }

    function ligarGruposExpansiveis(popup) {
        popup.querySelectorAll(".swal-resumo__grupo-toggle").forEach((btn) => {
            btn.addEventListener("click", () => {
                const aberto = btn.parentElement.classList.toggle("is-open");
                btn.setAttribute("aria-expanded", String(aberto));
            });
        });
    }

    function montarResumoMovimentacao(frascos) {
        const entrada = tipoSelect?.value?.toUpperCase() === "ENTRADA";
        let html = linhaResumo("Local", textoSelecionado(localSelect)) + linhaResumo("Tipo", textoSelecionado(tipoSelect));

        if (entrada) {
            const origem = origemDentesSelect?.value;
            const origens = origem === "frascos" ? frascosDeOrigem() : [];
            const recebidos = origem === "doacao"
                ? Number(quantidadeDoacaoInput?.value) || 0
                : origens.reduce((soma, f) => soma + f.quantidade, 0);

            html += grupoExpansivel(
                "Frasco de destino",
                `${frascos.map(({ id }) => escaparHtml(id)).join(", ")} · +${recebidos}`,
                frascos.map(({ id }) => linhaFrascoResumo(id, recebidos)).join("")
            );

            let origemHtml = "";
            if (origem === "doacao") {
                origemHtml = linhaResumo("Quantidade adicionada", qtdDentes(recebidos));
            } else if (origem === "frascos") {
                origemHtml = origens.map(({ id, quantidade }) => linhaFrascoResumo(id, -quantidade)).join("")
                    + linhaResumo("Total transferido", qtdDentes(recebidos));
            }
            html += grupoExpansivel(
                "Origem dos dentes",
                `${textoSelecionado(origemDentesSelect)} · ${qtdDentes(recebidos)}`,
                origemHtml
            );
        } else {
            const total = frascos.reduce((soma, f) => soma + (f.quantidade || 0), 0);
            const linhas = frascos.map(({ id, quantidade }) => linhaFrascoResumo(id, -(quantidade || 0))).join("")
                + linhaResumo("Total retirado", qtdDentes(total));

            html += frascos.length >= 2
                ? grupoExpansivel("Frascos de saída", `${frascos.length} frascos · ${qtdDentes(total)}`, linhas)
                : grupoResumo("Frascos de saída", linhas);
        }

        const obsTexto = escaparHtml((observacoesField?.value || "").trim() || "Não Informado");
        const obsHtml = `<div class="swal-resumo__obs"><span>Observações</span><p>${obsTexto}</p></div>`;

        return `<p>Revise os dados antes de confirmar:</p><div class="swal-resumo">${html}${obsHtml}</div>`;
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

        const frascos = frascosSelecionados();

        if (frascos.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Preenchimento incompleto",
                text: "Selecione ao menos um frasco antes de salvar.",
                confirmButtonText: "Entendi",
                buttonsStyling: false,
                customClass: {
                    confirmButton: "btn btn-primary",
                },
            });
            return;
        }

        if (tipoSelect?.value === "entrada" && origemDentesSelect?.value === "frascos" && !origemFrascosList?.querySelector(".request-row")) {
            Swal.fire({
                icon: "warning",
                title: "Preenchimento incompleto",
                text: "Selecione ao menos um frasco de origem antes de salvar.",
                confirmButtonText: "Entendi",
                buttonsStyling: false,
                customClass: {
                    confirmButton: "btn btn-primary",
                },
            });
            return;
        }

        const isSalvarEContinuar = event.submitter?.id === "salvarContinuarBtn";

        Swal.fire({
            icon: "question",
            title: "Confirmar movimentação?",
            html: montarResumoMovimentacao(frascos),
            width: "34rem",
            didOpen: ligarGruposExpansiveis,
            showCancelButton: true,
            reverseButtons: true,
            focusCancel: true,
            confirmButtonText: "Confirmar Movimentação",
            cancelButtonText: "Voltar",
            buttonsStyling: false,
            customClass: {
                confirmButton: "btn btn-primary",
                cancelButton: "btn btn-secondary",
            },
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }

            let inputCadastrarOutro = form.querySelector("input[name='cadastrarOutro']");
            if (!inputCadastrarOutro) {
                inputCadastrarOutro = document.createElement("input");
                inputCadastrarOutro.type = "hidden";
                inputCadastrarOutro.name = "cadastrarOutro";
                form.appendChild(inputCadastrarOutro);
            }
            inputCadastrarOutro.value = isSalvarEContinuar;

            HTMLFormElement.prototype.submit.call(form);
        });
    });
}

setupCadastroMovimentacaoSubmit();

// "Cancelar" (link pro painel de movimentações) — mesma confirmação de
// setupCadastroFrascoCancel, só que ancorada em #cadastroMovimentacaoForm.
function setupCadastroMovimentacaoCancel() {
    const form = document.querySelector("#cadastroMovimentacaoForm");
    const cancelarBtn = form?.closest(".form-shell")?.querySelector(".toolbar__actions a[href]");

    if (!cancelarBtn || typeof Swal === "undefined") {
        return;
    }

    cancelarBtn.addEventListener("click", (event) => {
        event.preventDefault();

        Swal.fire({
            icon: "warning",
            title: "Cancelar cadastro?",
            text: "Os dados preenchidos serão perdidos. Deseja voltar para o painel de movimentações?",
            showCancelButton: true,
            reverseButtons: true,
            focusCancel: true,
            confirmButtonText: "Sim, cancelar",
            cancelButtonText: "Continuar",
            buttonsStyling: false,
            customClass: {
                confirmButton: "btn btn-outline btn-outline-danger",
                cancelButton: "btn btn-secondary",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = cancelarBtn.href;
            }
        });
    });
}

setupCadastroMovimentacaoCancel();

// botoes +/- quantidade

function setupNumberInputs() {
    const numberInputs = document.querySelectorAll(".number-input");

    numberInputs.forEach((numberInput) => {
        // Chamada de novo toda vez que um modal de busca re-renderiza
        // (abrir, digitar na busca, trocar filtro/página — ver
        // renderResultados em frasco-search-movimentacao.js/
        // frasco-search-solicitacao.js), pra religar as linhas novas que
        // acabaram de entrar no DOM. Sem essa trava, um .number-input que
        // sobrevive entre re-renders (ex.: #quantidadeDoacao em
        // cadastro_movimentacao.html, fora do modal) ganhava mais um par
        // de listeners pointerdown a cada chamada — depois de algumas
        // buscas, um clique só em +/- disparava changeQuantity() várias
        // vezes de uma vez (o valor pulava de mais de 1 em 1).
        if (numberInput.dataset.numberWired === "true") {
            return;
        }

        const input = numberInput.querySelector(".number-input__field");
        const decreaseBtn = numberInput.querySelector("[data-number-action='down']");
        const increaseBtn = numberInput.querySelector("[data-number-action='up']");

        if (!input || !decreaseBtn || !increaseBtn) {
            return;
        }

        numberInput.dataset.numberWired = "true";

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

function setupSincronizacaoDatas() {
    const datCad = document.querySelector("#datCad");
    const datManutencao = document.querySelector("#datManutencao");

    if (!datCad || !datManutencao) {
        return;
    }

    datCad.addEventListener("change", () => {
        if (datCad.value) {
            const [ano, mes, dia] = datCad.value.split("-").map(Number);
            const ultimoDia = new Date(ano + 1, mes, 0).getDate();
            const diaAjustado = String(Math.min(dia, ultimoDia)).padStart(2, "0");
            datManutencao.value = `${ano + 1}-${String(mes).padStart(2, "0")}-${diaAjustado}`;
        } else {
            datManutencao.value = "";
        }
    });
}

setupSincronizacaoDatas();

// Setas ao lado do formulário (.form-scroll-nav): pulam entre o topo da página
// e as seções de data-paradas, descontando a toolbar sticky. Seções escondidas
// (hidden) ficam de fora — ex.: sem Entrada, a próxima parada é Observações.
function setupNavegacaoSecoes() {
    const nav = document.querySelector(".form-scroll-nav");
    if (!nav) return;

    const btnAcima = nav.querySelector("[data-scroll-nav='up']");
    const btnAbaixo = nav.querySelector("[data-scroll-nav='down']");
    const toolbar = document.querySelector(".toolbar");
    const seletores = (nav.dataset.paradas || "").split(",").map(sel => sel.trim()).filter(Boolean);
    const FOLGA = 16;
    const TOLERANCIA = 4;

    function alturaToolbar() {
        if (!toolbar) return FOLGA;
        return (parseFloat(getComputedStyle(toolbar).top) || 0) + toolbar.offsetHeight + FOLGA;
    }

    function paradas() {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const ys = seletores
            .map(sel => document.querySelector(sel))
            .filter(el => el && el.offsetParent !== null)
            .map(el => el.getBoundingClientRect().top + window.scrollY - alturaToolbar())
            .map(y => Math.round(Math.min(Math.max(y, 0), maxScroll)));

        return [...new Set([0, ...ys])].sort((a, b) => a - b);
    }

    function proximas() {
        const y = window.scrollY;
        const lista = paradas();
        return {
            acima: [...lista].reverse().find(p => p < y - TOLERANCIA),
            abaixo: lista.find(p => p > y + TOLERANCIA)
        };
    }

    function atualizar() {
        const { acima, abaixo } = proximas();
        btnAcima.disabled = acima === undefined;
        btnAbaixo.disabled = abaixo === undefined;
    }

    btnAcima.addEventListener("click", () => {
        const { acima } = proximas();
        if (acima !== undefined) window.scrollTo({ top: acima, behavior: "smooth" });
    });

    btnAbaixo.addEventListener("click", () => {
        const { abaixo } = proximas();
        if (abaixo !== undefined) window.scrollTo({ top: abaixo, behavior: "smooth" });
    });

    let agendado = false;
    function agendarAtualizacao() {
        if (agendado) return;
        agendado = true;
        requestAnimationFrame(() => {
            agendado = false;
            atualizar();
        });
    }

    window.addEventListener("scroll", agendarAtualizacao, { passive: true });
    window.addEventListener("resize", agendarAtualizacao);
    // Seções que aparecem/somem mudam a altura do form
    new ResizeObserver(agendarAtualizacao).observe(document.querySelector(".form-card") || document.body);

    atualizar();
}

setupNavegacaoSecoes();

// Encerra a entrada animada dos cadastros (cadastro_frasco.css)
setTimeout(() => document.documentElement.classList.add("form-pronto"), 1500);
