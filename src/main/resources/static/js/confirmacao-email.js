lucide.createIcons();

const RESEND_COOLDOWN_SECONDS = 30;

const panelEmail = document.getElementById("panel-email");
const panelCodigo = document.getElementById("panel-codigo");
const nomeInput = document.getElementById("confirm-nome");
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

const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

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

panelEmail.addEventListener("submit", async (event) => {
    event.preventDefault();

    nomeInput.value = nomeInput.value.trim();
    if (!nomeInput.checkValidity()) {
        nomeInput.reportValidity();
        return;
    }

    if (!emailInput.checkValidity()) {
        emailInput.reportValidity();
        return;
    }

    setButtonLoading(btnEnviar, true, "Enviando...");

    try {
        const response = await fetch("/confirmacao/enviar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify({
                nome: nomeInput.value,
                email: emailInput.value.trim()
            })
        });

        if (response.ok) {
            goToCodigoStep(emailInput.value.trim());
        } else {
            alert("Falha ao enviar o código. Tente novamente.");
        }
    } catch (error) {
        alert("Erro de conexão com o servidor.");
    } finally {
        setButtonLoading(btnEnviar, false);
    }
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

btnReenviar.addEventListener("click", async () => {
    if (btnReenviar.disabled) return;

    btnReenviar.disabled = true;
    reenviarLabel.textContent = "Reenviando...";

    try {
        await fetch("/confirmacao/enviar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify({
                nome: nomeInput.value.trim(),
                email: emailInput.value.trim()
            })
        });
        clearOtp();
        otpInputs[0].focus();
        startResendCooldown();
    } catch (error) {
        alert("Erro ao reenviar o código.");
        btnReenviar.disabled = false;
        reenviarLabel.textContent = "Reenviar código";
    }
});

function focusOtp(index) {
    const target = otpInputs[index];
    if (target) target.focus();
}

function checkCodeComplete() {
    const code = otpInputs.map((input) => input.value).join("");
    if (code.length < otpInputs.length) return;
    validateCode(code);
}

async function validateCode(code) {
    try {
        const response = await fetch("/confirmacao/validar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify({ codigo: code })
        });

        if (response.ok) {
            otpRow.classList.add("otp-row--success");
            stepperCodigo.classList.add("step--done");
            setTimeout(() => {
                window.location.href = "/frasco/painel";
            }, 900);
        } else {
            otpRow.classList.add("otp-row--error");
            otpError.hidden = false;
            setTimeout(() => {
                clearOtp();
                focusOtp(0);
            }, 900);
        }
    } catch (error) {
        console.error("Erro na validação", error);
    }
}

otpInputs.forEach((input, index) => {
    input.addEventListener("focus", () => input.select());

    input.addEventListener("input", () => {
        input.value = input.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 1);

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
        const chars = (event.clipboardData.getData("text").match(/[a-zA-Z0-9]/g) || []).slice(0, otpInputs.length);
        chars.forEach((char, i) => { otpInputs[i].value = char.toUpperCase(); });
        focusOtp(Math.min(chars.length, otpInputs.length - 1));
        checkCodeComplete();
    });
});