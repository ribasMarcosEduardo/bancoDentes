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

// Controla a lógica de exibição, bloqueio e interatividade da tela de cadastro de frascos
function setupCadastroFrasco() {
    const tipoDente = document.querySelector("#tipoDente");
    const estadoFrascoSection = document.querySelector("#estadoFrascoSection");
    const estadoDente = document.querySelector("#estadoDente");
    const quantidadeGroup = document.querySelector("#quantidadeGroup");
    const quantidadeInput = document.querySelector("#quantidade");
    const quantidadeControls = document.querySelectorAll(".quantidade-control");
    const atributosFrascoSection = document.querySelector("#atributosFrascoSection");
    const denticaoGroup = document.querySelector("#denticaoGroup");
    const arcadaGroup = document.querySelector("#arcadaGroup");

    const denticaoSelect = document.querySelector("#denticao");
    const arcadaSelect = document.querySelector("#arcada");

    const posicaoContainer = document.querySelector("#posicaoContainer");
    const molarCheckboxes = document.querySelector("#molarCheckboxes");
    const preMolarCheckboxes = document.querySelector("#preMolarCheckboxes");

    if (!tipoDente || !estadoFrascoSection || !estadoDente || !quantidadeInput || !atributosFrascoSection) {
        return;
    }

    const atributosControls = atributosFrascoSection.querySelectorAll(".atributos-control");

    // Remove a classe visual de desabilitado de uma seção do formulário
    function enableSection(section) {
        section.classList.remove("form-section--disabled");
    }

    // Adiciona a classe visual de desabilitado em uma seção do formulário
    function disableSection(section) {
        section.classList.add("form-section--disabled");
    }

    // Altera o estado de desabilitado de uma lista de elementos HTML
    function setDisabled(elements, disabled) {
        elements.forEach((el) => {
            el.disabled = disabled;
        });
    }

    // Retorna o valor do tipo de dente selecionado convertido em letras maiúsculas
    function getGrupo() {
        return tipoDente.value.toUpperCase();
    }

    // Verifica se o grupo dentário selecionado é Endodontia (ENDO)
    function isEndo() {
        return getGrupo() === "ENDO";
    }

    // Gerencia quais campos e blocos de numeração/atributos devem aparecer conforme o tipo de dente
    function atualizarVisibilidadeCamposAtributos() {
        const endo = isEndo();
        const grupo = getGrupo();
        const isMolar = grupo === "MOLAR";
        const isPreMolar = grupo === "PRE_MOLAR";
        const mostrarNumeracao = isMolar || isPreMolar;

        if (denticaoGroup) denticaoGroup.hidden = endo;
        if (arcadaGroup) arcadaGroup.hidden = endo || mostrarNumeracao;

        if (posicaoContainer) {
            if (endo || !mostrarNumeracao) {
                posicaoContainer.style.display = "none";
            } else {
                posicaoContainer.style.display = "block";
                if (molarCheckboxes) molarCheckboxes.style.display = isMolar ? "flex" : "none";
                if (preMolarCheckboxes) preMolarCheckboxes.style.display = isPreMolar ? "flex" : "none";
            }
        }
    }

    // Libera ou bloqueia a quantidade e os atributos dependendo se o estado do dente foi preenchido
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
    }

    tipoDente.addEventListener("change", () => {
        const hasGrupo = tipoDente.value !== "";

        if (hasGrupo) {
            enableSection(estadoFrascoSection);
        } else {
            disableSection(estadoFrascoSection);
        }

        estadoDente.disabled = !hasGrupo;
        estadoDente.value = "";

        if (denticaoSelect) denticaoSelect.value = "";
        if (arcadaSelect) arcadaSelect.value = "";

        if (posicaoContainer) {
            posicaoContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        }

        atualizarVisibilidadeCamposAtributos();
        aplicarEstadoSelecionado();
    });

    estadoDente.addEventListener("change", aplicarEstadoSelecionado);

    atualizarVisibilidadeCamposAtributos();
    aplicarEstadoSelecionado();
}

setupCadastroFrasco();

// Controla a interatividade e as regras dinâmicas da tela de cadastro de solicitações
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
    const denticaoSelect = document.querySelector("#denticaoSelect");
    const arcadaGroup = document.querySelector("#arcadaGroup");
    const arcadaSelect = document.querySelector("#arcadaSelect");
    const numeracaoGroup = document.querySelector("#numeracaoGroup");
    const numeracaoSelect = document.querySelector("#numeracaoSelect");
    const numeracaoHint = document.querySelector("#numeracaoHint");
    const observacoesSection = document.querySelector("#observacoesSection");
    const observacoesField = document.querySelector("#observacoesSolicitacao");

    if (!grupoDentario || !quantidadeInput || !avancadosSection || !avancadosToggle || !advancedFields) {
        return;
    }

    const atributosControls = advancedFields.querySelectorAll(".atributos-control");

    const saldoDisponivel = Number(document.querySelector(".toolbar__badge")?.textContent.trim()) || 0;
    quantidadeInput.max = saldoDisponivel || "";
    if (quantidadeMax) quantidadeMax.textContent = `/${saldoDisponivel}`;

    // Verifica se o grupo selecionado na solicitação utiliza numeração de dentes
    function usaNumeracao() {
        return grupoDentario.value === "molar" || grupoDentario.value === "premolar";
    }

    // Verifica se o grupo selecionado na solicitação é endodontia
    function isEndo() {
        return grupoDentario.value === "endo";
    }

    // Atualiza quais campos avançados aparecem com base no grupo selecionado
    function atualizarVisibilidadeCamposAtributos() {
        const mostrarNumeracao = usaNumeracao();

        if (arcadaGroup) arcadaGroup.hidden = mostrarNumeracao;
        if (numeracaoGroup) numeracaoGroup.hidden = !mostrarNumeracao;
    }

    // Sincroniza se o select de numeração deve estar habilitado ou não na solicitação
    function sincronizarDisabledNumeracao() {
        if (!denticaoSelect || !numeracaoSelect) return;

        const avancadosAbertos = advancedFields.classList.contains("is-open");
        const temDenticaoEspecifica = denticaoSelect.value !== "" && denticaoSelect.value !== "nao_especificado";
        const temOpcoes = numeracaoSelect.querySelectorAll("option[value]:not([value=''])").length > 0;

        numeracaoSelect.disabled = !(avancadosAbertos && temDenticaoEspecifica && temOpcoes);
    }

    // Popula dinamicamente as opções do select de numeração com base na dentição
    function popularOpcoesNumeracao() {
        if (!denticaoSelect || !numeracaoSelect) return;

        const denticao = denticaoSelect.value;
        const semDenticaoEspecifica = denticao === "" || denticao === "nao_especificado";
        const opcoes = semDenticaoEspecifica ? [] : (NUMERACAO_POR_GRUPO_E_DENTICAO[grupoDentario.value] || {})[denticao] || [];

        numeracaoSelect.innerHTML = "";

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.selected = true;

        if (semDenticaoEspecifica) {
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
            numeracaoSelect.appendChild(option);
        });

        sincronizarDisabledNumeracao();
    }

    // Atualiza a dica textual descritiva da numeração selecionada
    function atualizarDicaNumeracao() {
        if (!numeracaoSelect || !numeracaoHint) return;

        const opcaoSelecionada = numeracaoSelect.selectedOptions[0];
        const label = opcaoSelecionada ? opcaoSelecionada.dataset.label : undefined;
        numeracaoHint.textContent = label ? `(${label})` : "";
    }

    // Altera o estado disabled de um conjunto de elementos fornecidos
    function setDisabled(elements, disabled) {
        elements.forEach((el) => {
            el.disabled = disabled;
        });
    }

    // Fecha e desabilita a seção de campos avançados
    function fecharAvancados() {
        avancadosToggle.checked = false;
        advancedFields.classList.remove("is-open");
        setDisabled(atributosControls, true);
    }

    // Abre e habilita a seção de campos avançados
    function abrirAvancados() {
        advancedFields.classList.add("is-open");
        setDisabled(atributosControls, false);
        atualizarVisibilidadeCamposAtributos();
        sincronizarDisabledNumeracao();
    }

    grupoDentario.addEventListener("change", () => {
        const hasGrupo = grupoDentario.value !== "";
        const endo = isEndo();

        if (grupoEndoHint) grupoEndoHint.hidden = !endo;

        if (quantidadeGroup) quantidadeGroup.classList.toggle("form-group--disabled", !hasGrupo);
        quantidadeInput.disabled = !hasGrupo;
        setDisabled(quantidadeControls, !hasGrupo);

        if (observacoesSection) observacoesSection.classList.toggle("form-section--disabled", !hasGrupo);
        if (observacoesField) observacoesField.disabled = !hasGrupo;

        avancadosSection.classList.toggle("is-collapsed", endo);
        avancadosSection.classList.toggle("form-section--disabled", !hasGrupo);
        avancadosToggle.disabled = !hasGrupo || endo;

        if (!hasGrupo || endo) {
            fecharAvancados();
        }

        if (estadoDente) estadoDente.value = "nao_especificado";
        if (denticaoSelect) denticaoSelect.value = "nao_especificado";
        if (arcadaSelect) arcadaSelect.value = "nao_especificado";

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
        atualizarDicaNumeracao();
    });

    numeracaoSelect?.addEventListener("change", atualizarDicaNumeracao);

    atualizarVisibilidadeCamposAtributos();
    popularOpcoesNumeracao();
}

setupCadastroSolicitacao();

// Intercepta o envio do formulário de solicitação para validar campos e exibir o resumo de confirmação
function setupCadastroSolicitacaoSubmit() {
    const form = document.querySelector("#cadastroSolicitacaoForm");
    const grupoDentario = document.querySelector("#grupoDentario");
    const quantidade = document.querySelector("#quantidade");
    const avancadosToggle = document.querySelector("#avancadosToggle");
    const estadoDente = document.querySelector("#estadoDente");
    const denticaoSelect = document.querySelector("#denticaoSelect");
    const arcadaSelect = document.querySelector("#arcadaSelect");
    const numeracaoGroup = document.querySelector("#numeracaoGroup");
    const numeracaoSelect = document.querySelector("#numeracaoSelect");
    const observacoesField = document.querySelector("#observacoesSolicitacao");

    if (!form || typeof Swal === "undefined") {
        return;
    }

    // Retorna o texto formatado da opção selecionada em um select
    function textoSelecionado(select) {
        if (!select || select.value === "" || select.value === "nao_especificado") {
            return "Não especificado";
        }
        return select.selectedOptions[0]?.textContent.trim() || "Não especificado";
    }

    // Monta o HTML com o resumo detalhado dos dados informados para exibir no modal
    function montarResumoCadastro() {
        const saldoAtual = Number(document.querySelector(".toolbar__badge")?.textContent.trim()) || 0;
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

        const continuar = event.submitter?.id === "salvarContinuarBtn";

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

            const codigo = "SOL-0043";
            const mensagem = `Solicitação <strong>${codigo}</strong> cadastrada com sucesso.`;

            if (continuar) {
                form.reset();
                grupoDentario?.dispatchEvent(new Event("change"));
                observacoesField?.dispatchEvent(new Event("input"));
                showToast(mensagem);
            } else {
                sessionStorage.setItem(FLASH_TOAST_KEY, mensagem);
                window.location.href = "historico_solicitacoes.html";
            }
        });
    });
}

setupCadastroSolicitacaoSubmit();

// Intercepta o clique no botão de cancelar na tela de solicitações exibindo confirmação via modal
function setupCadastroSolicitacaoCancel() {
    const form = document.querySelector("#cadastroSolicitacaoForm");
    const cancelarBtn = form?.closest(".form-shell")?.querySelector(".toolbar__actions a.btn-secondary");

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
            cancelButtonText: "Continuar solicitação",
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

// Intercepta o envio do formulário de cadastro de frasco para validação e exibição do resumo de confirmação
function setupCadastroFrascoSubmit() {
    const form = document.querySelector("#cadastroFrascoForm");
    const grupoDentario = document.querySelector("#tipoDente");
    const localFrasco = document.querySelector("#localFrasco");
    const estadoDente = document.querySelector("#estadoDente");
    const quantidade = document.querySelector("#quantidade");
    const denticaoGroup = document.querySelector("#denticaoGroup");
    const denticaoSelect = document.querySelector("#denticao");
    const arcadaGroup = document.querySelector("#arcadaGroup");
    const arcadaSelect = document.querySelector("#arcada");
    const posicaoContainer = document.querySelector("#posicaoContainer");
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

        if (posicaoContainer && posicaoContainer.style.display !== "none") {
            const checkboxesSelecionados = Array.from(posicaoContainer.querySelectorAll('input[type="checkbox"]:checked'));
            if (checkboxesSelecionados.length > 0) {
                const posicoes = checkboxesSelecionados.map(cb => cb.nextElementSibling.textContent.trim()).join(", ");
                linhas.push(["Numeração", posicoes]);
            } else {
                linhas.push(["Numeração", "Não Informado"]);
            }
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

// Intercepta o clique no botão de cancelar no cadastro de frascos exibindo um alerta de confirmação
function setupCadastroFrascoCancel() {
    const form = document.querySelector("#cadastroFrascoForm");
    const cancelarBtn = form?.closest(".form-shell")?.querySelector(".toolbar__actions a.btn-secondary");

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
            cancelButtonText: "Continuar cadastro",
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

setupCadastroFrascoSubmit();
setupCadastroFrascoCancel();

// Gerencia o fluxo de etapas dependentes (local e tipo) na tela de cadastro de movimentações
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

    function aplicarTipoSelecionado() {
        escolherFrascosBtn.disabled = tipoSelect.value === "";
    }

    function aplicarLocalSelecionado() {
        const local = localSelect.value;
        const hasLocal = local !== "";
        const isBiobanco = local === "biobanco";

        tipoSection.classList.toggle("form-section--disabled", !hasLocal);

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

// Atualiza em tempo real o contador de caracteres visíveis para campos de texto livre (textarea)
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

// Gerencia a validação, montagem de resumo e submissão da tela de cadastro de movimentações
function setupCadastroMovimentacaoSubmit() {
    const form = document.querySelector("#cadastroMovimentacaoForm");
    const localSelect = document.querySelector("#localMovimentacao");
    const tipoSelect = document.querySelector("#tipoMovimentacao");
    const observacoesField = document.querySelector("#observacoesMovimentacao");
    const selectedFlasksList = document.querySelector(".selected-flasks");

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
                id: row.dataset.frascoId || spans[0]?.textContent.trim() || "—",
                quantidade: spans[1]?.textContent.trim() || "0",
            };
        });
    }

    function montarResumoMovimentacao(frascos) {
        const linhasHtml = [
            ["Local", textoSelecionado(localSelect)],
            ["Tipo", textoSelecionado(tipoSelect)],
        ]
            .map(([label, valor]) => `<div class="swal-resumo__row"><span>${label}</span><strong>${valor}</strong></div>`)
            .join("");

        const frascosHtml = frascos
            .map(({ id, quantidade }) => `<div class="swal-resumo__row"><span>${id}</span><strong>${quantidade} un.</strong></div>`)
            .join("");

        const obsTexto = (observacoesField?.value || "").trim() || "Não Informado";
        const obsHtml = `<div class="swal-resumo__obs"><span>Observações</span><p>${obsTexto}</p></div>`;

        return `<p>Revise os dados antes de confirmar:</p><div class="swal-resumo">${linhasHtml}${frascosHtml}${obsHtml}</div>`;
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

        const continuar = event.submitter?.id === "salvarContinuarBtn";

        Swal.fire({
            icon: "question",
            title: "Confirmar movimentação?",
            html: montarResumoMovimentacao(frascos),
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

            const mensagem = "Movimentação cadastrada com sucesso.";

            if (continuar) {
                form.reset();
                localSelect?.dispatchEvent(new Event("change"));
                observacoesField?.dispatchEvent(new Event("input"));
                showToast(mensagem);
            } else {
                sessionStorage.setItem(FLASH_TOAST_KEY, mensagem);
                window.location.href = "movimentacoes.html";
            }
        });
    });
}

setupCadastroMovimentacaoSubmit();

// Intercepta o clique de cancelamento no cadastro de movimentações exibindo alerta de confirmação
function setupCadastroMovimentacaoCancel() {
    const form = document.querySelector("#cadastroMovimentacaoForm");
    const cancelarBtn = form?.closest(".form-shell")?.querySelector(".toolbar__actions a.btn-secondary");

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
            cancelButtonText: "Continuar cadastro",
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

// Configura o comportamento interativo dos botões de incremento e decremento numérico de quantidade
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

// Adiciona animações visuais de rotação para os ícones de seleção (selects) dos formulários
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

// Garante que o clique no ícone customizado de calendário abra o seletor nativo de datas do input
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

// Preenche automaticamente a data de manutenção para exatamente um ano após a data de cadastro escolhida
function setupSincronizacaoDatas() {
    const datCad = document.querySelector("#datCad");
    const datManutencao = document.querySelector("#datManutencao");

    if (!datCad || !datManutencao) {
        return;
    }

    datCad.addEventListener("change", () => {
        if (datCad.value) {
            const [ano, mes, dia] = datCad.value.split("-");
            const anoQueVem = parseInt(ano) + 1;
            datManutencao.value = `${anoQueVem}-${mes}-${dia}`;
        } else {
            datManutencao.value = "";
        }
    });
}

setupSincronizacaoDatas();