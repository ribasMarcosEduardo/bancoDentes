function setupManutencaoConcluirModal() {
    const overlay = document.querySelector("#modalConcluirManutencao");
    const resultsView = document.querySelector("#resultsView");

    if (!overlay) return;

    const closeBtn = document.querySelector("#modalConcluirManutencaoClose");
    const cancelBtn = document.querySelector("#modalConcluirManutencaoCancelar");
    const confirmBtn = document.querySelector("#modalConcluirManutencaoConfirmar");

    const codigoEl = document.querySelector("#modalConcluirManutencaoCodigo");
    const grupoEl = document.querySelector("#modalConcluirManutencaoGrupo");
    const estadoEl = document.querySelector("#modalConcluirManutencaoEstado");
    const localEl = document.querySelector("#modalConcluirManutencaoLocal");
    const origemEl = document.querySelector("#modalConcluirManutencaoOrigem");
    const detalhesEl = overlay.querySelector(".manutencao-detalhes");
    const qtdAtualEl = document.querySelector("#modalConcluirManutencaoQtdAtual");

    const qtdInput = document.querySelector("#modalConcluirManutencaoQtdNova");
    const qtdDownBtn = overlay.querySelector("[data-number-action='down']");
    const qtdUpBtn = overlay.querySelector("[data-number-action='up']");

    if (!qtdInput) return;

    let linhaAtual = null;
    let codManutencaoAtual = null;

    // "fonte" é quem carrega os data-* do frasco: a linha no painel de
    // manutenções, ou o próprio botão no painel de frascos (lá o mesmo
    // frasco aparece em linha, área expandida e card).
    function open(fonte, codManutencao) {
        linhaAtual = fonte;
        codManutencaoAtual = codManutencao;

        const { codigo = "---", grupo = "---", estado = "---", local = "---", origem = "---", qtd = "0" } = fonte.dataset;
        const qtdAtual = Number(qtd) || 0;

        // data-* vazio ("") quando o campo não existe no frasco - o
        // default da desestruturação só cobre atributo ausente
        if (codigoEl) codigoEl.textContent = codigo || "---";
        if (grupoEl) grupoEl.textContent = grupo || "---";
        if (estadoEl) estadoEl.textContent = estado || "---";
        if (localEl) localEl.textContent = local || "---";
        if (origemEl) origemEl.textContent = origem || "---";

        // Cada abertura começa com os detalhes recolhidos
        if (detalhesEl) detalhesEl.open = false;

        if (qtdAtualEl) qtdAtualEl.textContent = String(qtdAtual);

        qtdInput.max = String(qtdAtual);
        qtdInput.min = "0";
        qtdInput.value = String(qtdAtual);

        overlay.classList.add("is-open");
        document.body.classList.add("modal-open");
    }

    function close() {
        overlay.classList.remove("is-open");
        document.body.classList.remove("modal-open");
        linhaAtual = null;
        codManutencaoAtual = null;
        stopRepeat();
    }

    function clampQtdInput() {
        const max = Number(qtdInput.max || 0);
        const min = Number(qtdInput.min || 0);
        let valor = Number(qtdInput.value);

        if (Number.isNaN(valor)) valor = min;

        valor = Math.min(Math.max(valor, min), max);
        qtdInput.value = String(valor);
    }

    (resultsView || document).addEventListener("click", (event) => {
        const trigger = event.target.closest(".js-concluir-manutencao");
        if (!trigger || trigger.disabled) return;

        const fonte = trigger.closest("[data-qtd]");
        if (!fonte) return;

        open(fonte, trigger.dataset.id);
    });

    closeBtn?.addEventListener("click", close);
    cancelBtn?.addEventListener("click", close);

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) close();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && overlay.classList.contains("is-open")) close();
    });

    let repeatTimeout;
    let repeatInterval;

    function stopRepeat() {
        clearTimeout(repeatTimeout);
        clearInterval(repeatInterval);
    }

    function changeQtd(direction) {
        if (direction === "up") qtdInput.stepUp();
        if (direction === "down") qtdInput.stepDown();

        clampQtdInput();
    }

    function startRepeat(direction) {
        changeQtd(direction);

        repeatTimeout = setTimeout(() => {
            repeatInterval = setInterval(() => changeQtd(direction), 80);
        }, 350);
    }

    qtdUpBtn?.addEventListener("pointerdown", () => startRepeat("up"));
    qtdDownBtn?.addEventListener("pointerdown", () => startRepeat("down"));

    ["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
        qtdUpBtn?.addEventListener(eventName, stopRepeat);
        qtdDownBtn?.addEventListener(eventName, stopRepeat);
    });

    qtdInput.addEventListener("input", clampQtdInput);
    qtdInput.addEventListener("blur", clampQtdInput);

    confirmBtn?.addEventListener("click", async () => {
        if (!linhaAtual) return;

        clampQtdInput();

        const codManutencao = codManutencaoAtual;

        const codigo = linhaAtual.dataset.codigo || "---";
        const novaQuantidade = Number(qtdInput.value);

        if (!codManutencao) {
            ToastError.fire({ icon: "error", title: "Não foi possível identificar esta manutenção." });
            return;
        }

        try {
            const response = await fetch(`/manutencao/concluir/${codManutencao}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantidadeCalculada: novaQuantidade })
            });

            if (!response.ok) throw new Error("Erro ao concluir manutenção no servidor.");

            close();

            // Toast de sucesso depois do reload (flash em sessionStorage,
            // ver setupFlashToast em includes.js)
            sessionStorage.setItem(
                FLASH_TOAST_KEY,
                `Manutenção do frasco <strong>${codigo}</strong> concluída. Quantidade atualizada para <strong>${novaQuantidade}</strong> dentes.`
            );
            location.reload();

        } catch (error) {
            console.error(error);
            ToastError.fire({ icon: "error", title: "Não foi possível concluir a manutenção." });
        }
    });
}

document.addEventListener("DOMContentLoaded", setupManutencaoConcluirModal);