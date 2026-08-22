function setupAnalysisFlow() {
    const stepperLines = document.querySelectorAll(".stepper__line");
    const steps = ["separacao", "retirada", "concluido"];

    const stepElements = document.querySelectorAll("[data-step]");
    const stepPanels = document.querySelectorAll("[data-step-panel]");

    const nextStepBtn = document.querySelector("#nextStepBtn");
    const cancelRequestBtn = document.querySelector("#cancelRequestBtn");

    if (!stepElements.length || !stepPanels.length || !nextStepBtn) {
        return;
    }

    let currentStepIndex = 0;

    function updateStepper() {
        stepElements.forEach((stepElement) => {
            const stepName = stepElement.dataset.step;
            const stepIndex = steps.indexOf(stepName);

            stepElement.classList.remove("step--done", "step--active");

            if (stepIndex < currentStepIndex) {
                stepElement.classList.add("step--done");
            }

            if (stepIndex === currentStepIndex) {
                stepElement.classList.add("step--active");
            }
        });

        stepperLines.forEach((line, index) => {
            line.classList.toggle("is-filled", index < currentStepIndex);
        });
    }

    function updatePanels() {
        const currentStep = steps[currentStepIndex];

        stepPanels.forEach((panel) => {
            const isCurrentPanel = panel.dataset.stepPanel === currentStep;

            panel.classList.toggle("is-active", isCurrentPanel);
        });
    }

    // Troca display:none direto por essa classe — sem isso o botão
    // some/aparece instantaneamente e o vizinho com flex:1 pula pro
    // lugar dele, sem a transição suave de encolher (ver
    // .toolbar__actions > .btn.is-hidden em analise_solicitacao.css).
    function setButtonHidden(btn, hidden) {
        if (!btn) {
            return;
        }

        btn.classList.toggle("is-hidden", hidden);
    }

    function updateToolbar() {
        const currentStep = steps[currentStepIndex];
        const actionsContainer = nextStepBtn.closest(".toolbar__actions");

        if (currentStep === "separacao") {
            nextStepBtn.textContent = "Confirmar Separação";
            setButtonHidden(nextStepBtn, false);
            setButtonHidden(cancelRequestBtn, false);

        } else if (currentStep === "retirada") {
            nextStepBtn.textContent = "Confirmar Retirada";
            setButtonHidden(nextStepBtn, false);
            setButtonHidden(cancelRequestBtn, true);

        } else if (currentStep === "concluido") {
            setButtonHidden(nextStepBtn, true);
            setButtonHidden(cancelRequestBtn, true);
        }

        // Fecha o espaço da segunda linha da toolbar (grid, telas
        // ≤840px) só quando os dois botões de ação sumiram — é o que
        // faz a toolbar "enxutar" de vez na etapa concluído.
        if (actionsContainer) {
            const bothHidden =
                nextStepBtn.classList.contains("is-hidden") &&
                (!cancelRequestBtn || cancelRequestBtn.classList.contains("is-hidden"));

            actionsContainer.classList.toggle("toolbar__actions--empty", bothHidden);
        }
    }

    function updateAnalysisPage() {
        updateStepper();
        updatePanels();
        updateToolbar();
    }

    // Só a etapa de separação tem esse "custo" — confirmar aqui já lança a
    // saída dos frascos escolhidos no estoque, diferente de "Confirmar
    // Retirada" (que só muda status, sem mexer em saldo). Por isso o SWAL
    // de confirmação é só pra essa transição específica.
    function avancarEtapa() {
        currentStepIndex++;
        updateAnalysisPage();
    }

    function confirmarSeparacao() {
        // Mesmos números já visíveis na tela (progresso + lista de
        // frascos selecionados) — sem fonte própria de dados, só lidos do
        // DOM que frasco-search-solicitacao.js já mantém atualizado.
        const frascosSelecionados = document.querySelectorAll(".selected-flasks .request-row").length;
        const pluralFrascos = frascosSelecionados === 1 ? "" : "s";

        const progressText = document.querySelector(".analysis-progress__text strong");
        const progressMatch = progressText?.textContent.match(/(\d+)\s*\/\s*(\d+)/);
        const dentesAtual = progressMatch ? Number(progressMatch[1]) : 0;
        const dentesTotal = progressMatch ? Number(progressMatch[2]) : 0;

        // Só falta completar a seleção — nem chega a perguntar "confirmar?",
        // já avisa o que falta pra poder prosseguir. Sem essa checagem, o
        // usuário confirmaria uma separação incompleta sem perceber.
        const incompleta = dentesTotal > 0 && dentesAtual < dentesTotal;

        if (typeof Swal === "undefined") {
            if (!incompleta) {
                avancarEtapa();
            }
            return;
        }

        if (incompleta) {
            Swal.fire({
                icon: "warning",
                title: "Quantidade incompleta",
                text: "Complete a quantidade de dentes necessária para prosseguir com a solicitação.",
                confirmButtonText: "Entendi",
                buttonsStyling: false,
                customClass: {
                    confirmButton: "btn btn-primary",
                },
            });
            return;
        }

        Swal.fire({
            icon: "question",
            title: "Confirmar separação?",
            html: `Confirmar já lança a <strong>saída de ${dentesAtual} dentes</strong> dos ${frascosSelecionados} frasco${pluralFrascos} selecionado${pluralFrascos} no estoque.
            Essa ação não pode ser desfeita.`,
            showCancelButton: true,
            reverseButtons: true,
            focusCancel: true,
            confirmButtonText: "Confirmar Separação",
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

            // No projeto final (Thymeleaf): é aqui que dispara a
            // movimentação de saída dos frascos selecionados no backend,
            // antes/junto de avançar a etapa. Aqui é só o exemplo visual.
            console.log(`Separação confirmada — saída de ${dentesAtual} dentes de ${frascosSelecionados} frasco${pluralFrascos}.`);

            avancarEtapa();
        });
    }

    nextStepBtn.addEventListener("click", () => {
        if (currentStepIndex >= steps.length - 1) {
            return;
        }

        if (steps[currentStepIndex] === "separacao") {
            confirmarSeparacao();
            return;
        }

        avancarEtapa();
    });

    updateAnalysisPage();
}

// Exemplo de confirmação dupla com SweetAlert2 (ver css/components/swal.css
// pro tema) — o textarea de justificativa é o `input: "textarea"` nativo do
// SWAL2, não HTML montado na mão, então `result.value` já vem pronto pro
// backend. buttonsStyling:false + customClass reaproveitam os mesmos .btn
// usados no resto do app, em vez do azul/vermelho padrão da lib.
function setupCancelRequestModal() {
    const cancelRequestBtn = document.querySelector("#cancelRequestBtn");

    if (!cancelRequestBtn || typeof Swal === "undefined") {
        return;
    }

    cancelRequestBtn.addEventListener("click", () => {
        Swal.fire({
            icon: "warning",
            title: "Cancelar pedido?",
            text: "Essa ação não pode ser desfeita. Descreva o motivo do cancelamento.",
            input: "textarea",
            inputPlaceholder: "Justificativa...",
            inputAttributes: { "aria-label": "Motivo do cancelamento" },
            showCancelButton: true,
            reverseButtons: true,
            focusCancel: true,
            confirmButtonText: "Cancelar pedido",
            cancelButtonText: "Voltar",
            buttonsStyling: false,
            customClass: {
                confirmButton: "btn btn-outline btn-outline-danger",
                cancelButton: "btn btn-secondary",
            },
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return "Informe o motivo do cancelamento.";
                }
            },
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }

            // No projeto final (Thymeleaf): enviar result.value (motivo) pro
            // backend cancelar a solicitação. Aqui é só o exemplo visual.
            console.log("Pedido cancelado. Motivo:", result.value);
        });
    });
}

setupAnalysisFlow();
setupCancelRequestModal();