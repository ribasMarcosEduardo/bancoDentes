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

    function updateToolbar() {
        const currentStep = steps[currentStepIndex];

        if (currentStep === "separacao") {
            nextStepBtn.textContent = "Confirmar Separação";
            nextStepBtn.style.display = "inline-flex";

            if (cancelRequestBtn) {
                cancelRequestBtn.style.display = "inline-flex";
            }

        } else if (currentStep === "retirada") {
            nextStepBtn.textContent = "Confirmar Retirada";
            nextStepBtn.style.display = "inline-flex";

            if (cancelRequestBtn) {
                cancelRequestBtn.style.display = "none";
            }

        } else if (currentStep === "concluido") {
            nextStepBtn.style.display = "none";

            if (cancelRequestBtn) {
                cancelRequestBtn.style.display = "none";
            }
        }
    }

    function updateAnalysisPage() {
        updateStepper();
        updatePanels();
        updateToolbar();
    }

    nextStepBtn.addEventListener("click", () => {
        if (currentStepIndex < steps.length - 1) {
            currentStepIndex++;
            updateAnalysisPage();
        }
    });

    updateAnalysisPage();
}

setupAnalysisFlow();