lucide.createIcons();

// Protótipo sem backend: não há verificação real de e-mail nem envio de
// código. RESEND_COOLDOWN_SECONDS simula o tempo mínimo entre reenvios e
// DEMO_VALID_CODE é o único código "correto" pra demonstrar o caminho de
// sucesso — qualquer outra sequência de 6 dígitos cai no caminho de erro.
const RESEND_COOLDOWN_SECONDS = 30;
const DEMO_VALID_CODE = "123456";

const panelEmail = document.getElementById("panel-email");
const panelCodigo = document.getElementById("panel-codigo");
const emailInput = document.getElementById("confirm-email");
const sentEmailLabel = document.getElementById("confirm-sent-email");
const btnEnviar = document.getElementById("btn-enviar-codigo");
const otpRow = document.getElementById("otp-row");
const otpInputs = Array.from(otpRow.querySelectorAll(".otp-input"));
const otpError = document.getElementById("otp-error");
const btnTrocarEmail = document.getElementById("btn-trocar-email");
const btnReenviar = document.getElementById("btn-reenviar");
const reenviarLabel = document.getElementById("btn-reenviar-label");
const stepperEmail = document.getElementById("stepper-email");
const stepperCodigo = document.getElementById("stepper-codigo");
const stepperLine = document.getElementById("stepper-line");

let resendTimer = null;

function setButtonLoading(button, loading, loadingText) {
    const label = button.querySelector(".btn-label");

    if (loading) {
        button.disabled = true;
        button.dataset.originalLabel = label.textContent;
        label.textContent = loadingText;
        button.classList.add("is-loading");
        return;
    }

    button.disabled = false;
    label.textContent = button.dataset.originalLabel || label.textContent;
    button.classList.remove("is-loading");
}

function clearOtp() {
    otpInputs.forEach((input) => { input.value = ""; });
    otpRow.classList.remove("otp-row--error", "otp-row--success");
    otpError.hidden = true;
}

function goToCodigoStep(email) {
    sentEmailLabel.textContent = email;

    panelEmail.hidden = true;
    panelCodigo.hidden = false;

    stepperEmail.classList.remove("step--active");
    stepperEmail.classList.add("step--done");
    stepperCodigo.classList.remove("step--done");
    stepperCodigo.classList.add("step--active");
    stepperLine.classList.add("is-filled");

    clearOtp();
    otpInputs[0].focus();
    startResendCooldown();
}

function goToEmailStep() {
    panelCodigo.hidden = true;
    panelEmail.hidden = false;

    stepperCodigo.classList.remove("step--active", "step--done");
    stepperEmail.classList.remove("step--done");
    stepperEmail.classList.add("step--active");
    stepperLine.classList.remove("is-filled");

    clearInterval(resendTimer);
    emailInput.focus();
    emailInput.select();
}

panelEmail.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!emailInput.checkValidity()) {
        emailInput.reportValidity();
        return;
    }

    setButtonLoading(btnEnviar, true, "Enviando...");

    // Simula o tempo de envio/validação do e-mail — não há requisição
    // real neste protótipo.
    setTimeout(() => {
        setButtonLoading(btnEnviar, false);
        goToCodigoStep(emailInput.value.trim());
    }, 900);
});

btnTrocarEmail.addEventListener("click", goToEmailStep);

function startResendCooldown() {
    clearInterval(resendTimer);

    let secondsLeft = RESEND_COOLDOWN_SECONDS;
    btnReenviar.disabled = true;
    reenviarLabel.textContent = `Reenviar em 0:${String(secondsLeft).padStart(2, "0")}`;

    resendTimer = setInterval(() => {
        secondsLeft -= 1;

        if (secondsLeft <= 0) {
            clearInterval(resendTimer);
            btnReenviar.disabled = false;
            reenviarLabel.textContent = "Reenviar código";
            return;
        }

        reenviarLabel.textContent = `Reenviar em 0:${String(secondsLeft).padStart(2, "0")}`;
    }, 1000);
}

btnReenviar.addEventListener("click", () => {
    if (btnReenviar.disabled) return;

    btnReenviar.disabled = true;
    reenviarLabel.textContent = "Reenviando...";

    setTimeout(() => {
        clearOtp();
        otpInputs[0].focus();
        startResendCooldown();
    }, 700);
});

// --- Campos do código (6 dígitos) ---

function focusOtp(index) {
    const target = otpInputs[index];
    if (target) target.focus();
}

function checkCodeComplete() {
    const code = otpInputs.map((input) => input.value).join("");
    if (code.length < otpInputs.length) return;

    validateCode(code);
}

function validateCode(code) {
    if (code === DEMO_VALID_CODE) {
        otpRow.classList.add("otp-row--success");
        stepperCodigo.classList.add("step--done");

        setTimeout(() => {
            window.location.href = "./historico_solicitacoes.html";
        }, 900);
        return;
    }

    otpRow.classList.add("otp-row--error");
    otpError.hidden = false;

    setTimeout(() => {
        clearOtp();
        focusOtp(0);
    }, 900);
}

otpInputs.forEach((input, index) => {
    input.addEventListener("focus", () => input.select());

    input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 1);

        otpRow.classList.remove("otp-row--error", "otp-row--success");
        otpError.hidden = true;

        if (input.value && index < otpInputs.length - 1) {
            focusOtp(index + 1);
        }

        checkCodeComplete();
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !input.value && index > 0) {
            focusOtp(index - 1);
            return;
        }

        if (event.key === "ArrowLeft" && index > 0) {
            focusOtp(index - 1);
            return;
        }

        if (event.key === "ArrowRight" && index < otpInputs.length - 1) {
            focusOtp(index + 1);
        }
    });

    input.addEventListener("paste", (event) => {
        event.preventDefault();

        const digits = (event.clipboardData.getData("text").match(/\d/g) || []).slice(0, otpInputs.length);
        digits.forEach((digit, i) => { otpInputs[i].value = digit; });

        focusOtp(Math.min(digits.length, otpInputs.length - 1));
        checkCodeComplete();
    });
});
